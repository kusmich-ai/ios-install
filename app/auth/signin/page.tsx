// app/auth/signin/page.tsx - DARK THEME VERSION
'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'

// Separate component that uses useSearchParams
function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Get success message from URL params (e.g., after password reset)
  const message = searchParams.get('message')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      // Force refresh the page to ensure middleware runs with new session
      router.refresh()
      router.push('/screening')
      
    } catch (error: any) {
      console.error('Sign in error:', error)
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full space-y-8 p-8 rounded-lg shadow-lg" style={{ backgroundColor: '#111111' }}>
      <h2 className="text-3xl font-bold text-center" style={{ color: '#ff9e19' }}>
        Sign In
      </h2>
      
      {message && (
        <div className="p-3 rounded" style={{ backgroundColor: '#22c55e20', color: '#22c55e', border: '1px solid #22c55e' }}>
          {message}
        </div>
      )}

      {error && (
        <div className="p-3 rounded" style={{ backgroundColor: '#ff9e1920', color: '#ff9e19', border: '1px solid #ff9e19' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-300">
            Email
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
            required
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-end">
          <Link 
            href="/auth/forgot-password" 
            className="text-sm hover:underline"
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

      <p className="text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="hover:underline" style={{ color: '#ff9e19' }}>
          Sign up
        </Link>
      </p>
    </div>
  )
}

// Main component with Suspense boundary
export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
      <Suspense fallback={
        <div className="max-w-md w-full space-y-8 p-8 rounded-lg shadow-lg" style={{ backgroundColor: '#111111' }}>
          <div className="text-center" style={{ color: '#ff9e19' }}>Loading...</div>
        </div>
      }>
        <SignInForm />
      </Suspense>
    </div>
  )
}
