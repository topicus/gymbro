import type { Profile, Chapter, DailyCheckIn } from '@/types'

// Default chapters to preload for new users
export const DEFAULT_CHAPTERS: Omit<Chapter, 'id' | 'user_id' | 'created_at'>[] = [
  {
    chapter_name: 'Brazil Trip Preparation',
    duration: 60,
    focus: 'drainage',
    status: 'active',
    start_date: new Date().toISOString().split('T')[0],
  },
  {
    chapter_name: 'Europe Trip Maintenance',
    duration: 40,
    focus: 'maintenance',
    status: 'paused',
    start_date: null,
  },
  {
    chapter_name: 'End-of-Year Purpose',
    duration: 30,
    focus: 'strength',
    status: 'paused',
    start_date: null,
  },
]

// In-memory storage for development
class MockStore {
  private profile: Profile | null = null
  private chapters: Chapter[] = []
  private checkIns: DailyCheckIn[] = []
  private userId = 'mock-user-id'

  // Profile methods
  getProfile(): Profile | null {
    return this.profile
  }

  setProfile(data: Partial<Profile>): Profile {
    if (!this.profile) {
      this.profile = {
        id: this.userId,
        age: data.age || 0,
        height: data.height || 0,
        weight: data.weight || 0,
        injury_notes: data.injury_notes || null,
        long_term_goal: data.long_term_goal || '',
        xp: 0,
        soft_streaks: 0,
        created_at: new Date().toISOString(),
      }
      // Preload default chapters for new users
      this.preloadChapters()
    } else {
      this.profile = { ...this.profile, ...data }
    }
    return this.profile
  }

  updateXpAndStreak(xpGain: number, streakChange: number): Profile | null {
    if (this.profile) {
      this.profile.xp += xpGain
      this.profile.soft_streaks = Math.max(0, this.profile.soft_streaks + streakChange)
    }
    return this.profile
  }

  // Chapter methods
  private preloadChapters(): void {
    DEFAULT_CHAPTERS.forEach((chapter, index) => {
      this.chapters.push({
        ...chapter,
        id: `chapter-${index + 1}`,
        user_id: this.userId,
        created_at: new Date().toISOString(),
      })
    })
  }

  getChapters(): Chapter[] {
    return this.chapters
  }

  getActiveChapter(): Chapter | null {
    return this.chapters.find(c => c.status === 'active') || null
  }

  addChapter(data: Omit<Chapter, 'id' | 'user_id' | 'created_at'>): Chapter {
    const chapter: Chapter = {
      ...data,
      id: `chapter-${Date.now()}`,
      user_id: this.userId,
      created_at: new Date().toISOString(),
    }
    this.chapters.push(chapter)
    return chapter
  }

  updateChapter(id: string, data: Partial<Chapter>): Chapter | null {
    const index = this.chapters.findIndex(c => c.id === id)
    if (index !== -1) {
      // If activating a chapter, pause all others
      if (data.status === 'active') {
        this.chapters.forEach(c => {
          if (c.id !== id && c.status === 'active') {
            c.status = 'paused'
          }
        })
        // Set start date if not already set
        if (!this.chapters[index].start_date) {
          data.start_date = new Date().toISOString().split('T')[0]
        }
      }
      this.chapters[index] = { ...this.chapters[index], ...data }
      return this.chapters[index]
    }
    return null
  }

  deleteChapter(id: string): boolean {
    const index = this.chapters.findIndex(c => c.id === id)
    if (index !== -1) {
      this.chapters.splice(index, 1)
      return true
    }
    return false
  }

  // Check-in methods
  getCheckIns(): DailyCheckIn[] {
    return this.checkIns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  getTodayCheckIn(): DailyCheckIn | null {
    const today = new Date().toISOString().split('T')[0]
    return this.checkIns.find(c => c.date === today) || null
  }

  addCheckIn(data: Omit<DailyCheckIn, 'id' | 'user_id' | 'created_at'>): DailyCheckIn {
    // Remove existing check-in for the same date
    const existingIndex = this.checkIns.findIndex(c => c.date === data.date)
    if (existingIndex !== -1) {
      this.checkIns.splice(existingIndex, 1)
    }

    const checkIn: DailyCheckIn = {
      ...data,
      id: `checkin-${Date.now()}`,
      user_id: this.userId,
      created_at: new Date().toISOString(),
    }
    this.checkIns.push(checkIn)

    // Update XP and streak
    const baseXp = 10
    const streakBonus = Math.floor(this.profile?.soft_streaks || 0 * 0.5)
    this.updateXpAndStreak(baseXp + streakBonus, 1)

    return checkIn
  }

  // Reset for testing
  reset(): void {
    this.profile = null
    this.chapters = []
    this.checkIns = []
  }
}

export const mockStore = new MockStore()
