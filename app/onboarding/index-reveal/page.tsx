import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import REwiredIndexReveal from '@/components/onboarding/REwiredIndexReveal';

export const dynamic = 'force-dynamic';

export default async function IndexRevealPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <REwiredIndexReveal />
    </Suspense>
  );
}
