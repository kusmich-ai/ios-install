import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import SimpleAgreementCheckbox from '@/components/onboarding/SimpleAgreementCheckbox';

export const dynamic = 'force-dynamic';

export default async function AgreementPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  return <SimpleAgreementCheckbox userId={user.id} />;
}
