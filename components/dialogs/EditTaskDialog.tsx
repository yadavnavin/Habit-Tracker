// app/components/dialogs/EditTaskDialog.tsx

'use client';

import { AddTaskDialog } from './AddTaskDialog';
import { Task } from '@/lib/types';

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export function EditTaskDialog({ open, onOpenChange, task }: EditTaskDialogProps) {
  return <AddTaskDialog open={open} onOpenChange={onOpenChange} editingTask={task} />;
}
