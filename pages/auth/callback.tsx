import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.search.substring(1) // Remove the '?' from the search params
        );

        if (error) {
          console.error('Error exchanging code for session:', error);
          router.push('/auth/signin?error=callback_failed');
          return;
        }

        // Redirect to home page after successful auth
        router.push('/');
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        router.push('/auth/signin?error=unexpected');
      }
    };

    handleCallback();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff9e19] mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
