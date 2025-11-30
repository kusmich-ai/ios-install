// Morning Micro-Action (Identity Installation Protocol) Templates
// Hybrid approach: Templates for structure, API for adaptive coaching

export type MicroActionSetupStep = 
  | 'detect_context'      // First-time or returning?
  | 'welcome_first'       // First-time welcome
  | 'welcome_returning'   // Returning user check-in
  | 'friction_discovery'  // "What feels misaligned?"
  | 'friction_followup'   // API: Reflect and probe deeper
  | 'identity_type'       // Subtractive vs Additive diagnosis
  | 'identity_phrasing'   // Help them phrase the identity
  | 'identity_refinement' // API: If phrasing needs work
  | 'filter_concrete'     // 4-C Filter 1
  | 'filter_coherent'     // 4-C Filter 2
  | 'filter_containable'  // 4-C Filter 3
  | 'filter_compelling'   // 4-C Filter 4
  | 'filter_refinement'   // API: If any filter fails
  | 'action_discovery'    // "What micro-action would prove this?"
  | 'action_atomic'       // ACE Test 1
  | 'action_congruent'    // ACE Test 2
  | 'action_emotional'    // ACE Test 3
  | 'action_refinement'   // API: If any test fails
  | 'contract_creation'   // Generate the contract
  | 'mechanics'           // Explain execution
  | 'commitment'          // Ask for commitment
  | 'close'               // Final close
  | 'complete';           // Setup finished

export interface MicroActionSetupState {
  step: MicroActionSetupStep;
  isFirstTime: boolean | null;
  previousIdentity: string | null;
  previousAction: string | null;
  
  // Discovery data
  frictionDescription: string | null;
  identityType: 'subtractive' | 'additive' | null;
  
  // Identity data
  chosenIdentity: string | null;
  identityPassedFilters: {
    concrete: boolean;
    coherent: boolean;
    containable: boolean;
    compelling: boolean;
  };
  filterAttempts: number;
  
  // Action data
  chosenAction: string | null;
  actionPassedTests: {
    atomic: boolean;
    congruent: boolean;
    emotional: boolean;
  };
  actionAttempts: number;
  
  // Final
  committed: boolean;
  sprintStartDate: string | null;
}

export const initialMicroActionState: MicroActionSetupState = {
  step: 'detect_context',
  isFirstTime: null,
  previousIdentity: null,
  previousAction: null,
  frictionDescription: null,
  identityType: null,
  chosenIdentity: null,
  identityPassedFilters: {
    concrete: false,
    coherent: false,
    containable: false,
    compelling: false
  },
  filterAttempts: 0,
  chosenAction: null,
  actionPassedTests: {
    atomic: false,
    congruent: false,
    emotional: false
  },
  actionAttempts: 0,
  committed: false,
  sprintStartDate: null
};

// ============================================
// TEMPLATE MESSAGES
// ============================================

