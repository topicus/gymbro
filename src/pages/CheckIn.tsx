import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card } from '@/components/ui'
import { CheckInForm } from '@/components/CheckInForm'
import type { CheckInFormData, DailyCheckIn } from '@/types'

interface CheckInProps {
  todayCheckIn: DailyCheckIn | null
  lastCheckIn: DailyCheckIn | null
  onSubmit: (data: CheckInFormData) => Promise<{ error: string | null; xpGained: number }>
}

export function CheckIn({ todayCheckIn, lastCheckIn, onSubmit }: CheckInProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [xpGained, setXpGained] = useState<number | null>(null)

  const handleSubmit = async (data: CheckInFormData) => {
    setIsLoading(true)
    const { error, xpGained: xp } = await onSubmit(data)
    setIsLoading(false)

    if (!error) {
      setXpGained(xp)
      setTimeout(() => navigate('/'), 1500)
    }
  }

  if (xpGained !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="text-center py-8 px-6 max-w-sm w-full">
          <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-500/20">
            <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Check-in Complete!</h2>
          <p className="text-primary-500 font-medium text-glow">+{xpGained} XP</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="glass border-b border-white/5 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto">
          <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-white text-glow mt-1">Daily Check-in</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {todayCheckIn && (
          <div className="mb-4 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg">
            <p className="text-sm text-primary-400">
              You already checked in today. Submitting again will update your entry.
            </p>
          </div>
        )}

        <CheckInForm
          onSubmit={handleSubmit}
          initialData={todayCheckIn || lastCheckIn || undefined}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
