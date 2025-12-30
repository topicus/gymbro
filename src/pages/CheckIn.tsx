import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card } from '@/components/ui'
import { CheckInForm } from '@/components/CheckInForm'
import type { CheckInFormData, DailyCheckIn } from '@/types'

interface CheckInProps {
  todayCheckIn: DailyCheckIn | null
  onSubmit: (data: CheckInFormData) => Promise<{ error: string | null; xpGained: number }>
}

export function CheckIn({ todayCheckIn, onSubmit }: CheckInProps) {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="text-center py-8 px-6 max-w-sm w-full">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Check-in Complete!</h2>
          <p className="text-primary-600 font-medium">+{xpGained} XP</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-1">Daily Check-in</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {todayCheckIn && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              You already checked in today. Submitting again will update your entry.
            </p>
          </div>
        )}

        <CheckInForm
          onSubmit={handleSubmit}
          initialData={todayCheckIn || undefined}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
