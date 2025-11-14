// app/auth/signup/page.tsx - WITH NAME & STRONG PASSWORD
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function SignUp() {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  // Password strength validation
  const validatePassword = (pwd: string) => {
    const minLength = pwd.length >= 8
    const hasUpperCase = /[A-Z]/.test(pwd)
    const hasNumber = /[0-9]/.test(pwd)
    
    return {
      minLength,
      hasUpperCase,
      hasNumber,
      isValid: minLength && hasUpperCase && hasNumber
    }
  }

  const passwordValidation = validatePassword(password)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!fullName.trim()) {
      setError('Please enter your name')
      setLoading(false)
      return
    }

    if (!passwordValidation.isValid) {
      setError('Password must be at least 8 characters with 1 uppercase letter and 1 number')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName.trim(),
          }
        },
      })

      if (signUpError) throw signUpError

      // Check if user has a session (email confirmation disabled)
      if (data.session) {
        // Email confirmation is DISABLED - user is auto-logged in
        console.log('✅ Auto-signed in, redirecting to screening...')
        router.refresh()
        setTimeout(() => router.push('/screening'), 100)
      } else {
        // Email confirmation is ENABLED - show confirmation message
        console.log('📧 Email confirmation required')
        setAwaitingConfirmation(true)
        setLoading(false)
      }
      
    } catch (error: any) {
      console.error('Sign up error:', error)
      setError(error.message)
      setLoading(false)
    }
  }

  // Show email confirmation screen
  if (awaitingConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-md w-full space-y-6 p-8 rounded-lg shadow-lg text-center" style={{ backgroundColor: '#111111' }}>
          <div className="text-6xl mb-4" style={{ color: '#ff9e19' }}>📧</div>
          
          <h2 className="text-3xl font-bold" style={{ color: '#ff9e19' }}>
            Check Your Email
          </h2>
          
          <div className="space-y-4 text-gray-300">
            <p>
              We've sent a confirmation link to:
            </p>
            <p className="font-semibold text-white text-lg">
              {email}
            </p>
            <p className="text-sm">
              Click the link in the email to verify your account, then sign in to continue.
            </p>
          </div>

          <div className="pt-4">
            <Link
              href="/auth/signin"
              className="inline-block px-8 py-3 rounded-lg font-semibold transition-all"
              style={{ 
                backgroundColor: '#ff9e19',
                color: '#0a0a0a'
              }}
            >
              Go to Sign In
            </Link>
          </div>

          <p className="text-sm text-gray-500 pt-4">
            Didn't receive the email? Check your spam folder.
          </p>
        </div>
      </div>
    )
  }

  // Show signup form
  return (
    <div className="min-h-screen flex items-center justify-center py-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-md w-full space-y-6 p-8 rounded-lg shadow-lg" style={{ backgroundColor: '#111111' }}>
        <div>
          <h2 className="text-3xl font-bold text-center" style={{ color: '#ff9e19' }}>
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Join the IOS transformation journey
          </p>
        </div>
        
        {error && (
          <div className="p-3 rounded text-sm" style={{ backgroundColor: '#ff9e1920', color: '#ff9e19', border: '1px solid #ff9e19' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          {/* Full Name Field */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-1 text-gray-300">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: '#0a0a0a', 
                color: '#ffffff',
                border: '1px solid #2a2a2a'
              }}
              placeholder="John Doe"
              required
              disabled={loading}
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: '#0a0a0a', 
                color: '#ffffff',
                border: '1px solid #2a2a2a'
              }}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: '#0a0a0a', 
                color: '#ffffff',
                border: '1px solid #2a2a2a'
              }}
              placeholder="Min 8 characters"
              minLength={8}
              required
              disabled={loading}
            />
            
            {/* Password Strength Indicators */}
            {password && (
              <div className="mt-2 space-y-1 text-xs">
                <div className={passwordValidation.minLength ? 'text-green-400' : 'text-gray-500'}>
                  {passwordValidation.minLength ? '✓' : '○'} At least 8 characters
                </div>
                <div className={passwordValidation.hasUpperCase ? 'text-green-400' : 'text-gray-500'}>
                  {passwordValidation.hasUpperCase ? '✓' : '○'} One uppercase letter
                </div>
                <div className={passwordValidation.hasNumber ? 'text-green-400' : 'text-gray-500'}>
                  {passwordValidation.hasNumber ? '✓' : '○'} One number
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-gray-300">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: '#0a0a0a', 
                color: '#ffffff',
                border: '1px solid #2a2a2a'
              }}
              placeholder="Confirm your password"
              minLength={8}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !passwordValidation.isValid}
            className="w-full py-3 rounded font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: '#ff9e19',
              color: '#0a0a0a'
            }}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/signin" className="hover:underline" style={{ color: '#ff9e19' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
