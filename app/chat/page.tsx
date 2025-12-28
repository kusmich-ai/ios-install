import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import ChatInterface from '@/components/ChatInterface';

export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  try {
    console.log('Chat page starting...');
    
    const supabase = await createClient();
    
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error getting user:', userError);
      redirect('/auth/signin');
    }

    if (!user) {
      console.log('No user found, redirecting to signin');
      redirect('/auth/signin');
    }

    console.log('User found:', user.id);

    // ========== SUBSCRIPTION CHECK FOR STAGE 2+ ==========
    // Get user's current stage
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('current_stage')
      .eq('user_id', user.id)
      .maybeSingle();

    const currentStage = progressData?.current_stage || 1;

    // If user is past Stage 1, verify they have active subscription
    if (currentStage > 1) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status, current_period_end, cancel_at_period_end')
        .eq('user_id', user.id)
        .maybeSingle();

      const isSubscriptionActive = 
        subscription?.status === 'active' || 
        subscription?.status === 'trialing' ||
        (subscription?.cancel_at_period_end && 
         subscription?.current_period_end && 
         new Date(subscription.current_period_end) > new Date());

      if (!isSubscriptionActive) {
        console.log('Subscription required for Stage 2+, redirecting to pricing');
        redirect(`/pricing?reason=subscription_required&stage=${currentStage}`);
      }
    }
    // ========== END SUBSCRIPTION CHECK ==========

    let baselineData = null;
    
    console.log('Loading baseline data...');
    
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
      console.error('Database error:', dataError);
      redirect('/assessment');
    }

    console.log('Data received:', allUserData?.length, 'records');

    if (!allUserData || allUserData.length === 0) {
      console.log('No baseline data found');
      redirect('/assessment');
    }

    const dataMap = allUserData.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);

    console.log('Keys found:', Object.keys(dataMap));

    const requiredKeys = [
      'ios:baseline:rewired_index',
      'ios:baseline:tier',
      'ios:baseline:domain_scores',
      'ios:current_stage'
    ];

    const missingKeys = requiredKeys.filter(key => !dataMap[key]);
    
    if (missingKeys.length > 0) {
      console.log('Missing keys:', missingKeys);
      redirect('/assessment');
    }

    console.log('Parsing baseline data...');
    
    baselineData = {
      rewiredIndex: JSON.parse(dataMap['ios:baseline:rewired_index']),
      tier: JSON.parse(dataMap['ios:baseline:tier']),
      domainScores: JSON.parse(dataMap['ios:baseline:domain_scores']),
      currentStage: JSON.parse(dataMap['ios:current_stage'])
    };
    
    console.log('Baseline data parsed:', baselineData);

    if (!baselineData) {
      console.log('Baseline data is null after parsing');
      redirect('/assessment');
    }

    console.log('Rendering ChatInterface...');
    return <ChatInterface user={user} baselineData={baselineData} />;

  } catch (error) {
    // ✅ CRITICAL FIX: Check if this is a redirect error and re-throw it
    if (error && typeof error === 'object' && 'digest' in error) {
      const digest = (error as any).digest;
      // Next.js redirect errors have a digest that starts with "NEXT_REDIRECT"
      if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
        console.log('Re-throwing redirect error:', digest);
        throw error; // Re-throw to allow Next.js to handle the redirect
      }
    }

    // For all other errors, show error UI
    console.error('Unexpected error in chat page:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="max-w-md p-8 bg-gray-800 rounded-lg">
          <h1 className="text-xl font-bold text-red-500 mb-4">Error Loading Chat</h1>
          <p className="text-gray-300 mb-4">{errorMessage}</p>
          <div className="space-y-2">
            <a 
              href="/assessment" 
              className="block w-full px-4 py-2 text-center bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Go to Assessment
            </a>
            <a 
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
