import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Input } from '@/components/ui'
import { ChapterCard } from '@/components/ChapterCard'
import type { Chapter, ChapterFormData, ChapterFocus, ChapterStatus } from '@/types'

interface ChaptersProps {
  chapters: Chapter[]
  onAdd: (data: ChapterFormData) => Promise<{ error: string | null }>
  onUpdate: (id: string, data: Partial<Chapter>) => Promise<{ error: string | null }>
  onDelete: (id: string) => Promise<{ error: string | null }>
  onStatusChange: (id: string, status: ChapterStatus) => Promise<{ error: string | null }>
  getProgress: (chapter: Chapter) => number
}

export function Chapters({ chapters, onAdd, onUpdate, onDelete, onStatusChange, getProgress }: ChaptersProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [formData, setFormData] = useState<ChapterFormData>({
    chapter_name: '',
    duration: 30,
    focus: 'strength',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenModal = (chapter?: Chapter) => {
    if (chapter) {
      setEditingChapter(chapter)
      setFormData({
        chapter_name: chapter.chapter_name,
        duration: chapter.duration,
        focus: chapter.focus,
      })
    } else {
      setEditingChapter(null)
      setFormData({ chapter_name: '', duration: 30, focus: 'strength' })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingChapter(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (editingChapter) {
      await onUpdate(editingChapter.id, formData)
    } else {
      await onAdd(formData)
    }

    setIsLoading(false)
    handleCloseModal()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this chapter?')) {
      await onDelete(id)
    }
  }

  const activeChapters = chapters.filter(c => c.status === 'active')
  const pausedChapters = chapters.filter(c => c.status === 'paused')
  const completedChapters = chapters.filter(c => c.status === 'completed')

  const focusOptions: { value: ChapterFocus; label: string }[] = [
    { value: 'drainage', label: 'Drainage' },
    { value: 'strength', label: 'Strength' },
    { value: 'maintenance', label: 'Maintenance' },
  ]

  return (
    <div className="min-h-screen pb-20">
      <div className="glass border-b border-white/5 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Back
            </Link>
            <h1 className="text-xl font-bold text-white text-glow mt-1">Chapters</h1>
          </div>
          <Button onClick={() => handleOpenModal()}>New Chapter</Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {activeChapters.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Active</h2>
            <div className="space-y-3">
              {activeChapters.map(chapter => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  progress={getProgress(chapter)}
                  onStatusChange={(status) => onStatusChange(chapter.id, status)}
                  onEdit={() => handleOpenModal(chapter)}
                  onDelete={() => handleDelete(chapter.id)}
                />
              ))}
            </div>
          </section>
        )}

        {pausedChapters.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Paused</h2>
            <div className="space-y-3">
              {pausedChapters.map(chapter => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  progress={getProgress(chapter)}
                  onStatusChange={(status) => onStatusChange(chapter.id, status)}
                  onEdit={() => handleOpenModal(chapter)}
                  onDelete={() => handleDelete(chapter.id)}
                />
              ))}
            </div>
          </section>
        )}

        {completedChapters.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Completed</h2>
            <div className="space-y-3">
              {completedChapters.map(chapter => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  progress={1}
                  onStatusChange={(status) => onStatusChange(chapter.id, status)}
                  onEdit={() => handleOpenModal(chapter)}
                  onDelete={() => handleDelete(chapter.id)}
                />
              ))}
            </div>
          </section>
        )}

        {chapters.length === 0 && (
          <Card className="text-center py-8">
            <p className="text-gray-400">No chapters yet. Create your first chapter to get started.</p>
          </Card>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md border-white/10 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 text-glow">
              {editingChapter ? 'Edit Chapter' : 'New Chapter'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Chapter Name"
                value={formData.chapter_name}
                onChange={(e) => setFormData(prev => ({ ...prev, chapter_name: e.target.value }))}
                placeholder="e.g., Summer Shred"
                required
              />
              <Input
                type="number"
                label="Duration (days)"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                min="7"
                max="365"
                required
              />
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Focus</label>
                <div className="flex gap-2">
                  {focusOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, focus: option.value }))}
                      className={`flex-1 py-2 rounded-lg border transition-all duration-200 font-medium text-sm ${
                        formData.focus === option.value
                          ? 'border-primary-500 bg-primary-500/10 text-primary-400 shadow-[0_0_15px_rgba(132,204,22,0.2)]'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Saving...' : editingChapter ? 'Save' : 'Create'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
