// app/chat/page.tsx - FIXED VERSION with proper null checks

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import ClientChat from '@/components/ClientChat';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function ChatPage() {
  const supabase = createServerClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Get storage instance
  const storage = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
      },
    }
  );

  // Try to load baseline data with proper null checks
  let baselineData = null;
  
  try {
    console.log('📊 Loading baseline data...');
    
    const rewiredIndexResult = await storage.from('user_data').select('value').eq('user_id', user.id).eq('key', 'ios:baseline:rewired_index').single();
    const tierResult = await storage.from('user_data').select('value').eq('user_id', user.id).eq('key', 'ios:baseline:tier').single();
    const domainScoresResult = await storage.from('user_data').select('value').eq('user_id', user.id).eq('key', 'ios:baseline:domain_scores').single();
    const currentStageResult = await storage.from('user_data').select('value').eq('user_id', user.id).eq('key', 'ios:current_stage').single();
    
    // Only parse if data exists
    if (rewiredIndexResult.data?.value && tierResult.data?.value && domainScoresResult.data?.value && currentStageResult.data?.value) {
      const rewiredIndex = JSON.parse(rewiredIndexResult.data.value);
      const tier = JSON.parse(tierResult.data.value);
      const domainScores = JSON.parse(domainScoresResult.data.value);
      const currentStage = JSON.parse(currentStageResult.data.value);
      
      baselineData = {
        rewiredIndex,
        tier,
        domainScores,
        currentStage
      };
      
      console.log('✅ Baseline data loaded:', baselineData);
    } else {
      console.log('⚠️ Incomplete baseline data, user needs to complete assessment');
    }
  } catch (error) {
    console.error('❌ Error loading baseline data:', error);
    // baselineData remains null, which is fine - means user hasn't completed baseline yet
  }

  return <ClientChat user={user} baselineData={baselineData} />;
}
