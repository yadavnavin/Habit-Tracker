// app/components/gamification/AchievementBadges.tsx

'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap, Target, Star, Award, Flame } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

export function AchievementBadges() {
  const { tasks, habits } = useStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const totalCompletedTasks = tasks.filter(t => t.completed).length;
    const totalCompletedHabits = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
    const maxStreak = Math.max(...habits.map(h => h.streak), 0);
    const totalHabits = habits.length;

    const achievementList: Achievement[] = [
      {
        id: 'first_task',
        title: 'Getting Started',
        description: 'Complete your first task',
        icon: Target,
        color: 'bg-blue-500',
        unlocked: totalCompletedTasks >= 1,
        progress: Math.min(totalCompletedTasks, 1),
        target: 1
      },
      {
        id: 'task_master',
        title: 'Task Master',
        description: 'Complete 10 tasks',
        icon: Trophy,
        color: 'bg-yellow-500',
        unlocked: totalCompletedTasks >= 10,
        progress: Math.min(totalCompletedTasks, 10),
        target: 10
      },
      {
        id: 'habit_builder',
        title: 'Habit Builder',
        description: 'Create 5 habits',
        icon: Zap,
        color: 'bg-purple-500',
        unlocked: totalHabits >= 5,
        progress: Math.min(totalHabits, 5),
        target: 5
      },
      {
        id: 'week_streak',
        title: '7 Day Streak',
        description: 'Maintain a 7-day streak',
        icon: Flame,
        color: 'bg-orange-500',
        unlocked: maxStreak >= 7,
        progress: Math.min(maxStreak, 7),
        target: 7
      },
      {
        id: 'dedication',
        title: 'Dedication',
        description: 'Complete 50 habit checkmarks',
        icon: Star,
        color: 'bg-pink-500',
        unlocked: totalCompletedHabits >= 50,
        progress: Math.min(totalCompletedHabits, 50),
        target: 50
      },
      {
        id: 'perfectionist',
        title: 'Perfectionist',
        description: 'Complete all tasks in a day',
        icon: Award,
        color: 'bg-green-500',
        unlocked: tasks.length > 0 && tasks.every(t => t.completed),
        progress: tasks.filter(t => t.completed).length,
        target: tasks.length || 1
      }
    ];

    setAchievements(achievementList);
  }, [tasks, habits]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {achievements.map((achievement) => {
        const Icon = achievement.icon;
        return (
          <Card
            key={achievement.id}
            className={`p-4 text-center transition-all duration-300 ${
              achievement.unlocked
                ? 'card-hover gradient-border cursor-pointer scale-105'
                : 'opacity-50 grayscale'
            }`}
          >
            <div className={`${achievement.color} ${
              achievement.unlocked ? 'animate-pulse' : ''
            } p-4 rounded-2xl mx-auto w-16 h-16 flex items-center justify-center mb-3`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-bold text-sm text-habit-mauve mb-1">
              {achievement.title}
            </h4>
            <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
            {achievement.unlocked ? (
              <Badge className="bg-green-500 text-white">✓ Unlocked</Badge>
            ) : (
              <div className="text-xs text-gray-500">
                {achievement.progress}/{achievement.target}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
