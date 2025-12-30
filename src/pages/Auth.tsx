import { useState } from 'react'
import { Card, Button, Input } from '@/components/ui'

type AuthMode = 'sign-in' | 'sign-up' | 'magic-link' | 'forgot-password'

interface AuthProps {
  onSignIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>
  onSignUp: (email: string, password: string) => Promise<{ error: { message: string } | null }>
  onResetPassword: (email: string) => Promise<{ error: { message: string } | null }>
  onMagicLink: (email: string) => Promise<{ error: { message: string } | null }>
  onGoogle: () => Promise<{ error: { message: string } | null }>
  isMockMode: boolean
}

export function Auth({ onSignIn, onSignUp, onResetPassword, onMagicLink, onGoogle, isMockMode }: AuthProps) {
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white text-glow">Gymbro</h1>
          <p className="text-gray-400 mt-2">Your personal performance coach</p>
        </div>

        {isMockMode && (
          <div className="mb-4 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg">
            <p className="text-sm text-primary-400">
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
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            {success && (
              <p className="text-sm text-primary-400 text-center">{success}</p>
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
                className="w-full text-sm text-gray-500 hover:text-white transition-colors"
              >
                Forgot password?
              </button>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-dark-950 px-4 text-gray-500">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full flex items-center justify-center gap-2"
              onClick={onGoogle}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            {mode !== 'magic-link' && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => switchMode('magic-link')}
              >
                Sign in with Magic Link
              </Button>
            )}

            <p className="text-center text-sm text-gray-500">
              {mode === 'sign-up' ? (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => switchMode('sign-in')} className="text-primary-500 hover:text-primary-400 font-semibold transition-colors">
                    Sign In
                  </button>
                </>
              ) : mode === 'magic-link' || mode === 'forgot-password' ? (
                <button type="button" onClick={() => switchMode('sign-in')} className="text-primary-500 hover:text-primary-400 font-semibold transition-colors">
                  Back to Sign In
                </button>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => switchMode('sign-up')} className="text-primary-500 hover:text-primary-400 font-semibold transition-colors">
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
