import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [validToken, setValidToken] = useState(false);

  const orangeAccent = '#ff9e19';

  // Check for valid reset token on mount
  useEffect(() => {
    const checkToken = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        setValidToken(true);
      } else {
        setMessage({
          type: 'error',
          text: 'Invalid or expired reset link. Please request a new one.'
        });
      }
    };

    checkToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match. Please try again.'
      });
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 8 characters long.'
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Password updated successfully! Redirecting to sign in...'
      });

      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
      
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to reset password. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Set New Password
          </h1>
          <p className="text-gray-400">
            Choose a strong password for your account
          </p>
        </div>

        {/* Form Card */}
        <div 
          className="p-8 rounded-lg shadow-lg"
          style={{ backgroundColor: '#111111', border: '1px solid #1a1a1a' }}
        >
          {/* Message Display */}
          {message.text && (
            <div 
              className="mb-6 p-4 rounded-lg text-sm"
              style={{
                backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: message.type === 'success' ? '#22c55e' : '#ef4444'
              }}
            >
              {message.text}
            </div>
          )}

          {/* Form */}
          {validToken ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                  }}
                  onFocus={(e) => e.target.style.borderColor = orangeAccent}
                  onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
                />
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                  }}
                  onFocus={(e) => e.target.style.borderColor = orangeAccent}
                  onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
                />
              </div>

              {/* Password Requirements */}
              <div className="text-xs text-gray-400 space-y-1">
                <p className="font-medium mb-2">Password must:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li className={password.length >= 8 ? 'text-green-500' : ''}>
                    Be at least 8 characters long
                  </li>
                  <li className={password === confirmPassword && password.length > 0 ? 'text-green-500' : ''}>
                    Match in both fields
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !password || !confirmPassword || password.length < 8}
                className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: orangeAccent }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 mb-6">
                Your reset link is invalid or has expired.
              </p>
              <Link
                href="/auth/forgot-password"
                className="inline-block py-3 px-6 rounded-lg font-semibold text-white transition-all"
                style={{ backgroundColor: orangeAccent }}
              >
                Request New Link
              </Link>
            </div>
          )}
        </div>

        {/* Footer Link */}
        {validToken && (
          <div className="mt-6 text-center">
            <Link 
              href="/auth/signin"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
