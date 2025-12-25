// app/api/coach/taste/route.ts
import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

const FREE_MESSAGE_LIMIT = 4;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coachId = request.nextUrl.searchParams.get('coachId');
    if (!coachId) {
      return NextResponse.json({ error: 'Missing coachId' }, { status: 400 });
    }

    // Check user's current stage from progress
    const { data: progress } = await supabase
      .from('user_progress')
      .select('current_stage')
      .eq('user_id', user.id)
      .single();

    const currentStage = progress?.current_stage || 1;

    // Stage 2+ users get full access
    if (currentStage >= 2) {
      return NextResponse.json({ 
        hasAccess: true, 
        isFullAccess: true,
        currentStage,
        messagesUsed: 0,
        messagesRemaining: Infinity,
        limit: Infinity
      });
    }

    // Stage 1 users - check taste count
    const { data: tasteRecord } = await supabase
      .from('coach_taste_usage')
      .select('message_count')
      .eq('user_id', user.id)
      .eq('coach_id', coachId)
      .single();

    const messagesUsed = tasteRecord?.message_count || 0;
    const messagesRemaining = Math.max(0, FREE_MESSAGE_LIMIT - messagesUsed);

    return NextResponse.json({
      hasAccess: messagesUsed < FREE_MESSAGE_LIMIT,
      isFullAccess: false,
      currentStage,
      messagesUsed,
      messagesRemaining,
      limit: FREE_MESSAGE_LIMIT
    });

  } catch (error) {
    console.error('[Taste API] Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { coachId } = await request.json();
    if (!coachId) {
      return NextResponse.json({ error: 'Missing coachId' }, { status: 400 });
    }

    // Check user's current stage - Stage 2+ users don't need tracking
    const { data: progress } = await supabase
      .from('user_progress')
      .select('current_stage')
      .eq('user_id', user.id)
      .single();

    const currentStage = progress?.current_stage || 1;

    if (currentStage >= 2) {
      return NextResponse.json({ success: true, isFullAccess: true });
    }

    // Stage 1 - increment taste count
    const { data: existing } = await supabase
      .from('coach_taste_usage')
      .select('message_count')
      .eq('user_id', user.id)
      .eq('coach_id', coachId)
      .single();

    if (existing) {
      await supabase
        .from('coach_taste_usage')
        .update({ 
          message_count: existing.message_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('coach_id', coachId);
    } else {
      await supabase
        .from('coach_taste_usage')
        .insert({
          user_id: user.id,
          coach_id: coachId,
          message_count: 1
        });
    }

    const newCount = (existing?.message_count || 0) + 1;

    return NextResponse.json({
      success: true,
      isFullAccess: false,
      messagesUsed: newCount,
      messagesRemaining: Math.max(0, FREE_MESSAGE_LIMIT - newCount),
      limitReached: newCount >= FREE_MESSAGE_LIMIT
    });

  } catch (error) {
    console.error('[Taste API] Increment error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
