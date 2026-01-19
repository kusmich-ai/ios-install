// ============================================
// MIRROR SKIP API ROUTE
// ============================================
// File: app/api/mirror/skip/route.ts
//
// This endpoint records when a user chooses to skip The Mirror.
// This allows us to:
// 1. Not show The Mirror again on subsequent visits
// 2. Track analytics on skip rates
// 3. Potentially prompt them to try again after Stage 1 completion
// ============================================

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Create a "skipped" pattern profile record
    // This marks that the user saw The Mirror but chose to skip
    const { error: dbError } = await supabase
      .from('pattern_profiles')
      .upsert({
        user_id: user.id,
        source: 'skipped',
        patterns: null,
        core_pattern: null,
        ios_roadmap: null,
        quality_score: null,
        raw_input: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (dbError) {
      console.error('Database error recording skip:', dbError);
      // Don't throw - we still want to let them proceed
      // Just log the error for analytics
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
