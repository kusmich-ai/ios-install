import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import ChatInterface from '@/components/ChatInterface';

// ✅ ADD THIS LINE - Forces dynamic rendering
export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  let baselineData = null;
  
  try {
    console.log('📊 Loading baseline data for user:', user.id);
    
    // Query all baseline data in a single query
    const { data: allUserData, error } = await supabase
      .from('user_data')
      .select('key, value')
      .eq('user_id', user.id)
      .in('key', [
        'ios:baseline:rewired_index',
        'ios:baseline:tier',
        'ios:baseline:domain_scores',
        'ios:current_stage'
      ]);

    if (error) {
      console.error('❌ Error fetching baseline data:', error);
      redirect('/assessment');
    }

    if (!allUserData || allUserData.length === 0) {
      console.log('⚠️ No baseline data found - redirecting to assessment');
      redirect('/assessment');
    }

    // Convert array to object for easier access
    const dataMap = allUserData.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);

    // Check if all required keys exist
    const requiredKeys = [
      'ios:baseline:rewired_index',
      'ios:baseline:tier',
      'ios:baseline:domain_scores',
      'ios:current_stage'
    ];

    const missingKeys = requiredKeys.filter(key => !dataMap[key]);
    
    if (missingKeys.length > 0) {
      console.log('⚠️ Incomplete baseline data. Missing:', missingKeys);
      redirect('/assessment');
    }

    // Parse all data
    try {
      baselineData = {
        rewiredIndex: JSON.parse(dataMap['ios:baseline:rewired_index']),
        tier: JSON.parse(dataMap['ios:baseline:tier']),
        domainScores: JSON.parse(dataMap['ios:baseline:domain_scores']),
        currentStage: JSON.parse(dataMap['ios:current_stage'])
      };
      
      console.log('✅ Baseline data loaded successfully:', baselineData);
    } catch (parseError) {
      console.error('❌ Error parsing baseline data:', parseError);
      redirect('/assessment');
    }

  } catch (error) {
    console.error('❌ Unexpected error loading baseline data:', error);
    redirect('/assessment');
  }

  if (!baselineData) {
    redirect('/assessment');
  }

  return <ChatInterface user={user} baselineData={baselineData} />;
}
