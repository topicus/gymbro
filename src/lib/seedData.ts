import { supabase, isMockMode } from './supabase'
import { mockStore } from './mockData'

const getLocalDateString = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

export async function wipeAndSeedData(userId: string) {
  if (isMockMode) {
    console.log('Running in mock mode - resetting mock store')
    mockStore.reset()
    return { success: true, message: 'Mock data reset' }
  }

  console.log('Wiping existing data...')

  // Delete all user data
  await supabase.from('daily_check_ins').delete().eq('user_id', userId)
  await supabase.from('chapters').delete().eq('user_id', userId)

  console.log('Generating test data...')

  // Generate check-ins for the past 14 days (skip some days randomly)
  const checkIns = []
  const today = new Date()

  for (let i = 13; i >= 0; i--) {
    // 80% chance to have a check-in on any given day
    if (Math.random() > 0.2) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      checkIns.push({
        user_id: userId,
        date: getLocalDateString(date),
        weight: randomInt(70, 90) + Math.random(),
        energy: randomInt(1, 5),
        movement_done: Math.random() > 0.3,
        alcohol_intake: randomChoice(['none', 'none', 'none', 'low', 'moderate', 'high']),
        notes: randomChoice([
          null,
          'Felt great today!',
          'Tired but pushed through',
          'Rest day',
          'Good workout session',
          'Stressed from work',
          null,
          null
        ])
      })
    }
  }

  const { error: checkInError } = await supabase
    .from('daily_check_ins')
    .insert(checkIns)

  if (checkInError) {
    console.error('Error inserting check-ins:', checkInError)
    return { success: false, message: checkInError.message }
  }

  // Generate a chapter
  const chapterStart = new Date(today)
  chapterStart.setDate(chapterStart.getDate() - 7)

  const { error: chapterError } = await supabase
    .from('chapters')
    .insert({
      user_id: userId,
      chapter_name: 'Test Chapter',
      focus: randomChoice(['drainage', 'strength', 'maintenance']),
      duration: 30,
      start_date: getLocalDateString(chapterStart),
      status: 'active'
    })

  if (chapterError) {
    console.error('Error inserting chapter:', chapterError)
    return { success: false, message: chapterError.message }
  }

  // Reset XP and streak
  const streakCount = checkIns.length
  const xpTotal = streakCount * 10

  await supabase
    .from('profiles')
    .update({ xp: xpTotal, soft_streaks: streakCount })
    .eq('id', userId)

  console.log(`Seeded ${checkIns.length} check-ins, 1 chapter, ${xpTotal} XP`)

  return {
    success: true,
    message: `Created ${checkIns.length} check-ins, 1 chapter, ${xpTotal} XP`
  }
}

// Expose to window for console access in dev
if (import.meta.env.DEV) {
  (window as any).wipeAndSeedData = wipeAndSeedData
}
