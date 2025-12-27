// app/components/dialogs/SearchDialog.tsx

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { Search, Calendar, Target, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const { tasks, habits, setSelectedDate, setView } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (query.trim()) {
      const taskResults = tasks.filter(task => 
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.description?.toLowerCase().includes(query.toLowerCase())
      ).map(task => ({ ...task, type: 'task' }));

      const habitResults = habits.filter(habit =>
        habit.name.toLowerCase().includes(query.toLowerCase()) ||
        habit.description?.toLowerCase().includes(query.toLowerCase())
      ).map(habit => ({ ...habit, type: 'habit' }));

      setResults([...taskResults, ...habitResults].slice(0, 10));
    } else {
      setResults([]);
    }
  }, [query, tasks, habits]);

  const handleSelect = (result: any) => {
    if (result.type === 'task') {
      setSelectedDate(result.date);
      setView('overview');
    } else {
      setView('habits');
    }
    onOpenChange(false);
    setQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#1B3C53]">Search Tasks & Habits</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search..."
            className="pl-10"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      result.type === 'task' ? 'bg-blue-100' : 'bg-[#234C6A]'
                    }`}>
                      {result.type === 'task' ? (
                        <Calendar className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Target className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1B3C53] truncate">
                        {result.title || result.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {result.description || 'No description'}
                      </p>
                      {result.type === 'task' && (
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">
                            <Clock className="w-3 h-3 mr-1" />
                            {result.time}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {result.date}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">Start typing to search</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
