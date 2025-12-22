// app/components/settings/DataManager.tsx

'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Upload, Trash2, AlertCircle } from 'lucide-react';
import { useState, useRef } from 'react';

export function DataManager() {
  const { tasks, habits } = useStore();
  const [importStatus, setImportStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
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

    setImportStatus('✅ Data exported successfully!');
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
          // Import tasks
          data.tasks.forEach((task: any) => {
            useStore.getState().addTask(task);
          });

          // Import habits
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
      // Clear tasks
      tasks.forEach(task => {
        useStore.getState().deleteTask(task.id);
      });

      // Clear habits
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
    <Card className="glass p-6 rounded-3xl shadow-xl border border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-habit-mauve to-habit-rose p-3 rounded-xl">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-habit-mauve">Data Management</h2>
          <p className="text-sm text-gray-600">Backup, restore, or clear your data</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Export Button */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-habit-light rounded-xl border-2 border-habit-cream">
          <div>
            <h3 className="font-semibold text-habit-mauve">Export Data</h3>
            <p className="text-sm text-gray-600">Download all your tasks and habits</p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-gradient-to-r from-habit-mauve to-habit-rose text-white hover:shadow-xl btn-press"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Import Button */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-habit-light rounded-xl border-2 border-habit-cream">
          <div>
            <h3 className="font-semibold text-habit-mauve">Import Data</h3>
            <p className="text-sm text-gray-600">Restore from a backup file</p>
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
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:shadow-xl btn-press"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        {/* Clear Data Button */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
          <div>
            <h3 className="font-semibold text-red-600">Clear All Data</h3>
            <p className="text-sm text-gray-600">⚠️ This action cannot be undone</p>
          </div>
          <Button
            onClick={handleClearData}
            variant="destructive"
            className="bg-gradient-to-r from-red-500 to-red-700 hover:shadow-xl btn-press"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>

        {/* Status Message */}
        {importStatus && (
          <div className="flex items-center gap-2 p-4 bg-habit-cream rounded-xl animate-in fade-in duration-300">
            <AlertCircle className="w-5 h-5 text-habit-mauve" />
            <p className="text-sm font-medium text-habit-mauve">{importStatus}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-habit-cream">
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
            <p className="text-xs text-gray-600">Total Tasks</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-xl">
            <p className="text-2xl font-bold text-purple-600">{habits.length}</p>
            <p className="text-xs text-gray-600">Total Habits</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
