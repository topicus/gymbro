import { Card, Button } from './ui'
import { ProgressBar } from './ProgressBar'
import type { Chapter, ChapterStatus } from '@/types'

interface ChapterCardProps {
  chapter: Chapter
  progress: number
  onStatusChange: (status: ChapterStatus) => void
  onEdit: () => void
  onDelete: () => void
}

export function ChapterCard({ chapter, progress, onStatusChange, onEdit, onDelete }: ChapterCardProps) {
  const focusColors = {
    drainage: 'bg-blue-100 text-blue-700',
    strength: 'bg-red-100 text-red-700',
    maintenance: 'bg-green-100 text-green-700',
  }

  const statusColors = {
    active: 'bg-green-500',
    paused: 'bg-yellow-500',
    completed: 'bg-gray-500',
  }

  const daysPassed = chapter.start_date
    ? Math.floor((new Date().getTime() - new Date(chapter.start_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <Card className="relative">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${statusColors[chapter.status]}`} />
            <h3 className="font-semibold text-gray-900">{chapter.chapter_name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${focusColors[chapter.focus]}`}>
              {chapter.focus}
            </span>
            <span className="text-sm text-gray-500">
              {chapter.duration} days
            </span>
          </div>
        </div>
      </div>

      {chapter.status === 'active' && chapter.start_date && (
        <div className="mb-4">
          <ProgressBar
            value={progress}
            label={`Day ${daysPassed} of ${chapter.duration}`}
          />
        </div>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {chapter.status === 'paused' && (
          <Button size="sm" onClick={() => onStatusChange('active')}>
            Activate
          </Button>
        )}
        {chapter.status === 'active' && (
          <>
            <Button size="sm" variant="secondary" onClick={() => onStatusChange('paused')}>
              Pause
            </Button>
            <Button size="sm" onClick={() => onStatusChange('completed')}>
              Complete
            </Button>
          </>
        )}
        {chapter.status === 'completed' && (
          <Button size="sm" variant="secondary" onClick={() => onStatusChange('paused')}>
            Restart
          </Button>
        )}
        <div className="flex-1" />
        <Button size="sm" variant="ghost" onClick={onEdit}>
          Edit
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </Card>
  )
}
