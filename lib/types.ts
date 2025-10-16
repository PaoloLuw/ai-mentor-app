export interface UserProfile {
  id: string
  display_name: string | null
  llm_role: "mentor" | "terapeuta" | "maestro"
  theme?: "light" | "dark" // Added theme preference
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  emoji: string
  color: string
  is_distraction: boolean
  created_at: string
}

export interface Activity {
  id: string
  user_id: string
  category_id: string
  start_time: string
  end_time: string | null
  notes: string | null
  created_at: string
  category?: Category
}

export interface Thought {
  id: string
  user_id: string
  content: string
  tags: string[] | null
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  target_date: string | null
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  goal_id: string | null
  title: string
  description: string | null
  is_completed: boolean
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface CoachMessage {
  id: string
  user_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export interface Insight {
  id: string
  user_id: string
  date: string
  summary: string
  suggestions: string[] | null
  created_at: string
}
