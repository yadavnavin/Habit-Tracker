// app/components/reports/ReportsView.tsx

'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  Flame,
  Award,
  Clock,
  CheckCircle2,
  Zap,
  Download,
  Filter,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Pie, PieChart, Cell } from 'recharts';

export function ReportsView() {
  const { tasks, habits, selectedDate, calculateCurrentStreak, getLongestStreak } = useStore();
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
        <div className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate statistics
  const getStats = () => {
    const now = new Date();
    const ranges = {
      week: 7,
      month: 30,
      year: 365
    };
    const days = ranges[timeRange];

    const dateArray = Array.from({ length: days }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - 1 - i));
      return date.toISOString().split('T')[0];
    });

    // Task stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Habit stats
    const totalHabits = habits.length;
    const activeHabits = habits.filter(h => {
      const streak = calculateCurrentStreak ? calculateCurrentStreak(h.id) : h.streak;
      return streak > 0;
    }).length;
    const habitCompletionRate = totalHabits > 0 ? Math.round((activeHabits / totalHabits) * 100) : 0;

    // Streak stats
    const totalStreak = habits.reduce((acc, h) => {
      const streak = calculateCurrentStreak ? calculateCurrentStreak(h.id) : h.streak;
      return acc + streak;
    }, 0);
    const longestStreak = Math.max(
      ...habits.map(h => getLongestStreak ? getLongestStreak(h.id) : h.streak),
      0
    );

    // Daily completion data
    const dailyData = dateArray.map(date => {
      const dayTasks = tasks.filter(t => t.date === date);
      const completedDayTasks = dayTasks.filter(t => t.completed).length;
      const dayHabits = habits.filter(h => h.completedDates.includes(date)).length;

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tasks: completedDayTasks,
        habits: dayHabits,
        total: completedDayTasks + dayHabits,
      };
    });

    // Category breakdown
    const categoryStats = tasks.reduce((acc, task) => {
      const category = task.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { total: 0, completed: 0 };
      }
      acc[category].total++;
      if (task.completed) acc[category].completed++;
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    const categoryData = Object.entries(categoryStats).map(([name, stats]) => ({
      name,
      value: stats.completed,
      total: stats.total,
      percentage: Math.round((stats.completed / stats.total) * 100),
    }));

    // Priority breakdown
    const priorityStats = tasks.reduce((acc, task) => {
      const priority = task.priority || 'none';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityData = Object.entries(priorityStats).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    // Frequency breakdown
    const frequencyStats = tasks.reduce((acc, task) => {
      const freq = task.frequency || 'once';
      acc[freq] = (acc[freq] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const frequencyData = Object.entries(frequencyStats).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    // Calculate trends
    const previousPeriod = dateArray.slice(0, Math.floor(days / 2));
    const currentPeriod = dateArray.slice(Math.floor(days / 2));

    const prevCompleted = previousPeriod.reduce((acc, date) => {
      const dayTasks = tasks.filter(t => t.date === date && t.completed);
      const dayHabits = habits.filter(h => h.completedDates.includes(date));
      return acc + dayTasks.length + dayHabits.length;
    }, 0);

    const currCompleted = currentPeriod.reduce((acc, date) => {
      const dayTasks = tasks.filter(t => t.date === date && t.completed);
      const dayHabits = habits.filter(h => h.completedDates.includes(date));
      return acc + dayTasks.length + dayHabits.length;
    }, 0);

    const trend = currCompleted - prevCompleted;
    const trendPercentage = prevCompleted > 0 ? Math.round((trend / prevCompleted) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      taskCompletionRate,
      totalHabits,
      activeHabits,
      habitCompletionRate,
      totalStreak,
      longestStreak,
      dailyData,
      categoryData,
      priorityData,
      frequencyData,
      trend,
      trendPercentage,
    };
  };

  const stats = getStats();

  const chartConfig = {
    tasks: { label: 'Tasks', color: '#456882' },
    habits: { label: 'Habits', color: '#234C6A' },
  } satisfies ChartConfig;

  const COLORS = ['#234C6A', '#456882', '#6B8CAF', '#8FA9C4', '#B3C5D9'];

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1B3C53]">Reports & Analytics</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track your progress and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[#234C6A] text-[#234C6A] hover:bg-[#234C6A] hover:text-white"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#234C6A] text-[#234C6A] hover:bg-[#234C6A] hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)} className="w-full">
        <TabsList className="grid w-full sm:w-auto grid-cols-3 sm:inline-flex">
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Task Completion */}
        <Card className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              {stats.trendPercentage !== 0 && (
                <Badge variant="outline" className={`text-xs ${
                  stats.trendPercentage > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats.trendPercentage > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(stats.trendPercentage)}%
                </Badge>
              )}
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#1B3C53]">{stats.taskCompletionRate}%</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Task Completion</p>
            <Progress value={stats.taskCompletionRate} className="h-1.5 mt-3" />
          </CardContent>
        </Card>

        {/* Habit Success */}
        <Card className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#234C6A] flex items-center justify-center">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <Badge variant="outline" className="text-xs">
                {stats.activeHabits}/{stats.totalHabits}
              </Badge>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#1B3C53]">{stats.habitCompletionRate}%</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Active Habits</p>
            <Progress value={stats.habitCompletionRate} className="h-1.5 mt-3" />
          </CardContent>
        </Card>

        {/* Total Streak */}
        <Card className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <Badge variant="outline" className="text-xs">
                Best: {stats.longestStreak}
              </Badge>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#1B3C53]">{stats.totalStreak}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Total Streak</p>
            <div className="mt-3 flex items-center text-xs text-orange-600">
              <Flame className="w-3 h-3 mr-1" />
              {stats.activeHabits} active
            </div>
          </CardContent>
        </Card>

        {/* Productivity Score */}
        <Card className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <Badge variant="outline" className="text-xs">
                Score
              </Badge>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#1B3C53]">
              {Math.round((stats.taskCompletionRate + stats.habitCompletionRate) / 2)}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Productivity</p>
            <div className="mt-3 flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              Excellent!
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Activity Over Time */}
        <Card className="border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#234C6A] flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-lg text-[#1B3C53]">Activity Trend</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Completions over {timeRange}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
              <AreaChart data={stats.dailyData}>
                <defs>
                  <linearGradient id="tasksGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#456882" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#456882" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="habitsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#234C6A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#234C6A" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="tasks" 
                  stroke="#456882" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#tasksGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="habits" 
                  stroke="#234C6A" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#habitsGradient)" 
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#234C6A] flex items-center justify-center flex-shrink-0">
                <Target className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-lg text-[#1B3C53]">Category Performance</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Completion by category
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            {stats.categoryData.length > 0 ? (
              <div className="space-y-3">
                {stats.categoryData.map((category, index) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium text-[#1B3C53] truncate">{category.name}</span>
                      </div>
                      <span className="text-gray-600 text-xs">
                        {category.value}/{category.total} ({category.percentage}%)
                      </span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Priority Distribution */}
        <Card className="border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100 p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-lg text-[#1B3C53]">Priority Distribution</CardTitle>
            <CardDescription className="text-xs mt-0.5">Tasks by priority level</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3">
              {stats.priorityData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-[#1B3C53]">{item.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{item.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Frequency Distribution */}
        <Card className="border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100 p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-lg text-[#1B3C53]">Frequency Distribution</CardTitle>
            <CardDescription className="text-xs mt-0.5">Tasks by frequency type</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3">
              {stats.frequencyData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-[#1B3C53]">{item.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{item.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
