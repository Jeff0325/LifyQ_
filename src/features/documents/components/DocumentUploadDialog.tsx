import { zodResolver } from '@hookform/resolvers/zod';
import { UploadCloud } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
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
import { useCreateDocument } from '@/features/documents/hooks/useDocuments';
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  type DocumentFormValues,
  documentFormSchema,
} from '@/features/documents/types';
import { useToast } from '@/hooks/useToast';

const DEFAULT_VALUES: DocumentFormValues = {
  fileName: '',
  fileType: 'application/octet-stream',
  sizeBytes: 0,
  url: '',
  category: 'other',
  tags: '',
};

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Upload dialog only — Documents are edited by delete + re-upload, not in-place, since the underlying file can't change. */
export function DocumentUploadDialog({
  open,
  onOpenChange,
}: DocumentUploadDialogProps) {
  const createDocument = useCreateDocument();
  const { toast } = useToast();
  const [fileLabel, setFileLabel] = useState('');

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = await readAsDataUrl(file);
    setValue('fileName', file.name);
    setValue('fileType', file.type || 'application/octet-stream');
    setValue('sizeBytes', file.size);
    setValue('url', url);
    setFileLabel(file.name);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!values.fileName) {
      toast({ variant: 'danger', title: 'Choose a file first' });
      return;
    }
    try {
      await createDocument.mutateAsync(values);
      toast({ variant: 'success', title: 'Document uploaded' });
      reset(DEFAULT_VALUES);
      setFileLabel('');
      onOpenChange(false);
    } catch {
      toast({
        variant: 'danger',
        title: "Couldn't upload document",
        description: 'Please try again.',
      });
    }
  });

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Upload document"
      description="Stored locally in this browser only — mock storage, not a real upload."
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
          <Button type="submit" form="document-form" disabled={isSubmitting}>
            Upload
          </Button>
        </>
      }
    >
      <form
        id="document-form"
        onSubmit={onSubmit}
        className="gap-4 flex flex-col"
      >
        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="document-file">File</Label>
          <label
            htmlFor="document-file"
            className="gap-2 p-4 duration-base ease-standard flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border text-center transition-colors hover:bg-surface-raised"
          >
            <UploadCloud
              aria-hidden="true"
              className="size-6 text-foreground-tertiary"
            />
            <span className="text-body-sm text-foreground-secondary">
              {fileLabel || 'Choose a file to upload'}
            </span>
            <input
              id="document-file"
              type="file"
              className="sr-only"
              onChange={(event) => void handleFileChange(event)}
            />
          </label>
          {errors.fileName && (
            <p className="text-caption text-danger">
              {errors.fileName.message}
            </p>
          )}
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="document-category">Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="document-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {DOCUMENT_CATEGORY_LABELS[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="document-tags">Tags</Label>
            <Input
              id="document-tags"
              placeholder="tax, 2026"
              {...register('tags')}
            />
          </div>
        </div>
      </form>
    </ResponsiveFormSheet>
  );
}
