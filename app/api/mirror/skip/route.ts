// ============================================
// MIRROR SKIP API ROUTE
// ============================================
// File: app/api/mirror/skip/route.ts
// ============================================

import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Create a "skipped" pattern profile record
    const { error: dbError } = await supabase
      .from('pattern_profiles')
      .upsert({
        user_id: user.id,
        source: 'skipped',
        skipped: true,
        core_pattern: null,
        ios_roadmap: null,
        mirror_quality_score: null,
        raw_gpt_output: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (dbError) {
      console.error('Database error recording skip:', dbError);
      // Don't throw - we still want to let them proceed
    }

    return NextResponse.json({ 
      success: true,
      message: 'Skip recorded' 
    });

  } catch (error) {
    console.error('Skip recording error:', error);
    // Return success anyway - don't block user from proceeding
    return NextResponse.json({ 
      success: true,
      message: 'Proceeding without recording' 
    });
  }
}
