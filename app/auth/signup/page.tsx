'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        // Check if email confirmation is required
        if (data.user.identities?.length === 0) {
          setError('An account with this email already exists');
          return;
        }

        // Update profile with full name
        if (fullName) {
          await supabase
            .from('user_profiles')
            .update({ full_name: fullName })
            .eq('id', data.user.id);
        }

        setMessage(
          'Account created successfully! Please check your email to verify your account.'
        );

        // Redirect to assessment after 2 seconds
        setTimeout(() => {
          router.push('/assessment');
        }, 2000);
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
            Begin Your Transformation
          </p>
        </div>

        {/* Sign Up Card */}
        <div className="rounded-lg p-8" style={{ backgroundColor: '#111111' }}>
          <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>

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

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name (Optional)
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 rounded text-white"
                style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                placeholder="John Doe"
              />
            </div>

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
              <p className="mt-1 text-xs text-gray-500">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded text-white"
                style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                placeholder="••••••••"
              />
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link 
                href="/auth/signin" 
                className="font-semibold hover:opacity-80 transition-opacity"
                style={{ color: '#ff9e19' }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Trial Info */}
        <div className="mt-6 text-center p-4 rounded" style={{ backgroundColor: '#111111' }}>
          <p className="text-sm text-gray-400">
            🎉 Start with a <span className="font-semibold" style={{ color: '#ff9e19' }}>7-day free trial</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            No credit card required
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
