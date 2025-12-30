import { useState, useEffect, useCallback } from 'react'
import { supabase, isMockMode } from '@/lib/supabase'
import { mockStore } from '@/lib/mockData'
import type { Profile, ProfileFormData } from '@/types'

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    if (isMockMode) {
      const mockProfile = mockStore.getProfile()
      setProfile(mockProfile)
      setLoading(false)
      return
    }

    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      setError(fetchError.message)
    } else {
      setProfile(data)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const saveProfile = async (data: ProfileFormData): Promise<{ error: string | null }> => {
    if (!userId) return { error: 'No user ID' }

    if (isMockMode) {
      const updated = mockStore.setProfile(data)
      setProfile(updated)
      return { error: null }
    }

    const profileData = {
      id: userId,
      ...data,
      xp: profile?.xp || 0,
      soft_streaks: profile?.soft_streaks || 0,
    }

    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert(profileData)

    if (upsertError) {
      return { error: upsertError.message }
    }

    await fetchProfile()
    return { error: null }
  }

  const updateXpAndStreak = async (xpGain: number, streakChange: number) => {
    if (!userId || !profile) return

    if (isMockMode) {
      const updated = mockStore.updateXpAndStreak(xpGain, streakChange)
      setProfile(updated)
      return
    }

    const newXp = profile.xp + xpGain
    const newStreak = Math.max(0, profile.soft_streaks + streakChange)

    await supabase
      .from('profiles')
      .update({ xp: newXp, soft_streaks: newStreak })
      .eq('id', userId)

    setProfile(prev => prev ? { ...prev, xp: newXp, soft_streaks: newStreak } : null)
  }

  return {
    profile,
    loading,
    error,
    saveProfile,
    updateXpAndStreak,
    refetch: fetchProfile,
    hasProfile: !!profile,
  }
}
