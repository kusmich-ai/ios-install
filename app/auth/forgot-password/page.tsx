'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setMessage(
        'Password reset email sent! Please check your inbox and follow the instructions.'
      );
      setEmail('');
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
            Reset Your Password
          </p>
        </div>

        {/* Reset Card */}
        <div className="rounded-lg p-8" style={{ backgroundColor: '#111111' }}>
          <h2 className="text-2xl font-bold text-white mb-2">Forgot Password</h2>
          <p className="text-gray-400 text-sm mb-6">
            Enter your email and we'll send you a link to reset your password.
          </p>

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

          <form onSubmit={handleResetPassword} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#ff9e19',
                color: '#0a0a0a'
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/auth/signin" 
              className="text-sm hover:opacity-80 transition-opacity"
              style={{ color: '#ff9e19' }}
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
