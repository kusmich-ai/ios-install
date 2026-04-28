import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import SimpleBaseline from '@/components/onboarding/SimpleBaseline';

export const dynamic = 'force-dynamic';

export default async function BaselinePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  return <SimpleBaseline userId={user.id} />;
}