export const microActionTemplates = {
  
  // Step 0: Context Detection
  detect_context: {
    message: `Let's set up your Morning Micro-Action — the identity installation protocol.

Is this your first Identity Sprint, or have you done this before?`,
    quickReplies: ['First time', 'I\'ve done this before']
  },

  // Step 0a: First-time Welcome
  welcome_first: {
    message: `Beautiful. Welcome.

This is designed to train your mental operating system to allow the best parts of you to show up fully every day.

Here's how it works:
• Over the next 21 days, you'll act as a specific identity
• Not as an affirmation or aspiration — as **evidence-based training**
• Each morning, you'll complete one micro-action that proves you are this person

By day 21, it won't feel like effort. It'll feel like you.

Ready to discover your identity?`,
    quickReplies: ['Yes, let\'s do it']
  },

  // Step 0b: Returning User Welcome
  welcome_returning: {
    message: `Welcome back.

Your previous identity was: **"{{previousIdentity}}"**
Your micro-action was: **{{previousAction}}**

How did that identity feel over the last 21 days? What landed? What shifted?`,
    requiresInput: true,
    // After response, API determines: evolution, layer, or fresh start
  },

  // Step 1: Friction Discovery
  friction_discovery: {
    message: `Is there currently somewhere in your life that feels misaligned with who you are?

It could be internal (thoughts, reactive energy, overwhelm) or external (relationships, work, health).

Just name what's present — what's coming up for you that we can work with.`,
    requiresInput: true,
    // After response, API reflects back and probes deeper if needed
  },

  // Step 2: Identity Type Diagnosis
  identity_type: {
    message: `I hear that. Let me ask:

Do you feel like you have the capacity to show up the way you want — you're just not doing it consistently?

Or does it feel like there's too much coming at you right now — like your system needs to settle before you can expand?`,
    quickReplies: ['I have the capacity, just not consistent', 'Too much coming at me, need to settle']
  },

  // Step 2a: Additive path
  identity_type_additive: {
    message: `Got it. You're stable but under-expressed. We're looking for an **expansive** identity — one that helps you show up more fully.

Based on what you shared about {{frictionSummary}}, what's the inverse quality you'd like to embody instead?

Try phrasing it as: "I'm someone who..."`,
    requiresInput: true
  },

  // Step 2b: Subtractive path  
  identity_type_subtractive: {
    message: `Got it. Your system needs regulation first. We're looking for a **stabilizing** identity — one that helps you settle and ground.

Based on what you shared about {{frictionSummary}}, what quality would help you feel more regulated?

Try phrasing it as: "I am..." or "I'm someone who..."`,
    requiresInput: true
  },

  // Step 3: Identity Confirmation
  identity_confirmation: {
    message: `So the identity you're working with is:

**"{{chosenIdentity}}"**

Say it out loud or internally — does it feel light and true, or tense?`,
    quickReplies: ['Feels right', 'Something feels off']
  },

  // ============================================
  // 4-C FILTER (One at a time)
  // ============================================

  filter_concrete: {
    message: `Let's make sure this identity is solid.

**First question:** Could someone see evidence of this in 60 seconds? When you're being this person, what would I observe if I were in the room?`,
    requiresInput: true,
    // Evaluate response - if vague, API helps refine
  },

  filter_concrete_pass: {
    message: `Good — that's concrete and observable. ✓

**Next question:** Does this feel like an upgrade of who you already are, not a costume? Does it align with your values and what matters to you?`,
    quickReplies: ['Yes, it aligns', 'Not sure / something feels off']
  },

  filter_coherent: {
    message: `Does "{{chosenIdentity}}" feel like an upgrade of who you already are — not a costume?

Does it align with your values and what matters to you?`,
    quickReplies: ['Yes, it aligns', 'Something feels off']
  },

  filter_coherent_pass: {
    message: `That's coherent — it's authentically you, just elevated. ✓

**Next:** Can you prove this identity with one small action each day? Not perfection all day long — just one micro-moment of evidence.`,
    quickReplies: ['Yes, I can see that', 'Hmm, might be too big']
  },

  filter_containable: {
    message: `Can you prove "{{chosenIdentity}}" with one small action each day?

Not perfection all day long — just one micro-moment of evidence.`,
    quickReplies: ['Yes, I can see that', 'Might be too big']
  },

  filter_containable_pass: {
    message: `Good — it's containable into daily proof. ✓

**Final check:** Does saying "{{chosenIdentity}}" light up your chest, not just your head? Does it feel emotionally true right now — not someday?`,
    quickReplies: ['Yes, I feel it', 'It\'s more intellectual']
  },

  filter_compelling: {
    message: `Last filter: Does saying "{{chosenIdentity}}" light up your chest, not just your head?

Does it feel emotionally true *right now* — not someday?`,
    quickReplies: ['Yes, I feel it', 'It\'s more intellectual / not quite']
  },

  filter_compelling_pass: {
    message: `All four filters passed. Your identity is locked in:

**"{{chosenIdentity}}"** ✓

Now let's design the proof action.`,
  },

  // Filter failure - triggers API for coaching
  filter_fail: {
    // API handles this - reflects what's off and helps refine
    requiresAPI: true
  },

  // ============================================
  // ACE ACTION DESIGN (One test at a time)
  // ============================================

  action_discovery: {
    message: `What's one micro-interaction — something you could do in under 5 minutes each morning — that would prove you are "{{chosenIdentity}}"?`,
    requiresInput: true
  },

  action_atomic: {
    message: `Your proposed action: **{{chosenAction}}**

**Reality check:** Could you do this even on a chaotic morning? 

What if you're running late, didn't sleep well, or everything's going sideways — does it still feel doable?`,
    quickReplies: ['Yes, even on hard days', 'Might be too much on bad days']
  },

  action_atomic_pass: {
    message: `Good — it's atomic. Even your worst day can't stop it. ✓

**Next:** If I saw you doing this, would I recognize the identity you're training? Does "{{chosenAction}}" clearly prove you're being "{{chosenIdentity}}"?`,
    quickReplies: ['Yes, it clearly shows it', 'The connection isn\'t obvious']
  },

  action_congruent: {
    message: `If I watched you do "{{chosenAction}}" — would I recognize the identity "{{chosenIdentity}}"?

Does the behavior clearly prove who you're being?`,
    quickReplies: ['Yes, clearly', 'The connection could be stronger']
  },

  action_congruent_pass: {
    message: `The action proves the identity — congruent. ✓

**Final check:** Does this feel like alignment, not obligation? Does it create a sense of pride or calm — not pressure?`,
    quickReplies: ['Feels like alignment', 'Feels a bit like pressure']
  },

  action_emotional: {
    message: `Does "{{chosenAction}}" feel like alignment, not obligation?

Does completing it create a sense of pride or calm — not pressure or "should"?`,
    quickReplies: ['Alignment, not obligation', 'Has some "should" energy']
  },

  action_emotional_pass: {
    message: `All three tests passed. Your micro-action is locked:

**"{{chosenAction}}"** ✓

Let's create your identity contract.`,
  },

  // Action test failure - triggers API for coaching
  action_fail: {
    requiresAPI: true
  },

  // ============================================
  // CONTRACT & CLOSE
  // ============================================

  contract_creation: {
    message: `Here's your Identity Contract for the next 21 days:

---
**Identity:** {{chosenIdentity}}
**Daily Micro-Action:** {{chosenAction}}

*Each completion = proof. Each proof = reinforcement.*

---

**The Mechanics:**
Each morning, after your other rituals, {{actionMechanics}}.

When it's done, internally acknowledge: *"I acted as {{chosenIdentity}}. Evidence logged."*

That acknowledgment closes the loop and reinforces the identity.`,
  },

  commitment: {
    message: `Will you commit to this micro-action for the next 21 days?`,
    quickReplies: ['Yes, I commit', 'I need to adjust something']
  },

  close: {
    message: `**Identity Installation initiated.** ✓

**Your 21-day sprint starts now.**

Identity: {{chosenIdentity}}
Micro-Action: {{chosenAction}}
Sprint ends: {{sprintEndDate}}

---

**Your updated morning ritual sequence:**
1. Resonance Breathing - 5 mins
2. Awareness Rep - 2 mins
3. Somatic Flow - 3 mins
4. Morning Micro-Action - {{chosenAction}}

Total: ~12-13 minutes

---

Some mornings will feel easy and connected. Some will feel mechanical or rushed. Both count. You're not chasing perfection — you're training consistency.

By week 2, you'll notice when you *don't* do it — that slight sense of misalignment. That's the signal it's integrating.

By week 3, it'll start to feel like just who you are.

**Tomorrow morning:** Complete your rituals in order, finishing with your Micro-Action.`,
  },

  // ============================================
  // MID-SPRINT CHECK-IN (accessed later)
  // ============================================

  mid_sprint_checkin: {
    message: `You're on Day {{currentDay}} of your 21-day sprint.

Identity: **{{chosenIdentity}}**
Micro-Action: **{{chosenAction}}**

What's coming up? Is something feeling misaligned, or do you want to refine the action?`,
    requiresInput: true
  },

  mid_sprint_decision: {
    message: `Based on what you shared — is this a new direction entirely, or a refinement of the same intention?`,
    quickReplies: ['New direction (restart 21 days)', 'Refinement (continue from today)']
  }
};

