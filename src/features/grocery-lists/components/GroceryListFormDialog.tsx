import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { ResponsiveFormSheet } from '@/components/shared/ResponsiveFormSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useCreateGroceryList,
  useUpdateGroceryList,
} from '@/features/grocery-lists/hooks/useGroceryLists';
import {
  type GroceryList,
  type GroceryListFormValues,
  groceryListFormSchema,
} from '@/features/grocery-lists/types';
import { useToast } from '@/hooks/useToast';

const DEFAULT_VALUES: GroceryListFormValues = { title: '' };

export interface GroceryListFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → editing (rename); absent → creating. */
  list?: GroceryList;
}

export function GroceryListFormDialog({
  open,
  onOpenChange,
  list,
}: GroceryListFormDialogProps) {
  const isEditing = !!list;
  const createList = useCreateGroceryList();
  const updateList = useUpdateGroceryList();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GroceryListFormValues>({
    resolver: zodResolver(groceryListFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(list ? { title: list.title } : DEFAULT_VALUES);
  }, [open, list, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateList.mutateAsync({ id: list.id, input: values });
        toast({ variant: 'success', title: 'List renamed' });
      } else {
        await createList.mutateAsync(values);
        toast({ variant: 'success', title: 'List created' });
      }
      onOpenChange(false);
    } catch {
      toast({
        variant: 'danger',
        title: isEditing ? "Couldn't rename list" : "Couldn't create list",
        description: 'Please try again.',
      });
    }
  });

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Rename list' : 'New grocery list'}
      description={
        isEditing
          ? undefined
          : 'Voice- and AI-generated lists arrive in a later phase — start manually for now.'
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
          <Button
            type="submit"
            form="grocery-list-form"
            disabled={isSubmitting}
          >
            {isEditing ? 'Save changes' : 'Create list'}
          </Button>
        </>
      }
    >
      <form
        id="grocery-list-form"
        onSubmit={onSubmit}
        className="gap-4 flex flex-col"
      >
        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="list-title">Title</Label>
          <Input
            id="list-title"
            placeholder="Weekly groceries"
            aria-invalid={!!errors.title}
            {...register('title')}
          />
          {errors.title && (
            <p className="text-caption text-danger">{errors.title.message}</p>
          )}
        </div>
      </form>
    </ResponsiveFormSheet>
  );
}
