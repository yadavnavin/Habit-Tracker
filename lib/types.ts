// app/lib/types.ts

// lib/types.ts (or wherever your types are defined)

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  completed: boolean;
  frequency: 'once' | 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'custom' | 'monthly';
  selectedDays?: number[]; // ✅ For custom frequency
  priority?: 'low' | 'medium' | 'high'; // ✅ New field
  category?: string; // ✅ New field
  createdAt?: string;
}


export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  streak: number;
  lastCompletedDate: string;
  completedDates: string[];
  reminderTime?: string;
  reminderEnabled: boolean;
}

export interface DailyStats {
  date: string;
  tasksCompleted: number;
  tasksTotal: number;
  habitsCompleted: number;
  habitsTotal: number;
  completionRate: number;
}

export interface AppState {
  tasks: Task[];
  habits: Habit[];
  selectedDate: string;
  view: 'overview' | 'week' | 'month' | 'habits' | 'stats' | 'settings';  // ✅ Removed 'day'
  stats: DailyStats[];
}
