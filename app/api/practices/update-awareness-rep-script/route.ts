// app/api/practices/update-awareness-rep-script/route.ts
// Saves which awareness rep script was last played for rotation tracking
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_SCRIPTS = ['F1', 'F2', 'F3', 'F4', 'R1', 'R2', 'R3', 'R4', 'I1', 'I2', 'I3'];

export async function POST(request: NextRequest) {
  try {
    const { userId, script } = await request.json();

    if (!userId || !script) {
      return NextResponse.json({ error: 'Missing userId or script' }, { status: 400 });
    }

    if (!VALID_SCRIPTS.includes(script)) {
      return NextResponse.json({ error: `Invalid script: ${script}` }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('user_progress')
      .update({ last_awareness_rep_script: script })
      .eq('user_id', userId);

    if (error) {
      console.error('[update-awareness-rep-script] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`[update-awareness-rep-script] Saved: user=${userId}, script=${script}`);
    return NextResponse.json({ success: true, script });
  } catch (err) {
    console.error('[update-awareness-rep-script] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
