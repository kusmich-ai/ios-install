import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import ChatInterface from '@/components/ChatInterface';

export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  try {
    console.log('🚀 Chat page starting...');
    
    const supabase = createServerComponentClient({ cookies });
    
    console.log('🔐 Getting user...');
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('❌ Error getting user:', userError);
      redirect('/auth/signin');
    }

    if (!user) {
      console.log('⚠️ No user found, redirecting to signin');
      redirect('/auth/signin');
    }

    console.log('✅ User found:', user.id);

    let baselineData = null;
    
    console.log('📊 Loading baseline data...');
    
    const { data: allUserData, error: dataError } = await supabase
      .from('user_data')
      .select('key, value')
      .eq('user_id', user.id)
      .in('key', [
        'ios:baseline:rewired_index',
        'ios:baseline:tier',
        'ios:baseline:domain_scores',
        'ios:current_stage'
      ]);

    if (dataError) {
      console.error('❌ Database error:', dataError);
      redirect('/assessment');
    }

    console.log('📦 Data received:', allUserData?.length, 'records');

    if (!allUserData || allUserData.length === 0) {
      console.log('⚠️ No baseline data found');
      redirect('/assessment');
    }

    // Convert array to object
    const dataMap = allUserData.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);

    console.log('🔑 Keys found:', Object.keys(dataMap));

    // Check required keys
    const requiredKeys = [
      'ios:baseline:rewired_index',
      'ios:baseline:tier',
      'ios:baseline:domain_scores',
      'ios:current_stage'
    ];

    const missingKeys = requiredKeys.filter(key => !dataMap[key]);
    
    if (missingKeys.length > 0) {
      console.log('⚠️ Missing keys:', missingKeys);
      redirect('/assessment');
    }

    // Parse data
    console.log('🔄 Parsing baseline data...');
    
    baselineData = {
      rewiredIndex: JSON.parse(dataMap['ios:baseline:rewired_index']),
      tier: JSON.parse(dataMap['ios:baseline:tier']),
      domainScores: JSON.parse(dataMap['ios:baseline:domain_scores']),
      currentStage: JSON.parse(dataMap['ios:current_stage'])
    };
    
    console.log('✅ Baseline data parsed:', baselineData);

    if (!baselineData) {
      console.log('⚠️ Baseline data is null after parsing');
      redirect('/assessment');
    }

    console.log('🎉 Rendering ChatInterface...');
    return <ChatInterface user={user} baselineData={baselineData} />;

  } catch (error) {
    console.error('💥 Unexpected error in chat page:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    
    // Instead of redirecting, show the error
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="max-w-md p-8 bg-gray-800 rounded-lg">
          <h1 className="text-xl font-bold text-red-500 mb-4">Error Loading Chat</h1>
          <p className="text-gray-300 mb-4">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <div className="space-y-2">
            
              href="/assessment"
              className="block w-full px-4 py-2 text-center bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Go to Assessment
            </a>
            
              href="/auth/signin"
              className="block w-full px-4 py-2 text-center bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }
}
