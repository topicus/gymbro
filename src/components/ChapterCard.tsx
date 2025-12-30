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
    drainage: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    strength: 'bg-red-500/10 text-red-400 border-red-500/20',
    maintenance: 'bg-green-500/10 text-green-400 border-green-500/20',
  }

  const statusColors = {
    active: 'bg-primary-500 shadow-[0_0_10px_rgba(132,204,22,0.5)]',
    paused: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
    completed: 'bg-gray-500',
  }

  const daysPassed = chapter.start_date
    ? Math.floor((new Date().getTime() - new Date(chapter.start_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`w-2 h-2 rounded-full ${statusColors[chapter.status]}`} />
            <h3 className="font-semibold text-white">{chapter.chapter_name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${focusColors[chapter.focus]}`}>
              {chapter.focus}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {chapter.duration} DAYS
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

      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
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
