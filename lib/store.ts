// lib/store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Habit } from './types';

interface StoreState {
  // View state - ADD 'week', 'month', 'reports'
  view: 'overview' | 'tasks' | 'habits' | 'schedule' | 'settings' | 'week' | 'month' | 'reports';
  setView: (view: StoreState['view']) => void;

  // Date state
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  getTasksForDate: (date: string) => Task[];
  getTodayTasks: () => Task[];

  // Habits
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completedDates' | 'createdAt'>) => void;
  updateHabit: (id: string, habit: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (habitId: string, date: string) => void;
  
  // Streak calculations
  calculateCurrentStreak: (habitId: string) => number;
  getLongestStreak: (habitId: string) => number;
  updateAllStreaks: () => void;
}

// Helper function to check if task should appear on date
const shouldShowTaskOnDate = (task: Task, targetDate: string): boolean => {
  const taskDate = new Date(task.date);
  const checkDate = new Date(targetDate);
  
  if (taskDate > checkDate) return false;

  const targetDay = checkDate.getDay();

  switch (task.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return targetDay >= 1 && targetDay <= 5;
    case 'weekends':
      return targetDay === 0 || targetDay === 6;
    case 'weekly':
      return taskDate.getDay() === targetDay;
    case 'custom':
      return task.selectedDays?.includes(targetDay) || false;
    case 'monthly':
      return taskDate.getDate() === checkDate.getDate();
    case 'once':
    default:
      return task.date === targetDate;
  }
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      view: 'overview',
      selectedDate: new Date().toISOString().split('T')[0],
      tasks: [],
      habits: [],

      // View actions
      setView: (view) => set({ view }),

      // Date actions
      setSelectedDate: (date) => set({ selectedDate: date }),

      // Task actions
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateTask: (id, updatedTask) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updatedTask } : task
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      toggleTaskCompletion: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          ),
        })),

      getTasksForDate: (date) => {
        const state = get();
        return state.tasks.filter((task) => shouldShowTaskOnDate(task, date));
      },

      getTodayTasks: () => {
        const state = get();
        const today = state.selectedDate;
        return state.tasks.filter((task) => shouldShowTaskOnDate(task, today));
      },

      // Habit actions
      addHabit: (habit) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              ...habit,
              id: crypto.randomUUID(),
              streak: 0,
              completedDates: [],
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateHabit: (id, updatedHabit) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, ...updatedHabit } : habit
          ),
        })),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        })),

      toggleHabit: (habitId, date) => {
        set((state) => {
          const updatedHabits = state.habits.map((habit) => {
            if (habit.id === habitId) {
              const isCompleted = habit.completedDates.includes(date);
              const newCompletedDates = isCompleted
                ? habit.completedDates.filter((d) => d !== date)
                : [...habit.completedDates, date].sort();

              return {
                ...habit,
                completedDates: newCompletedDates,
              };
            }
            return habit;
          });

          return { habits: updatedHabits };
        });

        setTimeout(() => {
          set((state) => ({
            habits: state.habits.map((habit) =>
              habit.id === habitId
                ? { ...habit, streak: get().calculateCurrentStreak(habitId) }
                : habit
            ),
          }));
        }, 0);
      },

      // Streak calculations
      calculateCurrentStreak: (habitId) => {
        const state = get();
        const habit = state.habits.find((h) => h.id === habitId);
        if (!habit || habit.completedDates.length === 0) return 0;

        const sortedDates = [...habit.completedDates].sort();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let streak = 0;
        let checkDate = new Date(today);

        const todayStr = checkDate.toISOString().split('T')[0];
        if (sortedDates.includes(todayStr)) {
          streak = 1;
        } else {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = checkDate.toISOString().split('T')[0];
          if (!sortedDates.includes(yesterdayStr)) {
            return 0;
          }
          streak = 1;
        }

        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          const dateStr = checkDate.toISOString().split('T')[0];
          
          if (sortedDates.includes(dateStr)) {
            streak++;
          } else {
            break;
          }
        }

        return streak;
      },

      getLongestStreak: (habitId) => {
        const state = get();
        const habit = state.habits.find((h) => h.id === habitId);
        if (!habit || habit.completedDates.length === 0) return 0;

        const sortedDates = [...habit.completedDates].sort();
        let longestStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(sortedDates[i - 1]);
          const currDate = new Date(sortedDates[i]);
          
          const diffTime = currDate.getTime() - prevDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
          } else {
            currentStreak = 1;
          }
        }

        return longestStreak;
      },

      updateAllStreaks: () => {
        set((state) => {
          const updatedHabits = state.habits.map((habit) => ({
            ...habit,
            streak: get().calculateCurrentStreak(habit.id),
          }));
          return { habits: updatedHabits };
        });
      },
    }),
    {
      name: 'habit-flow-storage',
      version: 1,
    }
  )
);
