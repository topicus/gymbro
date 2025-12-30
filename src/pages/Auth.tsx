import { useState } from 'react'
import { Card, Button, Input } from '@/components/ui'

type AuthMode = 'sign-in' | 'sign-up' | 'magic-link' | 'forgot-password'

interface AuthProps {
  onSignIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>
  onSignUp: (email: string, password: string) => Promise<{ error: { message: string } | null }>
  onResetPassword: (email: string) => Promise<{ error: { message: string } | null }>
  onMagicLink: (email: string) => Promise<{ error: { message: string } | null }>
  isMockMode: boolean
}

export function Auth({ onSignIn, onSignUp, onResetPassword, onMagicLink, isMockMode }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    let result: { error: { message: string } | null }

    switch (mode) {
      case 'sign-up':
        result = await onSignUp(email, password)
        if (!result.error) {
          setSuccess('Check your email for a confirmation link.')
        }
        break
      case 'magic-link':
        result = await onMagicLink(email)
        if (!result.error) {
          setSuccess('Check your email for a sign-in link.')
        }
        break
      case 'forgot-password':
        result = await onResetPassword(email)
        if (!result.error) {
          setSuccess('Check your email for a password reset link.')
        }
        break
      default:
        result = await onSignIn(email, password)
    }

    if (result.error) {
      setError(result.error.message)
    }
    setIsLoading(false)
  }

  const needsPassword = mode === 'sign-in' || mode === 'sign-up'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gymbro</h1>
          <p className="text-gray-600 mt-2">Your personal performance coach</p>
        </div>

        {isMockMode && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Running in demo mode. No Supabase connection.
            </p>
          </div>
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            {needsPassword && (
              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                minLength={6}
                required
              />
            )}

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            {success && (
              <p className="text-sm text-green-600">{success}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' :
                mode === 'sign-up' ? 'Create Account' :
                mode === 'magic-link' ? 'Send Magic Link' :
                mode === 'forgot-password' ? 'Send Reset Link' :
                'Sign In'}
            </Button>

            {mode === 'sign-in' && (
              <button
                type="button"
                onClick={() => switchMode('forgot-password')}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Forgot password?
              </button>
            )}

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            {mode !== 'magic-link' && (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => switchMode('magic-link')}
              >
                Sign in with Magic Link
              </Button>
            )}

            <p className="text-center text-sm text-gray-600">
              {mode === 'sign-up' ? (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => switchMode('sign-in')} className="text-primary-600 hover:underline font-medium">
                    Sign In
                  </button>
                </>
              ) : mode === 'magic-link' || mode === 'forgot-password' ? (
                <button type="button" onClick={() => switchMode('sign-in')} className="text-primary-600 hover:underline font-medium">
                  Back to Sign In
                </button>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => switchMode('sign-up')} className="text-primary-600 hover:underline font-medium">
                    Sign Up
                  </button>
                </>
              )}
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}
