import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const user = useUser();
  const supabase = useSupabaseClient();

  // Debug: Log user state
  useEffect(() => {
    console.log('SignIn page - User state:', user);
    console.log('SignIn page - Is authenticated:', !!user);
  }, [user]);

  // Redirect if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking auth state...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);
      
      if (session?.user) {
        console.log('User is authenticated, redirecting to screening...');
        router.push('/screening');
      } else {
        console.log('No active session');
      }
    };

    checkAuth();
  }, [router, supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Attempting to', isSignUp ? 'sign up' : 'sign in', 'with email:', email);

      let result;
      if (isSignUp) {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        console.log('Sign up result:', result);
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        console.log('Sign in result:', result);
      }

      const { data, error: authError } = result;

      if (authError) {
        console.error('Auth error:', authError);
        setError(authError.message);
        setLoading(false);
        return;
      }

      console.log('Auth successful! Data:', data);
      console.log('Session:', data.session);
      console.log('User:', data.user);

      if (data.session) {
        console.log('Session exists, redirecting to screening...');
        // Small delay to ensure session is fully set
        setTimeout(() => {
          router.push('/screening');
        }, 100);
      } else {
        console.log('No session in response - may need email confirmation');
        if (isSignUp) {
          setError('Please check your email to confirm your account.');
        }
        setLoading(false);
      }

    } catch (err) {
      console.error('Unexpected error:', err);
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#ff9e19] focus:border-[#ff9e19] focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#ff9e19] focus:border-[#ff9e19] focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#ff9e19] hover:bg-[#ff8800] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff9e19] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign up' : 'Sign in')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-[#ff9e19] hover:text-[#ff8800]"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>User: {user ? user.email : 'null'}</p>
            <p>Auth state: {user ? 'authenticated' : 'not authenticated'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