// ============================================
// STATE MACHINE TRANSITIONS
// ============================================

export function getNextMicroActionStep(
  currentStep: MicroActionSetupStep,
  state: MicroActionSetupState,
  userResponse?: string
): { nextStep: MicroActionSetupStep; requiresAPI: boolean } {
  
  switch (currentStep) {
    case 'detect_context':
      if (userResponse?.toLowerCase().includes('first')) {
        return { nextStep: 'welcome_first', requiresAPI: false };
      } else {
        return { nextStep: 'welcome_returning', requiresAPI: false };
      }
    
    case 'welcome_first':
      return { nextStep: 'friction_discovery', requiresAPI: false };
    
    case 'welcome_returning':
      // API processes their reflection on previous identity
      return { nextStep: 'friction_followup', requiresAPI: true };
    
    case 'friction_discovery':
      // API reflects back and probes deeper
      return { nextStep: 'friction_followup', requiresAPI: true };
    
    case 'friction_followup':
      return { nextStep: 'identity_type', requiresAPI: false };
    
    case 'identity_type':
      // Based on their answer, go to appropriate phrasing prompt
      return { nextStep: 'identity_phrasing', requiresAPI: false };
    
    case 'identity_phrasing':
      // API evaluates their identity phrasing
      return { nextStep: 'identity_refinement', requiresAPI: true };
    
    case 'identity_refinement':
      // If identity confirmed, start filters
      return { nextStep: 'filter_concrete', requiresAPI: false };
    
    case 'filter_concrete':
      // API evaluates if response is concrete enough
      if (state.identityPassedFilters.concrete) {
        return { nextStep: 'filter_coherent', requiresAPI: false };
      }
      return { nextStep: 'filter_refinement', requiresAPI: true };
    
    case 'filter_coherent':
      if (state.identityPassedFilters.coherent) {
        return { nextStep: 'filter_containable', requiresAPI: false };
      }
      return { nextStep: 'filter_refinement', requiresAPI: true };
    
    case 'filter_containable':
      if (state.identityPassedFilters.containable) {
        return { nextStep: 'filter_compelling', requiresAPI: false };
      }
      return { nextStep: 'filter_refinement', requiresAPI: true };
    
    case 'filter_compelling':
      if (state.identityPassedFilters.compelling) {
        return { nextStep: 'action_discovery', requiresAPI: false };
      }
      return { nextStep: 'filter_refinement', requiresAPI: true };
    
    case 'filter_refinement':
      // After API helps refine, retry current filter
      // Logic to determine which filter to retry based on state
      if (!state.identityPassedFilters.concrete) return { nextStep: 'filter_concrete', requiresAPI: false };
      if (!state.identityPassedFilters.coherent) return { nextStep: 'filter_coherent', requiresAPI: false };
      if (!state.identityPassedFilters.containable) return { nextStep: 'filter_containable', requiresAPI: false };
      if (!state.identityPassedFilters.compelling) return { nextStep: 'filter_compelling', requiresAPI: false };
      return { nextStep: 'action_discovery', requiresAPI: false };
    
    case 'action_discovery':
      // They proposed an action, now test it
      return { nextStep: 'action_atomic', requiresAPI: false };
    
    case 'action_atomic':
      if (state.actionPassedTests.atomic) {
        return { nextStep: 'action_congruent', requiresAPI: false };
      }
      return { nextStep: 'action_refinement', requiresAPI: true };
    
    case 'action_congruent':
      if (state.actionPassedTests.congruent) {
        return { nextStep: 'action_emotional', requiresAPI: false };
      }
      return { nextStep: 'action_refinement', requiresAPI: true };
    
    case 'action_emotional':
      if (state.actionPassedTests.emotional) {
        return { nextStep: 'contract_creation', requiresAPI: false };
      }
      return { nextStep: 'action_refinement', requiresAPI: true };
    
    case 'action_refinement':
      // After API helps refine, retry current test
      if (!state.actionPassedTests.atomic) return { nextStep: 'action_atomic', requiresAPI: false };
      if (!state.actionPassedTests.congruent) return { nextStep: 'action_congruent', requiresAPI: false };
      if (!state.actionPassedTests.emotional) return { nextStep: 'action_emotional', requiresAPI: false };
      return { nextStep: 'contract_creation', requiresAPI: false };
    
    case 'contract_creation':
      return { nextStep: 'commitment', requiresAPI: false };
    
    case 'commitment':
      if (userResponse?.toLowerCase().includes('commit') || userResponse?.toLowerCase().includes('yes')) {
        return { nextStep: 'close', requiresAPI: false };
      }
      // They want to adjust - API helps figure out what
      return { nextStep: 'action_discovery', requiresAPI: true };
    
    case 'close':
      return { nextStep: 'complete', requiresAPI: false };
    
    default:
      return { nextStep: 'complete', requiresAPI: false };
  }
}

