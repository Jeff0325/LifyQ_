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
import { useGoals } from '@/features/goals';
import {
  useCreateProject,
  useUpdateProject,
} from '@/features/projects/hooks/useProjects';
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUSES,
  type Project,
  type ProjectFormValues,
  projectFormSchema,
} from '@/features/projects/types';
import { useToast } from '@/hooks/useToast';

const DEFAULT_VALUES: ProjectFormValues = {
  title: '',
  description: '',
  goalId: undefined,
  status: 'active',
};

export interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
}: ProjectFormDialogProps) {
  const isEditing = !!project;
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const { data: goals } = useGoals();
  const { toast } = useToast();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        project
          ? {
              title: project.title,
              description: project.description ?? '',
              goalId: project.goalId,
              status: project.status,
            }
          : DEFAULT_VALUES,
      );
    }
  }, [open, project, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateProject.mutateAsync({ id: project.id, input: values });
        toast({ variant: 'success', title: 'Project updated' });
      } else {
        await createProject.mutateAsync(values);
        toast({ variant: 'success', title: 'Project created' });
      }
      onOpenChange(false);
    } catch {
      toast({
        variant: 'danger',
        title: isEditing
          ? "Couldn't update project"
          : "Couldn't create project",
        description: 'Please try again.',
      });
    }
  });

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit project' : 'New project'}
      description={
        isEditing
          ? undefined
          : 'Link tasks to it from the project page once created.'
      }
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
          <Button type="submit" form="project-form" disabled={isSubmitting}>
            {isEditing ? 'Save changes' : 'Create project'}
          </Button>
        </>
      }
    >
      <form
        id="project-form"
        onSubmit={onSubmit}
        className="gap-4 flex flex-col"
      >
        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="project-title">Title</Label>
          <Input
            id="project-title"
            aria-invalid={!!errors.title}
            {...register('title')}
          />
          {errors.title && (
            <p className="text-caption text-danger">{errors.title.message}</p>
          )}
        </div>

        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="project-description">Description</Label>
          <Textarea
            id="project-description"
            rows={3}
            {...register('description')}
          />
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="project-status">Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="project-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {PROJECT_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="project-goal">Ladders up to</Label>
            <Controller
              control={control}
              name="goalId"
              render={({ field }) => (
                <Select
                  value={field.value ?? 'none'}
                  onValueChange={(value) =>
                    field.onChange(value === 'none' ? undefined : value)
                  }
                >
                  <SelectTrigger id="project-goal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No goal</SelectItem>
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
