// app/lib/store.ts

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Habit, AppState } from './types';

interface StoreState extends AppState {
  // Task actions
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  getTodayTasks: () => Task[];
  getTasksForDate: (date: string) => Task[]; // ✅ New method for recurring tasks

  // Habit actions
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, habit: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (id: string, date: string) => void;
  getHabitStats: (id: string) => { streak: number; completed: number; percentage: number };

  // View actions
  setSelectedDate: (date: string) => void;
  setView: (view: AppState['view']) => void;

  // Stats actions
  calculateStats: () => void;
}

// ✅ Helper function to check if task should appear on date
const shouldShowTaskOnDate = (task: Task, targetDate: string): boolean => {
  const taskDate = new Date(task.date);
  const checkDate = new Date(targetDate);
  
  // Task must start on or before the target date
  if (taskDate > checkDate) return false;

  switch (task.frequency) {
    case 'daily':
      return true; // Show every day after start date

    case 'weekly':
      // Show on same day of week as original task
      return taskDate.getDay() === checkDate.getDay();

    case 'monthly':
      // Show on same date each month
      return taskDate.getDate() === checkDate.getDate();

    case 'once':
    default:
      // Show only on exact date
      return task.date === targetDate;
  }
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      tasks: [],
      habits: [],
      selectedDate: new Date().toISOString().split('T')[0],
      view: 'overview',
      stats: [],

      // Task Actions
      addTask: (taskData) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...taskData,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              frequency: taskData.frequency || 'once', // ✅ Default to 'once'
              completed: false,
            } as Task,
          ],
        })),

      updateTask: (id: string, updates: Partial<Task>) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),

      deleteTask: (id: string) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      toggleTaskCompletion: (id: string) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          ),
        })),

      getTodayTasks: () => {
        const state = get();
        return state.tasks.filter((task) => shouldShowTaskOnDate(task, state.selectedDate));
      },

      // ✅ New method: Get tasks for any date (handles recurring tasks)
      getTasksForDate: (date: string) => {
        const state = get();
        return state.tasks.filter((task) => shouldShowTaskOnDate(task, date));
      },

      // Habit Actions
      addHabit: (habit: Habit) =>
        set((state) => ({
          habits: [...state.habits, habit],
        })),

      updateHabit: (id: string, updates: Partial<Habit>) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, ...updates } : habit
          ),
        })),

      deleteHabit: (id: string) =>
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        })),

      toggleHabitCompletion: (id: string, date: string) =>
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id === id) {
              const isCompleted = habit.completedDates.includes(date);
              const newCompletedDates = isCompleted
                ? habit.completedDates.filter((d) => d !== date)
                : [...habit.completedDates, date].sort();

              // Calculate streak properly
              let newStreak = 0;
              if (newCompletedDates.length > 0) {
                const sortedDates = newCompletedDates.sort((a, b) => 
                  new Date(b).getTime() - new Date(a).getTime()
                );
                
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                
                // Check if most recent completion is today or yesterday
                if (sortedDates[0] === today || sortedDates[0] === yesterday) {
                  newStreak = 1;
                  
                  // Count consecutive days backwards
                  for (let i = 0; i < sortedDates.length - 1; i++) {
                    const currentDate = new Date(sortedDates[i]);
                    const nextDate = new Date(sortedDates[i + 1]);
                    const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / 86400000);
                    
                    if (diffDays === 1) {
                      newStreak++;
                    } else {
                      break;
                    }
                  }
                }
              }

              return {
                ...habit,
                completedDates: newCompletedDates,
                lastCompletedDate: newCompletedDates.length > 0 
                  ? newCompletedDates[newCompletedDates.length - 1] 
                  : '',
                streak: newStreak,
              };
            }
            return habit;
          }),
        })),

      getHabitStats: (id: string) => {
        const state = get();
        const habit = state.habits.find((h) => h.id === id);
        if (!habit) return { streak: 0, completed: 0, percentage: 0 };

        const completed = habit.completedDates.length;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentCompleted = habit.completedDates.filter(
          (d) => new Date(d) >= thirtyDaysAgo
        ).length;
        const percentage = Math.round((recentCompleted / 30) * 100);

        return {
          streak: habit.streak,
          completed,
          percentage,
        };
      },

      // View Actions
      setSelectedDate: (date: string) =>
        set(() => ({
          selectedDate: date,
        })),

      setView: (view: AppState['view']) =>
        set(() => ({
          view,
        })),

      // Stats Actions
      calculateStats: () => {
        const state = get();
        const today = state.selectedDate;
        const todayTasks = state.getTasksForDate(today); // ✅ Use new method
        const todayHabits = state.habits;

        const tasksCompleted = todayTasks.filter((t) => t.completed).length;
        const habitsCompleted = todayHabits.filter((h) =>
          h.completedDates.includes(today)
        ).length;

        set((state) => ({
          stats: [
            ...state.stats,
            {
              date: today,
              tasksCompleted,
              tasksTotal: todayTasks.length,
              habitsCompleted,
              habitsTotal: todayHabits.length,
              completionRate:
                (tasksCompleted + habitsCompleted) / (todayTasks.length + todayHabits.length) || 0,
            },
          ],
        }));
      },
    }),
    {
      name: 'habit-tracker-store',
    }
  )
);