// ============================================
// TEMPLATE RENDERER
// ============================================

export function renderMicroActionTemplate(
  templateKey: keyof typeof microActionTemplates,
  state: MicroActionSetupState
): string {
  const template = microActionTemplates[templateKey];
  if (!template || !('message' in template)) return '';
  
  let message = template.message;
  
  // Replace placeholders
  const replacements: Record<string, string> = {
    '{{previousIdentity}}': state.previousIdentity || '[not set]',
    '{{previousAction}}': state.previousAction || '[not set]',
    '{{frictionSummary}}': state.frictionDescription || '[friction]',
    '{{chosenIdentity}}': state.chosenIdentity || '[identity]',
    '{{chosenAction}}': state.chosenAction || '[action]',
    '{{actionMechanics}}': state.chosenAction || '[do your action]',
    '{{sprintEndDate}}': state.sprintStartDate 
      ? new Date(new Date(state.sprintStartDate).getTime() + 21 * 24 * 60 * 60 * 1000).toLocaleDateString()
      : '[21 days from now]',
    '{{currentDay}}': '1' // Would calculate from sprintStartDate
  };
  
  for (const [key, value] of Object.entries(replacements)) {
    message = message.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
  }
  
  return message;
}

// ============================================
// API PROMPT GENERATORS (for hybrid calls)
// ============================================

