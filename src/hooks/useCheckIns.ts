import { useState, useEffect, useCallback } from 'react'
import { supabase, isMockMode } from '@/lib/supabase'
import { mockStore } from '@/lib/mockData'
import type { DailyCheckIn, CheckInFormData } from '@/types'

export function useCheckIns(userId: string | undefined) {
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCheckIns = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    if (isMockMode) {
      const mockCheckIns = mockStore.getCheckIns()
      setCheckIns(mockCheckIns)
      setLoading(false)
      return
    }

    const { data, error: fetchError } = await supabase
      .from('daily_check_ins')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30)

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setCheckIns(data || [])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchCheckIns()
  }, [fetchCheckIns])

  const addCheckIn = async (data: CheckInFormData): Promise<{ error: string | null; xpGained: number }> => {
    if (!userId) return { error: 'No user ID', xpGained: 0 }

    const today = new Date().toISOString().split('T')[0]
    const checkInData = {
      ...data,
      date: today,
      user_id: userId,
    }

    if (isMockMode) {
      mockStore.addCheckIn(checkInData)
      setCheckIns(mockStore.getCheckIns())
      const profile = mockStore.getProfile()
      const xpGained = 10 + Math.floor((profile?.soft_streaks || 0) * 0.5)
      return { error: null, xpGained }
    }

    // Check if already checked in today
    const { data: existing } = await supabase
      .from('daily_check_ins')
      .select('id')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    if (existing) {
      // Update existing check-in
      const { error: updateError } = await supabase
        .from('daily_check_ins')
        .update(data)
        .eq('id', existing.id)

      if (updateError) {
        return { error: updateError.message, xpGained: 0 }
      }
    } else {
      // Insert new check-in
      const { error: insertError } = await supabase
        .from('daily_check_ins')
        .insert(checkInData)

      if (insertError) {
        return { error: insertError.message, xpGained: 0 }
      }
    }

    await fetchCheckIns()
    // XP calculation happens in the profile hook
    return { error: null, xpGained: 10 }
  }

  const getTodayCheckIn = (): DailyCheckIn | null => {
    const today = new Date().toISOString().split('T')[0]
    return checkIns.find(c => c.date === today) || null
  }

  const hasCheckedInToday = (): boolean => {
    return getTodayCheckIn() !== null
  }

  const getRecentCheckIns = (limit: number = 7): DailyCheckIn[] => {
    return checkIns.slice(0, limit)
  }

  const calculateMissedDays = (): number => {
    if (checkIns.length === 0) return 0

    const today = new Date()
    const lastCheckIn = new Date(checkIns[0].date)
    const diffTime = today.getTime() - lastCheckIn.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    // Don't count today as missed if they haven't checked in yet
    return Math.max(0, diffDays - 1)
  }

  return {
    checkIns,
    loading,
    error,
    addCheckIn,
    getTodayCheckIn,
    hasCheckedInToday,
    getRecentCheckIns,
    calculateMissedDays,
    refetch: fetchCheckIns,
  }
}
