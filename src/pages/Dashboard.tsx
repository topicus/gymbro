import { Link } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import { ProgressBar } from '@/components/ProgressBar'
import type { Profile, Chapter, DailyCheckIn } from '@/types'

interface DashboardProps {
  profile: Profile
  activeChapter: Chapter | null
  recentCheckIns: DailyCheckIn[]
  hasCheckedInToday: boolean
  chapterProgress: number
  onSignOut: () => void
}

export function Dashboard({
  profile,
  activeChapter,
  recentCheckIns,
  hasCheckedInToday,
  chapterProgress,
  onSignOut,
}: DashboardProps) {
  const daysPassed = activeChapter?.start_date
    ? Math.floor((new Date().getTime() - new Date(activeChapter.start_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Gymbro</h1>
            <p className="text-sm text-gray-500">{profile.long_term_goal}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/profile">
              <Button variant="ghost" size="sm">Profile</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={onSignOut}>Sign Out</Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">{profile.xp}</p>
              <p className="text-sm text-gray-500">Total XP</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-500">{profile.soft_streaks}</p>
              <p className="text-sm text-gray-500">Day Streak</p>
            </div>
          </Card>
        </div>

        {/* Active Chapter */}
        {activeChapter ? (
          <Card>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">Active Chapter</p>
                <h2 className="text-lg font-semibold text-gray-900">{activeChapter.chapter_name}</h2>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                activeChapter.focus === 'drainage' ? 'bg-blue-100 text-blue-700' :
                activeChapter.focus === 'strength' ? 'bg-red-100 text-red-700' :
                'bg-green-100 text-green-700'
              }`}>
                {activeChapter.focus}
              </span>
            </div>
            <ProgressBar
              value={chapterProgress}
              label={`Day ${daysPassed} of ${activeChapter.duration}`}
              size="lg"
            />
            <div className="mt-4">
              <Link to="/chapters">
                <Button variant="secondary" size="sm">Manage Chapters</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="text-center py-4">
              <p className="text-gray-500 mb-3">No active chapter</p>
              <Link to="/chapters">
                <Button>Start a Chapter</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Check-in CTA */}
        <Card className={hasCheckedInToday ? 'bg-primary-50 border-primary-200' : ''}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {hasCheckedInToday ? 'Checked in today' : 'Daily Check-in'}
              </h3>
              <p className="text-sm text-gray-500">
                {hasCheckedInToday ? 'Great job! Come back tomorrow.' : 'Track your progress'}
              </p>
            </div>
            <Link to="/check-in">
              <Button variant={hasCheckedInToday ? 'secondary' : 'primary'}>
                {hasCheckedInToday ? 'Update' : 'Check In'}
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Check-ins */}
        {recentCheckIns.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Recent Check-ins
            </h3>
            <Card padding="none">
              <div className="divide-y divide-gray-100">
                {recentCheckIns.slice(0, 5).map((checkIn) => (
                  <div key={checkIn.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(checkIn.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{checkIn.weight}kg</span>
                        <span>Energy: {checkIn.energy}/5</span>
                        {checkIn.movement_done && <span className="text-primary-600">Moved</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {checkIn.alcohol_intake !== 'none' && (
                        <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">
                          {checkIn.alcohol_intake}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
