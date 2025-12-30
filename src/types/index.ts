// User Profile
export interface Profile {
  id: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  injury_notes: string | null;
  long_term_goal: string;
  xp: number;
  soft_streaks: number;
  created_at: string;
}

// Chapter focus types
export type ChapterFocus = 'drainage' | 'strength' | 'maintenance';

// Chapter status types
export type ChapterStatus = 'active' | 'paused' | 'completed';

// Chapter
export interface Chapter {
  id: string;
  user_id: string;
  chapter_name: string;
  duration: number; // days
  focus: ChapterFocus;
  status: ChapterStatus;
  start_date: string | null;
  created_at: string;
}

// Alcohol intake levels
export type AlcoholIntake = 'none' | 'low' | 'high';

// Daily Check-in
export interface DailyCheckIn {
  id: string;
  user_id: string;
  date: string; // ISO 8601
  weight: number; // kg
  bloating_level: number; // 1-5
  energy: number; // 1-5
  alcohol_intake: AlcoholIntake;
  movement_done: boolean;
  created_at: string;
}

// Progress summary
export interface Progress {
  xp: number;
  soft_streaks: number;
  chapter_progress_bar: number; // 0-1
}

// Form types for creating/editing
export interface ProfileFormData {
  age: number;
  height: number;
  weight: number;
  injury_notes: string;
  long_term_goal: string;
}

export interface ChapterFormData {
  chapter_name: string;
  duration: number;
  focus: ChapterFocus;
}

export interface CheckInFormData {
  weight: number;
  bloating_level: number;
  energy: number;
  alcohol_intake: AlcoholIntake;
  movement_done: boolean;
}

// Auth types
export interface AuthState {
  user: { id: string; email: string } | null;
  loading: boolean;
}

// Chat message type
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
