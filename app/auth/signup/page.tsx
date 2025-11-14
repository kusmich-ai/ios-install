// app/auth/signup/page.tsx - DARK THEME VERSION
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function SignUp() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) throw signUpError

      // Redirect to signin after successful signup
      router.push('/auth/signin?message=Account created! Please sign in.')
      
    } catch (error: any) {
      console.error('Sign up error:', error)
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-md w-full space-y-8 p-8 rounded-lg shadow-lg" style={{ backgroundColor: '#111111' }}>
        <div>
          <h2 className="text-3xl font-bold text-center" style={{ color: '#ff9e19' }}>
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Join the IOS transformation journey
          </p>
        </div>
        
        {error && (
          <div className="p-3 rounded" style={{ backgroundColor: '#ff9e1920', color: '#ff9e19', border: '1px solid #ff9e19' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
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
              placeholder="At least 6 characters"
              minLength={6}
              required
              disabled={loading}
            />
          </div>

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
              minLength={6}
              required
              disabled={loading}
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
