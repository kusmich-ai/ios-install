// middleware/auth.ts
export async function requireSubscription(userId: string) {
  const { data } = await supabase
    .from('user_subscriptions')
    .select('subscription_status')
    .eq('user_id', userId)
    .single();
    
  return data?.subscription_status === 'active';
}
