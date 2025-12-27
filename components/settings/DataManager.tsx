// app/components/settings/DataManager.tsx

'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Upload, Trash2, AlertCircle, FileText } from 'lucide-react';
import { useState, useRef } from 'react';

export function DataManager() {
  const { tasks, habits } = useStore();
  const [importStatus, setImportStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to format date for CSV (shorter format)
  const formatDateForCSV = (dateString: string | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // Format as YYYY-MM-DD HH:MM
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  // Helper function to escape CSV values
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Convert array of objects to CSV string
  const arrayToCSV = (data: any[], headers: string[]): string => {
    const headerRow = headers.map(escapeCSV).join(',');
    const dataRows = data.map(row => 
      headers.map(header => escapeCSV(row[header])).join(',')
    );
    return [headerRow, ...dataRows].join('\n');
  };

  const handleExportCSV = () => {
    try {
      // Prepare Tasks CSV
      const tasksHeaders = ['Title', 'Description', 'Date', 'Priority', 'Frequency', 'Completed', 'Created At'];
      const tasksData = tasks.map(task => ({
        'Title': task.title,
        'Description': task.description || '',
        'Date': task.date,
        'Priority': task.priority,
        'Frequency': task.frequency,
        'Completed': task.completed ? 'Yes' : 'No',
        'Created At': formatDateForCSV(task.createdAt)
      }));
      const tasksCSV = arrayToCSV(tasksData, tasksHeaders);

      // Prepare Habits CSV
      const habitsHeaders = ['Name', 'Description', 'Color', 'Frequency', 'Current Streak', 'Total Completions', 'Created At'];
      const habitsData = habits.map(habit => ({
        'Name': habit.name,
        'Description': habit.description || '',
        'Color': habit.color,
        'Frequency': habit.frequency,
        'Current Streak': habit.streak,
        'Total Completions': habit.completedDates.length,
        'Created At': formatDateForCSV(habit.createdAt)
      }));
      const habitsCSV = arrayToCSV(habitsData, habitsHeaders);

      // Prepare Habit History CSV
      const historyHeaders = ['Habit Name', 'Completion Date', 'Streak'];
      const historyData = habits.flatMap(habit =>
        habit.completedDates.map(date => ({
          'Habit Name': habit.name,
          'Completion Date': date,
          'Streak': habit.streak
        }))
      );
      const historyCSV = arrayToCSV(historyData, historyHeaders);

      // Prepare Summary CSV
      const summaryHeaders = ['Metric', 'Value'];
      const summaryData = [
        { 'Metric': 'Total Tasks', 'Value': tasks.length },
        { 'Metric': 'Completed Tasks', 'Value': tasks.filter(t => t.completed).length },
        { 'Metric': 'Pending Tasks', 'Value': tasks.filter(t => !t.completed).length },
        { 'Metric': 'Total Habits', 'Value': habits.length },
        { 'Metric': 'Active Habits', 'Value': habits.filter(h => h.completedDates.length > 0).length },
        { 'Metric': 'Export Date', 'Value': formatDateForCSV(new Date().toISOString()) }
      ];
      const summaryCSV = arrayToCSV(summaryData, summaryHeaders);

      // Combine all CSVs into one file with section separators
      const combinedCSV = [
        '=== SUMMARY ===',
        summaryCSV,
        '',
        '',
        '=== TASKS ===',
        tasksCSV,
        '',
        '',
        '=== HABITS ===',
        habitsCSV,
        '',
        '',
        '=== HABIT COMPLETION HISTORY ===',
        historyCSV
      ].join('\n');

      // Create and download the file
      const blob = new Blob([combinedCSV], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `habit-tracker-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setImportStatus('✅ Data exported to CSV successfully!');
      setTimeout(() => setImportStatus(''), 3000);
    } catch (error) {
      console.error('Export error:', error);
      setImportStatus('❌ Error exporting data');
      setTimeout(() => setImportStatus(''), 3000);
    }
  };

  const handleExportSeparateCSV = () => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];

      // Export Tasks CSV
      const tasksHeaders = ['Title', 'Description', 'Date', 'Priority', 'Frequency', 'Completed', 'Created At'];
      const tasksData = tasks.map(task => ({
        'Title': task.title,
        'Description': task.description || '',
        'Date': task.date,
        'Priority': task.priority,
        'Frequency': task.frequency,
        'Completed': task.completed ? 'Yes' : 'No',
        'Created At': formatDateForCSV(task.createdAt)
      }));
      const tasksCSV = arrayToCSV(tasksData, tasksHeaders);
      downloadCSV(tasksCSV, `habit-tracker-tasks-${timestamp}.csv`);

      // Export Habits CSV
      const habitsHeaders = ['Name', 'Description', 'Color', 'Frequency', 'Current Streak', 'Total Completions', 'Created At'];
      const habitsData = habits.map(habit => ({
        'Name': habit.name,
        'Description': habit.description || '',
        'Color': habit.color,
        'Frequency': habit.frequency,
        'Current Streak': habit.streak,
        'Total Completions': habit.completedDates.length,
        'Created At': formatDateForCSV(habit.createdAt)
      }));
      const habitsCSV = arrayToCSV(habitsData, habitsHeaders);
      
      // Small delay between downloads
      setTimeout(() => {
        downloadCSV(habitsCSV, `habit-tracker-habits-${timestamp}.csv`);
      }, 300);

      setImportStatus('✅ Multiple CSV files downloaded!');
      setTimeout(() => setImportStatus(''), 3000);
    } catch (error) {
      console.error('Export error:', error);
      setImportStatus('❌ Error exporting data');
      setTimeout(() => setImportStatus(''), 3000);
    }
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = {
      tasks,
      habits,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setImportStatus('✅ Data exported to JSON successfully!');
    setTimeout(() => setImportStatus(''), 3000);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (data.tasks && data.habits) {
          data.tasks.forEach((task: any) => {
            useStore.getState().addTask(task);
          });

          data.habits.forEach((habit: any) => {
            useStore.getState().addHabit(habit);
          });

          setImportStatus('✅ Data imported successfully!');
        } else {
          setImportStatus('❌ Invalid file format');
        }
      } catch (error) {
        setImportStatus('❌ Error importing data');
      }
      setTimeout(() => setImportStatus(''), 3000);
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone!')) {
      tasks.forEach(task => {
        useStore.getState().deleteTask(task.id);
      });

      habits.forEach(habit => {
        useStore.getState().deleteHabit(habit.id);
      });

      setImportStatus('✅ All data cleared');
      setTimeout(() => setImportStatus(''), 3000);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="p-6 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-[#234C6A] to-[#456882] p-3 rounded-xl">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#1B3C53]">Data Management</h2>
          <p className="text-sm text-gray-600">Backup, restore, or clear your data</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Export to CSV Button (Combined) */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-[#234C6A]/20 hover:border-[#234C6A]/40 transition-all">
          <div>
            <h3 className="font-semibold text-[#234C6A] flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Export to CSV (All Data)
            </h3>
            <p className="text-sm text-gray-600">Download single CSV with all data sections</p>
          </div>
          <Button
            onClick={handleExportCSV}
            className="bg-gradient-to-r from-[#234C6A] to-[#456882] text-white hover:shadow-xl transition-all"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Export to Separate CSV Files */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-[#456882]/20 hover:border-[#456882]/40 transition-all">
          <div>
            <h3 className="font-semibold text-[#456882] flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Export to Multiple CSVs
            </h3>
            <p className="text-sm text-gray-600">Download separate CSV files for tasks and habits</p>
          </div>
          <Button
            onClick={handleExportSeparateCSV}
            className="bg-gradient-to-r from-[#456882] to-[#234C6A] text-white hover:shadow-xl transition-all"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export Multiple
          </Button>
        </div>

        {/* Export to JSON Button */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-[#234C6A]/20 hover:border-[#234C6A]/40 transition-all">
          <div>
            <h3 className="font-semibold text-[#234C6A]">Export to JSON (Backup)</h3>
            <p className="text-sm text-gray-600">Download backup file for restore</p>
          </div>
          <Button
            onClick={handleExportJSON}
            className="bg-gradient-to-r from-[#234C6A] to-[#456882] text-white hover:shadow-xl transition-all"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>

        {/* Import Button */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-[#234C6A]/20 hover:border-[#234C6A]/40 transition-all">
          <div>
            <h3 className="font-semibold text-[#234C6A]">Import Data</h3>
            <p className="text-sm text-gray-600">Restore from a JSON backup file</p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              onClick={handleImportClick}
              className="bg-gradient-to-r from-[#456882] to-[#234C6A] text-white hover:shadow-xl transition-all"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        {/* Clear Data Button */}
        <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border-2 border-red-200 hover:border-red-300 transition-all">
          <div>
            <h3 className="font-semibold text-red-600">Clear All Data</h3>
            <p className="text-sm text-gray-600">⚠️ This action cannot be undone</p>
          </div>
          <Button
            onClick={handleClearData}
            variant="destructive"
            className="bg-gradient-to-r from-red-500 to-red-700 hover:shadow-xl transition-all"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>

        {/* Status Message */}
        {importStatus && (
          <div className="flex items-center gap-2 p-4 bg-[#234C6A]/10 rounded-xl animate-in fade-in duration-300 border-2 border-[#234C6A]/30">
            <AlertCircle className="w-5 h-5 text-[#234C6A]" />
            <p className="text-sm font-medium text-[#1B3C53]">{importStatus}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-gray-200">
          <div className="text-center p-4 bg-gradient-to-br from-[#234C6A]/10 to-[#234C6A]/5 rounded-xl border border-[#234C6A]/20">
            <p className="text-3xl font-bold text-[#234C6A]">{tasks.length}</p>
            <p className="text-xs text-gray-600 mt-1">Total Tasks</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-[#456882]/10 to-[#456882]/5 rounded-xl border border-[#456882]/20">
            <p className="text-3xl font-bold text-[#456882]">{habits.length}</p>
            <p className="text-xs text-gray-600 mt-1">Total Habits</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
