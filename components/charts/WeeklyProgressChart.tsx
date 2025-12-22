// app/components/charts/WeeklyProgressChart.tsx

'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export function WeeklyProgressChart() {
  const { tasks, habits } = useStore();
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Get last 7 days
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Calculate tasks for this day
      const dayTasks = tasks.filter(t => t.date === dateStr);
      const completedTasks = dayTasks.filter(t => t.completed).length;
      
      // Calculate habits for this day
      const completedHabits = habits.filter(h => 
        h.completedDates.includes(dateStr)
      ).length;
      
      // Calculate total completion percentage
      const totalItems = dayTasks.length + habits.length;
      const completedItems = completedTasks + completedHabits;
      const completionRate = totalItems > 0 
        ? Math.round((completedItems / totalItems) * 100) 
        : 0;
      
      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: dateStr,
        tasks: completedTasks,
        habits: completedHabits,
        completion: completionRate
      });
    }
    
    setChartData(data);
  }, [tasks, habits]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1A2C5B" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#1A2C5B" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorHabits" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7971EA" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#7971EA" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8F4F8" />
        <XAxis 
          dataKey="date" 
          stroke="#1A2C5B"
          style={{ fontSize: '12px', fontWeight: 'bold' }}
        />
        <YAxis 
          stroke="#1A2C5B"
          style={{ fontSize: '12px', fontWeight: 'bold' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '2px solid #B8DFF0',
            borderRadius: '12px',
            padding: '12px'
          }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '14px', fontWeight: 'bold' }}
        />
        <Area
          type="monotone"
          dataKey="tasks"
          stroke="#1A2C5B"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorTasks)"
          name="Tasks"
        />
        <Area
          type="monotone"
          dataKey="habits"
          stroke="#7971EA"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorHabits)"
          name="Habits"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
