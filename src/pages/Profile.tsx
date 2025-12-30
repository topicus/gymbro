import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input } from '@/components/ui'
import type { Profile as ProfileType, ProfileFormData } from '@/types'

interface ProfileProps {
  profile: ProfileType | null
  onSave: (data: ProfileFormData) => Promise<{ error: string | null }>
  onPreloadChapters: () => Promise<void>
  isNewUser: boolean
}

export function Profile({ profile, onSave, onPreloadChapters, isNewUser }: ProfileProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProfileFormData>({
    age: profile?.age || 0,
    height: profile?.height || 0,
    weight: profile?.weight || 0,
    injury_notes: profile?.injury_notes || '',
    long_term_goal: profile?.long_term_goal || '',
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        age: profile.age,
        height: profile.height,
        weight: profile.weight,
        injury_notes: profile.injury_notes || '',
        long_term_goal: profile.long_term_goal,
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const { error: saveError } = await onSave(formData)

    if (saveError) {
      setError(saveError)
      setIsLoading(false)
      return
    }

    if (isNewUser) {
      await onPreloadChapters()
    }

    setIsLoading(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isNewUser ? 'Set Up Your Profile' : 'Edit Profile'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isNewUser
              ? 'Tell us about yourself to personalize your experience.'
              : 'Update your profile information.'}
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Age"
                value={formData.age || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                min="16"
                max="100"
                required
              />
              <Input
                type="number"
                label="Height (cm)"
                value={formData.height || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                min="100"
                max="250"
                required
              />
            </div>

            <Input
              type="number"
              label="Current Weight (kg)"
              step="0.1"
              value={formData.weight || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
              min="30"
              max="300"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Injury Notes <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={formData.injury_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, injury_notes: e.target.value }))}
                placeholder="Any injuries or physical limitations..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Long-term Goal
              </label>
              <textarea
                value={formData.long_term_goal}
                onChange={(e) => setFormData(prev => ({ ...prev, long_term_goal: e.target.value }))}
                placeholder="What do you want to achieve in the next 12+ months?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              {!isNewUser && (
                <Button type="button" variant="secondary" onClick={() => navigate('/')}>
                  Cancel
                </Button>
              )}
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? 'Saving...' : isNewUser ? 'Get Started' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
