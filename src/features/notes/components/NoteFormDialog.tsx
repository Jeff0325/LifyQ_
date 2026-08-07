import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ResponsiveFormSheet } from '@/components/shared/ResponsiveFormSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGoals } from '@/features/goals/hooks/useGoals';
import { useCreateNote, useUpdateNote } from '@/features/notes/hooks/useNotes';
import {
  NOTE_FOLDERS,
  type Note,
  type NoteFormValues,
  noteFormSchema,
} from '@/features/notes/types';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useToast } from '@/hooks/useToast';

const FOLDER_LABELS: Record<(typeof NOTE_FOLDERS)[number], string> = {
  general: 'General',
  work: 'Work',
  personal: 'Personal',
  ideas: 'Ideas',
  reference: 'Reference',
};

const DEFAULT_VALUES: NoteFormValues = {
  title: '',
  content: '',
  folder: 'general',
  tags: '',
  linkedTaskId: undefined,
  linkedGoalId: undefined,
};

export interface NoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → editing; absent → creating. */
  note?: Note;
}

/** Create/edit form for a Note — shared shell (`ResponsiveFormSheet`), RHF + Zod validation. */
export function NoteFormDialog({
  open,
  onOpenChange,
  note,
}: NoteFormDialogProps) {
  const isEditing = !!note;
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const { toast } = useToast();
  const { data: tasks } = useTasks();
  const { data: goals } = useGoals();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        note
          ? {
              title: note.title,
              content: note.content,
              folder: note.folder,
              tags: note.tags,
              linkedTaskId: note.linkedTaskId,
              linkedGoalId: note.linkedGoalId,
            }
          : DEFAULT_VALUES,
      );
    }
  }, [open, note, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateNote.mutateAsync({ id: note.id, input: values });
        toast({ variant: 'success', title: 'Note updated' });
      } else {
        await createNote.mutateAsync(values);
        toast({ variant: 'success', title: 'Note created' });
      }
      onOpenChange(false);
    } catch {
      toast({
        variant: 'danger',
        title: isEditing ? "Couldn't update note" : "Couldn't create note",
        description: 'Please try again.',
      });
    }
  });

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit note' : 'New note'}
      description={isEditing ? undefined : 'Capture it now, organize it later.'}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="note-form" disabled={isSubmitting}>
            {isEditing ? 'Save changes' : 'Create note'}
          </Button>
        </>
      }
    >
      <form id="note-form" onSubmit={onSubmit} className="gap-4 flex flex-col">
        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="note-title">Title</Label>
          <Input
            id="note-title"
            placeholder="Meeting notes, an idea, a reminder…"
            aria-invalid={!!errors.title}
            {...register('title')}
          />
          {errors.title && (
            <p className="text-caption text-danger">{errors.title.message}</p>
          )}
        </div>

        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="note-content">Content</Label>
          <Textarea
            id="note-content"
            placeholder="Write it down…"
            rows={6}
            {...register('content')}
          />
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="note-folder">Folder</Label>
            <Controller
              control={control}
              name="folder"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="note-folder">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_FOLDERS.map((folder) => (
                      <SelectItem key={folder} value={folder}>
                        {FOLDER_LABELS[folder]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="note-tags">Tags</Label>
            <Input
              id="note-tags"
              placeholder="work, ideas"
              {...register('tags')}
            />
          </div>
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="note-task">Related task</Label>
            <Controller
              control={control}
              name="linkedTaskId"
              render={({ field }) => (
                <Select
                  value={field.value ?? 'none'}
                  onValueChange={(value) =>
                    field.onChange(value === 'none' ? undefined : value)
                  }
                >
                  <SelectTrigger id="note-task">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {tasks?.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="note-goal">Related goal</Label>
            <Controller
              control={control}
              name="linkedGoalId"
              render={({ field }) => (
                <Select
                  value={field.value ?? 'none'}
                  onValueChange={(value) =>
                    field.onChange(value === 'none' ? undefined : value)
                  }
                >
                  <SelectTrigger id="note-goal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {goals?.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </form>
    </ResponsiveFormSheet>
  );
}
