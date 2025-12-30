import { useState, useEffect, useCallback } from 'react'
import { supabase, isMockMode } from '@/lib/supabase'
import { mockStore, DEFAULT_CHAPTERS } from '@/lib/mockData'
import type { Chapter, ChapterFormData, ChapterStatus } from '@/types'

export function useChapters(userId: string | undefined) {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChapters = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    if (isMockMode) {
      const mockChapters = mockStore.getChapters()
      setChapters(mockChapters)
      setLoading(false)
      return
    }

    const { data, error: fetchError } = await supabase
      .from('chapters')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setChapters(data || [])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchChapters()
  }, [fetchChapters])

  const preloadDefaultChapters = async () => {
    if (!userId) return

    if (isMockMode) {
      // Mock store auto-preloads chapters when profile is created
      return
    }

    // Check if user already has chapters
    const { data: existing } = await supabase
      .from('chapters')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (existing && existing.length > 0) return

    // Insert default chapters
    const chaptersToInsert = DEFAULT_CHAPTERS.map(chapter => ({
      ...chapter,
      user_id: userId,
    }))

    await supabase.from('chapters').insert(chaptersToInsert)
    await fetchChapters()
  }

  const addChapter = async (data: ChapterFormData): Promise<{ error: string | null }> => {
    if (!userId) return { error: 'No user ID' }

    if (isMockMode) {
      mockStore.addChapter({
        ...data,
        status: 'paused',
        start_date: null,
      })
      setChapters(mockStore.getChapters())
      return { error: null }
    }

    const { error: insertError } = await supabase
      .from('chapters')
      .insert({
        ...data,
        user_id: userId,
        status: 'paused',
        start_date: null,
      })

    if (insertError) {
      return { error: insertError.message }
    }

    await fetchChapters()
    return { error: null }
  }

  const updateChapter = async (id: string, data: Partial<Chapter>): Promise<{ error: string | null }> => {
    if (isMockMode) {
      mockStore.updateChapter(id, data)
      setChapters(mockStore.getChapters())
      return { error: null }
    }

    // If activating, pause all other chapters first
    if (data.status === 'active') {
      await supabase
        .from('chapters')
        .update({ status: 'paused' })
        .eq('user_id', userId)
        .eq('status', 'active')

      // Set start date if not already set
      const currentChapter = chapters.find(c => c.id === id)
      if (currentChapter && !currentChapter.start_date) {
        data.start_date = new Date().toISOString().split('T')[0]
      }
    }

    const { error: updateError } = await supabase
      .from('chapters')
      .update(data)
      .eq('id', id)

    if (updateError) {
      return { error: updateError.message }
    }

    await fetchChapters()
    return { error: null }
  }

  const deleteChapter = async (id: string): Promise<{ error: string | null }> => {
    if (isMockMode) {
      mockStore.deleteChapter(id)
      setChapters(mockStore.getChapters())
      return { error: null }
    }

    const { error: deleteError } = await supabase
      .from('chapters')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return { error: deleteError.message }
    }

    await fetchChapters()
    return { error: null }
  }

  const setChapterStatus = async (id: string, status: ChapterStatus) => {
    return updateChapter(id, { status })
  }

  const activeChapter = chapters.find(c => c.status === 'active') || null

  const getChapterProgress = (chapter: Chapter): number => {
    if (!chapter.start_date) return 0
    const start = new Date(chapter.start_date)
    const now = new Date()
    const daysPassed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return Math.min(1, daysPassed / chapter.duration)
  }

  return {
    chapters,
    activeChapter,
    loading,
    error,
    addChapter,
    updateChapter,
    deleteChapter,
    setChapterStatus,
    preloadDefaultChapters,
    getChapterProgress,
    refetch: fetchChapters,
  }
}
