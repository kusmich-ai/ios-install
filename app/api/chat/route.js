// app/api/chat/route.js
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { 
  calculateAdherence, 
  calculateConsecutiveDays,
  getStagePractices,
  getPracticeName,
  checkUnlockEligibility,
  calculateDeltas,
  calculateRewiredIndex,
  getTier
} from '@/lib/progress-utils';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Define tools for Claude to use
const tools = [
  {
    name: "log_practice_completion",
    description: "Log when a user completes a practice. Call this when the user confirms they have finished a practice like breathing, awareness rep, somatic flow, etc. This updates their adherence tracking and progress.",
    input_schema: {
      type: "object",
      properties: {
        practice_type: {
          type: "string",
          enum: ["hrvb", "awareness_rep", "somatic_flow", "micro_action", "flow_block", "co_regulation", "nightly_debrief"],
          description: "The type of practice completed"
        },
        notes: {
          type: "string",
          description: "Optional notes about the practice session (quality, duration, observations)"
        }
      },
      required: ["practice_type"]
    }
  },
  {
    name: "get_practice_status",
    description: "Get the user's current practice status for today, including which practices are completed and adherence stats. Use this to understand what the user has done today.",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "record_weekly_check_in",
    description: "Record the user's weekly domain scores during their weekly check-in. Call this when the user provides their 4 domain ratings (regulation, awareness, outlook, attention on 0-5 scale).",
    input_schema: {
      type: "object",
      properties: {
        regulation: {
          type: "number",
          description: "Regulation/Calm score (0-5)"
        },
        awareness: {
          type: "number",
          description: "Awareness/Decentering score (0-5)"
        },
        outlook: {
          type: "number",
          description: "Outlook/Emotion score (0-5)"
        },
        attention: {
          type: "number",
          description: "Attention/Focus score (0-5)"
        }
      },
      required: ["regulation", "awareness", "outlook", "attention"]
    }
  },
  {
    name: "check_unlock_eligibility",
    description: "Check if the user is eligible to unlock the next stage. Use this when discussing progress or when the user asks about advancing.",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "unlock_next_stage",
    description: "Unlock the next stage for the user. Only call this after confirming eligibility and user wants to proceed.",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  }
];

