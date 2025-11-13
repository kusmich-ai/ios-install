import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [checkEmail, setCheckEmail] = useState(false); // NEW: for email confirmation screen
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
    return null;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Privacy policy validation
    if (!privacyAccepted) {
      setError('You must accept the Privacy Policy to create an account');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create user account
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: fullName,
            privacy_policy_version: '1.0',
            privacy_accepted_at: new Date().toISOString(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        if (data.user.identities?.length === 0) {
          setError('An account with this email already exists');
          setLoading(false);
          return;
        }

        // Step 2: Update user profile if full name provided
        if (fullName) {
          await supabase
            .from('user_profiles')
            .update({ full_name: fullName })
            .eq('id', data.user.id);
        }

        // Step 3: Store privacy policy acceptance in separate table for audit trail
        const { error: privacyError } = await supabase
          .from('privacy_acceptances')
          .insert({
            user_id: data.user.id,
            policy_version: '1.0',
            accepted_at: new Date().toISOString(),
            ip_address: null, // Optional: You can capture this server-side if needed
            accepted_via: 'signup',
          });

        // Step 4: Create user progress record
        const { error: progressError } = await supabase
          .from('user_progress')
          .insert({
            user_id: data.user.id,
            current_stage: 0,
            legal_agreements_accepted: false,
            baseline_completed: false,
            created_at: new Date().toISOString()
          });

        if (progressError) {
          console.error('Error creating user progress:', progressError);
          // Don't fail signup, but log it
        }

        if (privacyError) {
          console.error('Error storing privacy acceptance:', privacyError);
          // Don't fail signup if privacy acceptance storage fails - already in user metadata
          // But log it for monitoring
        }

        // NEW: Check if email confirmation is required
        if (data.session) {
          // Email confirmation is DISABLED - user is automatically logged in
          setMessage('Account created successfully! Redirecting to screening...');
          setTimeout(() => router.push('/screening'), 2000);
        } else {
          // Email confirmation is ENABLED - show check email screen
          setCheckEmail(true);
          setLoading(false);
        }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  // NEW: Show "Check Your Email" screen
  if (checkEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-full max-w-md">
          <div className="rounded-lg p-8" style={{ backgroundColor: '#111111' }}>
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                <CheckCircle2 className="w-8 h-8" style={{ color: '#22c55e' }} />
              </div>
            </div>

            {/* Message */}
            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Check Your Email
            </h1>
            <p className="text-gray-400 text-center mb-6">
              We've sent a confirmation link to:
            </p>
            <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" style={{ color: '#ff9e19' }} />
                <span className="text-white font-medium">{email}</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3 text-sm text-gray-400 mb-8">
              <p>Please check your email and click the confirmation link to continue.</p>
              <p>Once confirmed, you'll be redirected to complete your safety screening.</p>
              <p className="text-gray-500 text-xs">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => {
                    setCheckEmail(false);
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="hover:underline"
                  style={{ color: '#ff9e19' }}
                >
                  try again
                </button>
              </p>
            </div>

            {/* Back to Sign In */}
            <div className="text-center">
              <Link href="/auth/signin" className="text-sm text-gray-400 hover:text-gray-300">
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show signup form
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#ff9e19' }}>IOS System</h1>
          <p className="text-gray-400">Begin Your Transformation</p>
        </div>

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
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded text-white"
                style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded text-white"
                style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                placeholder="••••••••"
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            {/* PRIVACY POLICY CHECKBOX */}
            <div className="pt-4 pb-2">
              <label className="flex items-start space-x-3 cursor-pointer group">
                <div className="flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="w-5 h-5 rounded cursor-pointer"
                    style={{ 
                      accentColor: '#ff9e19',
                      backgroundColor: privacyAccepted ? '#ff9e19' : '#1a1a1a',
                      border: '1px solid #333'
                    }}
                    required
                    disabled={loading}
                  />
                </div>
                <span className="text-sm text-gray-300 leading-relaxed">
                  I acknowledge that I have read and agree to the{' '}
                  <Link 
                    href="/privacy" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:opacity-80 transition-opacity inline-flex items-center gap-1"
                    style={{ color: '#ff9e19' }}
                  >
                    Privacy Policy
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !privacyAccepted}
              className="w-full py-3 rounded font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#ff9e19', color: '#0a0a0a' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/auth/signin" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: '#ff9e19' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center p-4 rounded" style={{ backgroundColor: '#111111' }}>
          <p className="text-sm text-gray-400">
            🎉 Start with a <span className="font-semibold" style={{ color: '#ff9e19' }}>7-day free trial</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">No credit card required</p>
        </div>
      </div>
    </div>
  );
}
