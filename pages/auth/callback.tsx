import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from URL params
        const { code } = router.query;

        if (!code || typeof code !== 'string') {
          console.error('No code found in callback URL');
          setError('Invalid callback - no code provided');
          setTimeout(() => router.push('/auth/signin'), 2000);
          return;
        }

        console.log('Exchanging code for session...');

        // Exchange the code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error('Error exchanging code for session:', exchangeError);
          setError(exchangeError.message);
          setTimeout(() => router.push('/auth/signin?error=callback_failed'), 2000);
          return;
        }

        if (!data.session) {
          console.error('No session returned after code exchange');
          setError('Failed to create session');
          setTimeout(() => router.push('/auth/signin?error=no_session'), 2000);
          return;
        }

        console.log('Session created successfully, redirecting...');

        // Redirect to home page after successful auth
        router.push('/');
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        setError('Unexpected error occurred');
        setTimeout(() => router.push('/auth/signin?error=unexpected'), 2000);
      }
    };

    // Only run when router is ready and we have query params
    if (router.isReady) {
      handleCallback();
    }
  }, [router.isReady, router.query, router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {!error ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff9e19] mx-auto mb-4"></div>
            <p className="text-gray-600">Completing sign in...</p>
          </>
        ) : (
          <>
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">Authentication failed</p>
            <p className="text-sm text-gray-500">{error}</p>
            <p className="text-sm text-gray-400 mt-2">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
}
```

## Fix 3: Verify Supabase Redirect URL Configuration

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Make sure your redirect URLs include:
```
   https://www.unbecoming.app/auth/callback
   http://localhost:3000/auth/callback