// Tool execution functions
async function executeTool(toolName, toolInput, userId) {
  switch (toolName) {
    case 'log_practice_completion':
      return await logPracticeCompletion(userId, toolInput);
    case 'get_practice_status':
      return await getPracticeStatus(userId);
    case 'record_weekly_check_in':
      return await recordWeeklyCheckIn(userId, toolInput);
    case 'check_unlock_eligibility':
      return await checkUnlockEligibilityTool(userId);
    case 'unlock_next_stage':
      return await unlockNextStageTool(userId);
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

async function logPracticeCompletion(userId, { practice_type, notes }) {
  try {
    // Get user's current stage
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('current_stage')
      .eq('user_id', userId)
      .single();

    const currentStage = progressData?.current_stage || 1;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Check if already logged today
    const { data: existingLog } = await supabase
      .from('practice_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('practice_type', practice_type)
      .eq('practice_date', today)
      .single();

    if (existingLog) {
      // Update existing
      await supabase
        .from('practice_logs')
        .update({
          completed: true,
          completed_at: now,
          notes
        })
        .eq('id', existingLog.id);
    } else {
      // Insert new
      await supabase
        .from('practice_logs')
        .insert({
          user_id: userId,
          practice_type: practice_type,
          stage: currentStage,
          completed: true,
          completed_at: now,
          practice_date: today,
          notes
        });
    }

    // Recalculate adherence
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const startDate = fourteenDaysAgo.toISOString().split('T')[0];

    const { data: recentLogs } = await supabase
      .from('practice_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('practice_date', startDate)
      .order('practice_date', { ascending: false });

    const adherencePercentage = calculateAdherence(recentLogs || [], currentStage, 14);
    const consecutiveDays = calculateConsecutiveDays(recentLogs || [], currentStage);

    // Update progress
    await supabase
      .from('user_progress')
      .update({
        adherence_percentage: adherencePercentage,
        consecutive_days: consecutiveDays
      })
      .eq('user_id', userId);

    // Get today's status
    const { data: todayLogs } = await supabase
      .from('practice_logs')
      .select('practice_type, completed')
      .eq('user_id', userId)
      .eq('practice_date', today);

    const requiredPractices = getStagePractices(currentStage);
    const completedToday = todayLogs?.filter(l => l.completed).map(l => l.practice_type) || [];
    const remainingToday = requiredPractices.filter(p => !completedToday.includes(p));

    return {
      success: true,
      message: `${getPracticeName(practice_type)} logged successfully!`,
      adherencePercentage,
      consecutiveDays,
      completedToday: completedToday.map(p => getPracticeName(p)),
      remainingToday: remainingToday.map(p => getPracticeName(p)),
      allCompleteToday: remainingToday.length === 0
    };
  } catch (error) {
    console.error('Error logging practice:', error);
    return { error: error.message };
  }
}

async function getPracticeStatus(userId) {
  try {
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    const currentStage = progressData?.current_stage || 1;
    const today = new Date().toISOString().split('T')[0];

    const { data: todayLogs } = await supabase
      .from('practice_logs')
      .select('practice_type, completed, completed_at')
      .eq('user_id', userId)
      .eq('practice_date', today);

    const requiredPractices = getStagePractices(currentStage);
    const practiceStatus = requiredPractices.map(p => {
      const log = todayLogs?.find(l => l.practice_type === p);
      return {
        practice: getPracticeName(p),
        practiceId: p,
        completed: log?.completed || false,
        completedAt: log?.completed_at || null
      };
    });

    const completedCount = practiceStatus.filter(p => p.completed).length;
    const totalCount = practiceStatus.length;

    return {
      currentStage,
      today: today,
      practices: practiceStatus,
      summary: `${completedCount}/${totalCount} practices completed today`,
      adherencePercentage: progressData?.adherence_percentage || 0,
      consecutiveDays: progressData?.consecutive_days || 0,
      allCompleteToday: completedCount === totalCount
    };
  } catch (error) {
    console.error('Error getting practice status:', error);
    return { error: error.message };
  }
}

async function recordWeeklyCheckIn(userId, scores) {
  try {
    const { regulation, awareness, outlook, attention } = scores;

    // Validate scores
    const allValid = [regulation, awareness, outlook, attention].every(
      s => typeof s === 'number' && s >= 0 && s <= 5
    );

    if (!allValid) {
      return { error: 'All scores must be numbers between 0 and 5' };
    }

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartDate = weekStart.toISOString().split('T')[0];

    const averageScore = (regulation + awareness + outlook + attention) / 4;

    // Upsert weekly delta
    await supabase
      .from('weekly_deltas')
      .upsert({
        user_id: userId,
        week_start_date: weekStartDate,
        regulation_score: regulation,
        awareness_score: awareness,
        outlook_score: outlook,
        attention_score: attention,
        average_score: averageScore
      }, {
        onConflict: 'user_id,week_start_date'
      });

    // Get baseline for delta calculation
    const { data: baselineData } = await supabase
      .from('baseline_assessments')
      .select('*')
      .eq('user_id', userId)
      .single();

    const baselineScores = {
      regulation: baselineData?.calm_core_score || 0,
      awareness: baselineData?.observer_index_score || 0,
      outlook: baselineData?.vitality_index_score || 0,
      attention: ((baselineData?.focus_diagnostic_score || 0) + (baselineData?.presence_test_score || 0)) / 2
    };

    const currentScores = { regulation, awareness, outlook, attention };
    const deltas = calculateDeltas(baselineScores, currentScores);
    const newRewiredIndex = calculateRewiredIndex(currentScores);
    const tier = getTier(newRewiredIndex);

    // Update user_progress with deltas
    await supabase
      .from('user_progress')
      .update({
        regulation_delta: deltas.regulation,
        awareness_delta: deltas.awareness,
        outlook_delta: deltas.outlook,
        attention_delta: deltas.attention
      })
      .eq('user_id', userId);

    return {
      success: true,
      message: 'Weekly check-in recorded!',
      currentScores,
      deltas,
      rewiredIndex: newRewiredIndex,
      tier: tier.name,
      averageDelta: deltas.average
    };
  } catch (error) {
    console.error('Error recording weekly check-in:', error);
    return { error: error.message };
  }
}

async function checkUnlockEligibilityTool(userId) {
  try {
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: baselineData } = await supabase
      .from('baseline_assessments')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: latestDelta } = await supabase
      .from('weekly_deltas')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })
      .limit(1)
      .single();

    const baselineScores = {
      regulation: baselineData?.calm_core_score || 0,
      awareness: baselineData?.observer_index_score || 0,
      outlook: baselineData?.vitality_index_score || 0,
      attention: ((baselineData?.focus_diagnostic_score || 0) + (baselineData?.presence_test_score || 0)) / 2
    };

    const currentScores = latestDelta ? {
      regulation: latestDelta.regulation_score,
      awareness: latestDelta.awareness_score,
      outlook: latestDelta.outlook_score,
      attention: latestDelta.attention_score
    } : baselineScores;

    const deltas = calculateDeltas(baselineScores, currentScores);

    const result = checkUnlockEligibility({
      currentStage: progressData.current_stage,
      adherencePercentage: progressData.adherence_percentage,
      consecutiveDays: progressData.consecutive_days,
      deltas,
      baselineScores,
      currentScores
    });

    return {
      currentStage: progressData.current_stage,
      nextStage: progressData.current_stage + 1,
      ...result
    };
  } catch (error) {
    console.error('Error checking unlock eligibility:', error);
    return { error: error.message };
  }
}

