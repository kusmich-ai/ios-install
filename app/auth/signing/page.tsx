'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        // Check if user needs baseline assessment
        const { data: baseline } = await supabase
          .from('baseline_assessments')
          .select('id')
          .eq('user_id', data.user.id)
          .single();

        if (!baseline) {
          // No baseline - redirect to assessment
          router.push('/assessment');
        } else {
          // Has baseline - redirect to chat
          router.push('/chat');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#ff9e19' }}>
            IOS System
          </h1>
          <p className="text-gray-400">
            Integrated Operating System
          </p>
        </div>

        {/* Sign In Card */}
        <div className="rounded-lg p-8" style={{ backgroundColor: '#111111' }}>
          <h2 className="text-2xl font-bold text-white mb-6">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#2a1616', border: '1px solid #ff4444' }}>
              <p className="text-sm" style={{ color: '#ff6666' }}>{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#162a16', border: '1px solid #44ff44' }}>
              <p className="text-sm" style={{ color: '#66ff66' }}>{message}</p>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded text-white"
                style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded text-white"
                style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link 
                href="/auth/forgot-password" 
                className="hover:opacity-80 transition-opacity"
                style={{ color: '#ff9e19' }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#ff9e19',
                color: '#0a0a0a'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link 
                href="/auth/signup" 
                className="font-semibold hover:opacity-80 transition-opacity"
                style={{ color: '#ff9e19' }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
