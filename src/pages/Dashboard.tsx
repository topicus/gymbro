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
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="glass border-b border-white/5 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white text-glow">Gymbro</h1>
            <p className="text-sm text-gray-400">{profile.long_term_goal}</p>
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
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600 text-glow">{profile.xp}</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Total XP</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 text-glow">{profile.soft_streaks}</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Day Streak</p>
            </div>
          </Card>
        </div>

        {/* Active Chapter */}
        {activeChapter ? (
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <div className="w-32 h-32 bg-primary-500 rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Active Chapter</p>
                  <h2 className="text-lg font-semibold text-white">{activeChapter.chapter_name}</h2>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  activeChapter.focus === 'drainage' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  activeChapter.focus === 'strength' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  'bg-green-500/10 text-green-400 border-green-500/20'
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
            </div>
          </Card>
        ) : (
          <Card>
            <div className="text-center py-4">
              <p className="text-gray-400 mb-3">No active chapter</p>
              <Link to="/chapters">
                <Button>Start a Chapter</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Check-in CTA - only show if not checked in today */}
        {!hasCheckedInToday && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Daily Check-in</h3>
                <p className="text-sm text-gray-400">Track your progress</p>
              </div>
              <Link to="/check-in">
                <Button>Check In</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Recent Check-ins */}
        {recentCheckIns.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Recent Check-ins
            </h3>
            <Card padding="none">
              <div className="divide-y divide-white/5">
                {recentCheckIns.slice(0, 5).map((checkIn) => {
                  const now = new Date()
                  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
                  const isToday = checkIn.date === todayStr
                  return (
                    <div key={checkIn.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-gray-200">
                          {new Date(checkIn.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {isToday && <span className="ml-2 text-xs text-primary-400">(Today)</span>}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span>{checkIn.weight}kg</span>
                          <span>Energy: {checkIn.energy}/5</span>
                          {checkIn.movement_done && <span className="text-primary-400">Moved</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {checkIn.alcohol_intake !== 'none' && (
                          <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded">
                            {checkIn.alcohol_intake}
                          </span>
                        )}
                        {isToday && (
                          <Link to="/check-in">
                            <Button variant="ghost" size="sm">Edit</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
