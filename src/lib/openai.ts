import OpenAI from 'openai'
import type { Profile, Chapter, DailyCheckIn, ChatMessage } from '@/types'

const apiKey = import.meta.env.VITE_OPENAI_API_KEY

// Note: In production, this should go through a backend to protect the API key
const openai = apiKey ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true // Only for MVP - move to backend for production
}) : null

function buildSystemPrompt(profile: Profile | null, activeChapter: Chapter | null, recentCheckIns: DailyCheckIn[]): string {
  let context = `You are a fitness coach for Gymbro, a gamified personal performance app.
Your tone is direct, calm, intelligent, and non-preachy. You focus on adherence and consistency, not perfection.
Never count calories. Keep responses concise and actionable.`

  if (profile) {
    context += `\n\nUser Profile:
- Age: ${profile.age}
- Height: ${profile.height}cm
- Weight: ${profile.weight}kg
- Long-term goal: ${profile.long_term_goal}`
    if (profile.injury_notes) {
      context += `\n- Injuries/limitations: ${profile.injury_notes}`
    }
    context += `\n- XP: ${profile.xp}, Streak: ${profile.soft_streaks} days`
  }

  if (activeChapter) {
    context += `\n\nActive Chapter: "${activeChapter.chapter_name}"
- Focus: ${activeChapter.focus}
- Duration: ${activeChapter.duration} days`
    if (activeChapter.start_date) {
      const start = new Date(activeChapter.start_date)
      const now = new Date()
      const daysPassed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      const progress = Math.min(100, Math.round((daysPassed / activeChapter.duration) * 100))
      context += `\n- Progress: ${progress}% (day ${daysPassed} of ${activeChapter.duration})`
    }
  }

  if (recentCheckIns.length > 0) {
    context += `\n\nRecent Check-ins (last ${recentCheckIns.length} days):`
    recentCheckIns.slice(0, 5).forEach(checkIn => {
      context += `\n- ${checkIn.date}: ${checkIn.weight}kg, energy ${checkIn.energy}/5, bloating ${checkIn.bloating_level}/5, alcohol: ${checkIn.alcohol_intake}, moved: ${checkIn.movement_done ? 'yes' : 'no'}`
    })
  }

  return context
}

export async function sendMessage(
  messages: ChatMessage[],
  profile: Profile | null,
  activeChapter: Chapter | null,
  recentCheckIns: DailyCheckIn[]
): Promise<string> {
  if (!openai) {
    return "OpenAI API key not configured. Add VITE_OPENAI_API_KEY to your .env file."
  }

  const systemPrompt = buildSystemPrompt(profile, activeChapter, recentCheckIns)

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    ],
    max_tokens: 500,
    temperature: 0.7,
  })

  return response.choices[0]?.message?.content || 'No response generated.'
}

export const isOpenAIConfigured = !!apiKey
