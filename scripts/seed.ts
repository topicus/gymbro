import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const getLocalDateString = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

async function wipeData(userId: string) {
  console.log('Wiping existing data...')

  const { error: checkInError } = await supabase
    .from('daily_check_ins')
    .delete()
    .eq('user_id', userId)

  if (checkInError) {
    console.error('Error deleting check-ins:', checkInError.message)
  }

  const { error: chapterError } = await supabase
    .from('chapters')
    .delete()
    .eq('user_id', userId)

  if (chapterError) {
    console.error('Error deleting chapters:', chapterError.message)
  }

  // Reset XP and streak
  await supabase
    .from('profiles')
    .update({ xp: 0, soft_streaks: 0 })
    .eq('id', userId)

  console.log('Data wiped successfully!')
}

async function seedData(userId: string) {
  console.log('Generating test data...')

  const today = new Date()
  const checkIns = []

  // Generate check-ins for the past 14 days (skip some days randomly)
  for (let i = 13; i >= 0; i--) {
    if (Math.random() > 0.2) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      checkIns.push({
        user_id: userId,
        date: getLocalDateString(date),
        weight: Math.round((randomInt(70, 90) + Math.random()) * 10) / 10,
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
    console.error('Error inserting check-ins:', checkInError.message)
    return
  }

  console.log(`Created ${checkIns.length} check-ins`)

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
    console.error('Error inserting chapter:', chapterError.message)
    return
  }

  console.log('Created 1 chapter')

  // Update XP and streak
  const xpTotal = checkIns.length * 10

  await supabase
    .from('profiles')
    .update({ xp: xpTotal, soft_streaks: checkIns.length })
    .eq('id', userId)

  console.log(`Set XP to ${xpTotal}, streak to ${checkIns.length}`)
  console.log('Done!')
}

async function main() {
  const command = process.argv[2]
  const userId = process.argv[3]

  if (!userId) {
    // Try to get user from most recent session
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error || !users?.length) {
      console.error('Usage: npm run db:wipe <user-id>')
      console.error('       npm run db:seed <user-id>')
      console.error('')
      console.error('Get your user ID from Supabase Dashboard > Authentication > Users')
      process.exit(1)
    }
  }

  if (command === 'wipe') {
    await wipeData(userId)
  } else if (command === 'seed') {
    await wipeData(userId)
    await seedData(userId)
  } else {
    console.error('Unknown command. Use "wipe" or "seed"')
    process.exit(1)
  }
}

main().catch(console.error)
