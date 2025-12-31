import { redirect } from 'next/navigation';

export default function PricingPage({ searchParams }: { searchParams: { reason?: string; stage?: string } }) {
  const params = new URLSearchParams();
  if (searchParams.reason) params.set('reason', searchParams.reason);
  if (searchParams.stage) params.set('stage', searchParams.stage);
  
  const queryString = params.toString();
  redirect(`/upgrade${queryString ? `?${queryString}` : ''}`);
}