async function unlockNextStageTool(userId) {
  try {
    // First verify eligibility
    const eligibility = await checkUnlockEligibilityTool(userId);
    
    if (eligibility.error) {
      return eligibility;
    }

    if (!eligibility.eligible) {
      return {
        success: false,
        message: 'Not eligible for unlock yet',
        missing: eligibility.missing
      };
    }

    const { data: progressData } = await supabase
      .from('user_progress')
      .select('current_stage')
      .eq('user_id', userId)
      .single();

    const newStage = progressData.current_stage + 1;

    if (newStage > 7) {
      return {
        success: false,
        message: 'Already at maximum stage (7)'
      };
    }

    // Perform unlock
    await supabase
      .from('user_progress')
      .update({
        current_stage: newStage,
        stage_start_date: new Date().toISOString(),
        consecutive_days: 0 // Reset for new stage
      })
      .eq('user_id', userId);

    const stageNames = {
      2: 'Embodied Awareness',
      3: 'Identity Mode',
      4: 'Flow Mode',
      5: 'Relational Coherence',
      6: 'Integration',
      7: 'Accelerated Expansion'
    };

    const newPractices = getStagePractices(newStage);
    const addedPractice = newPractices[newPractices.length - 1]; // Last practice is the new one

    return {
      success: true,
      newStage,
      stageName: stageNames[newStage],
      message: `Stage ${newStage} (${stageNames[newStage]}) unlocked!`,
      newPractice: getPracticeName(addedPractice),
      allPractices: newPractices.map(p => getPracticeName(p))
    };
  } catch (error) {
    console.error('Error unlocking stage:', error);
    return { error: error.message };
  }
}

// Read system prompt from file
function loadSystemPrompt() {
  try {
    const promptPath = path.join(process.cwd(), 'instructions', 'system-prompt.txt');
    return fs.readFileSync(promptPath, 'utf-8');
  } catch (error) {
    console.error('Error loading system prompt:', error);
    return `You are the IOS System Installer. Guide users through the installation process.`;
  }
}

export async function POST(req) {
  try {
    const { messages, userId, baselineData } = await req.json();

    // Load system prompt from file
    let systemContext = loadSystemPrompt();

    // Append current user context
    if (baselineData) {
      systemContext += `\n\n=== CURRENT USER CONTEXT ===
User ID: ${userId}
REwired Index: ${baselineData.rewiredIndex}/100
Tier: ${baselineData.tier}
Current Stage: ${baselineData.currentStage}
Domain Scores:
- Regulation: ${baselineData.domainScores.regulation}/5
- Awareness: ${baselineData.domainScores.awareness}/5
- Outlook: ${baselineData.domainScores.outlook}/5
- Attention: ${baselineData.domainScores.attention}/5

=== TOOL USAGE INSTRUCTIONS ===
You have tools to track user progress. USE THEM:

1. When user says they completed a practice (breathing, awareness rep, etc.) → call log_practice_completion
2. When you want to check what they've done today → call get_practice_status
3. During weekly check-ins when they give you 4 scores → call record_weekly_check_in
4. When discussing progress or they ask about advancing → call check_unlock_eligibility
5. When user is eligible and wants to unlock → call unlock_next_stage

ALWAYS log practice completions when confirmed. This is critical for tracking.`;
    }

    // Initial API call
    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: systemContext,
      tools: tools,
      messages: messages,
    });

    // Handle tool use loop
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(block => block.type === 'tool_use');
      const toolResults = [];

      for (const toolUse of toolUseBlocks) {
        console.log(`Executing tool: ${toolUse.name}`, toolUse.input);
        const result = await executeTool(toolUse.name, toolUse.input, userId);
        console.log(`Tool result:`, result);

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result)
        });
      }

      // Continue conversation with tool results
      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        system: systemContext,
        tools: tools,
        messages: [
          ...messages,
          { role: 'assistant', content: response.content },
          { role: 'user', content: toolResults }
        ],
      });
    }

    return Response.json({
      content: response.content,
      id: response.id,
      model: response.model,
      role: response.role,
      stop_reason: response.stop_reason,
      usage: response.usage,
    });

  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
