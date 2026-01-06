'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const supabase = createClientComponentClient()

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setMessage('Check your email for the password reset link')
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-md w-full space-y-6 p-8 rounded-lg shadow-lg" style={{ backgroundColor: '#111111' }}>
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold" style={{ color: '#ff9e19' }}>
            Unbecoming
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter your email address and we'll send you a reset link
          </p>
        </div>

        {message && (
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#ff9e1920', border: '1px solid #ff9e19' }}>
            <p style={{ color: '#ff9e19' }}>{message}</p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded text-sm" style={{ backgroundColor: '#ff000020', color: '#ff6b6b', border: '1px solid #ff6b6b' }}>
            {error}
          </div>
        )}

        {!message && (
          <form onSubmit={handleResetRequest} className="space-y-4">
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
        )}

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-400">
            Remember your password?{' '}
            <Link href="/auth/signin" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: '#ff9e19' }}>
              Sign in
            </Link>
          </p>
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: '#ff9e19' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
