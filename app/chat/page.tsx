// app/chat/page.tsx - FIXED VERSION with proper null checks

import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import ChatInterface from '@/components/ChatInterface';

export default async function ChatPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Try to load baseline data with proper null checks
  let baselineData = null;
  
  try {
    console.log('📊 Loading baseline data for user:', user.id);
    
    // Query all baseline data with proper error handling
    const { data: rewiredIndexData, error: rewiredError } = await supabase
      .from('user_data')
      .select('value')
      .eq('user_id', user.id)
      .eq('key', 'ios:baseline:rewired_index')
      .single();
    
    const { data: tierData, error: tierError } = await supabase
      .from('user_data')
      .select('value')
      .eq('user_id', user.id)
      .eq('key', 'ios:baseline:tier')
      .single();
    
    const { data: domainScoresData, error: domainError } = await supabase
      .from('user_data')
      .select('value')
      .eq('user_id', user.id)
      .eq('key', 'ios:baseline:domain_scores')
      .single();
    
    const { data: currentStageData, error: stageError } = await supabase
      .from('user_data')
      .select('value')
      .eq('user_id', user.id)
      .eq('key', 'ios:current_stage')
      .single();
    
    // Check if ALL data exists before parsing
    if (
      rewiredIndexData?.value && 
      tierData?.value && 
      domainScoresData?.value && 
      currentStageData?.value
    ) {
      // Parse with try-catch for extra safety
      try {
        const rewiredIndex = JSON.parse(rewiredIndexData.value);
        const tier = JSON.parse(tierData.value);
        const domainScores = JSON.parse(domainScoresData.value);
        const currentStage = JSON.parse(currentStageData.value);
        
        baselineData = {
          rewiredIndex,
          tier,
          domainScores,
          currentStage
        };
        
        console.log('✅ Baseline data loaded successfully:', baselineData);
      } catch (parseError) {
        console.error('❌ Error parsing baseline data:', parseError);
      }
    } else {
      console.log('⚠️ Incomplete baseline data - user needs to complete assessment');
      console.log('Missing:', {
        rewiredIndex: !rewiredIndexData?.value,
        tier: !tierData?.value,
        domainScores: !domainScoresData?.value,
        currentStage: !currentStageData?.value
      });
      
      // If they haven't completed baseline, redirect to assessment
      redirect('/assessment');
    }
  } catch (error) {
    console.error('❌ Error loading baseline data:', error);
    // If error loading baseline, redirect to assessment
    redirect('/assessment');
  }

  // If we got here but baselineData is still null, redirect to assessment
  if (!baselineData) {
    redirect('/assessment');
  }

  return <ChatInterface user={user} baselineData={baselineData} />;
}