export const microActionAPIPrompts = {
  
  friction_followup: (state: MicroActionSetupState, userResponse: string) => `
You are an identity coach helping a user discover their 21-day identity.

The user described this friction/misalignment:
"${userResponse}"

Your job:
1. Reflect back what you heard in 1-2 sentences (mirror their language)
2. Ask ONE probing question to get more specific/concrete about the friction
3. Keep it conversational, not clinical

Tone: Calm, grounded, curious. No cheerleading.
Length: 3-4 sentences max.
`,

  identity_refinement: (state: MicroActionSetupState, userResponse: string) => `
You are an identity coach. The user proposed this identity:
"${userResponse}"

Identity type they need: ${state.identityType || 'unknown'}
Their friction was: "${state.frictionDescription}"

Your job:
1. If the identity is well-phrased (clear, first-person, specific), confirm it and ask them to say it out loud to check resonance
2. If it's vague or awkward, suggest a refined phrasing based on what they shared
3. Don't announce you're refining - just offer it naturally: "What about something like: 'I am...' — how does that land?"

Keep it to 2-3 sentences. Direct and helpful.
`,

  filter_refinement: (state: MicroActionSetupState, failedFilter: string, userResponse: string) => `
You are an identity coach. The user's identity "${state.chosenIdentity}" didn't pass the ${failedFilter} filter.

Their response to the ${failedFilter} question was: "${userResponse}"

Filter definitions:
- concrete: Can someone observe evidence in 60 seconds?
- coherent: Does it feel like an upgrade, not a costume?
- containable: Can it be proven with one small daily action?
- compelling: Does it light up their chest, not just their head?

Your job:
1. Acknowledge what's off (1 sentence)
2. Ask a question that helps them refine the identity to pass this filter
3. If they've tried 2-3 times, suggest zooming out: "What's the bigger pattern you're trying to shift?"

Keep it to 2-3 sentences. No frameworks or jargon.
`,

  action_refinement: (state: MicroActionSetupState, failedTest: string, userResponse: string) => `
You are an identity coach. The user's micro-action "${state.chosenAction}" for identity "${state.chosenIdentity}" didn't pass the ${failedTest} test.

Their response: "${userResponse}"

ACE tests:
- atomic: Doable even on worst days
- congruent: Clearly proves the identity
- emotional: Feels like alignment, not obligation

Your job:
1. Name what's off (1 sentence)
2. Help them shrink it, change it, or find a different action
3. Suggest specific alternatives if they're stuck

Keep it to 3-4 sentences. Practical and direct.
`
};
