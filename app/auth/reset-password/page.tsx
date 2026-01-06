'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const passwordValidation = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    isValid: password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!passwordValidation.isValid) {
      setError('Password does not meet requirements')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setMessage('Password updated successfully! Redirecting to sign in...')
      setTimeout(() => {
        router.push('/auth/signin')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
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
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter your new password below
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
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-300">
                New Password *
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
                placeholder="Enter new password"
                minLength={8}
                required
                disabled={loading}
              />
              {password && (
                <div className="mt-2 text-xs space-y-1">
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-gray-300">
                Confirm Password *
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
                placeholder="Confirm new password"
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
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-400">
            <Link href="/auth/signin" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: '#ff9e19' }}>
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
