import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in URL (e.g., ?error=access_denied)
        const { error: urlError } = router.query;
        if (urlError) {
          console.error('Error in callback URL:', urlError);
          setError(typeof urlError === 'string' ? urlError : 'Authentication error');
          setTimeout(() => router.push('/auth/signin'), 2000);
          return;
        }

        // Get authentication parameters from the URL hash or query
        // Supabase sends tokens in the hash fragment (#) for email confirmations
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        // Check for access_token in hash (email confirmation flow)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        // Check for code in query params (OAuth flow)
        const code = queryParams.get('code') || router.query.code;

        console.log('Callback params:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasCode: !!code,
          type
        });

        // Handle email confirmation with tokens
        if (accessToken && refreshToken) {
          console.log('Setting session from tokens...');
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Error setting session:', sessionError);
            setError(sessionError.message);
            setTimeout(() => router.push('/auth/signin?error=session_failed'), 2000);
            return;
          }

          if (!data.session) {
            console.error('No session returned after setting tokens');
            setError('Failed to create session');
            setTimeout(() => router.push('/auth/signin?error=no_session'), 2000);
            return;
          }

          console.log('Session created successfully from tokens, redirecting...');
          router.push('/');
          return;
        }

        // Handle OAuth callback with code
        if (code && typeof code === 'string') {
          console.log('Exchanging code for session...');
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

          console.log('Session created successfully from code, redirecting...');
          router.push('/');
          return;
        }

        // No valid authentication parameters found
        console.error('No valid authentication parameters in callback URL');
        setError('Invalid callback - no authentication parameters provided');
        setTimeout(() => router.push('/auth/signin'), 2000);

      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        setError('Unexpected error occurred');
        setTimeout(() => router.push('/auth/signin?error=unexpected'), 2000);
      }
    };

    // Only run when router is ready
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
            <p className="text-sm text-gray-400 mt-2">Please wait...</p>
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
            <p className="text-sm text-gray-400 mt-2">Redirecting to sign in...</p>
          </>
        )}
      </div>
    </div>
  );
}
