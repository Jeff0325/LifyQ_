import { z } from 'zod';

import type { BaseEntity } from '@/data/types';

export const DOCUMENT_CATEGORIES = [
  'receipt',
  'contract',
  'invoice',
  'tax',
  'certificate',
  'school',
  'other',
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export interface AppDocument extends BaseEntity {
  fileName: string;
  fileType: string;
  sizeBytes: number;
  url: string; // mock: data URL from FileReader, or '' for seed placeholders
  category: DocumentCategory;
  tags: string;
}

export const documentFormSchema = z.object({
  fileName: z.string().trim().min(1, 'File name is required').max(160),
  fileType: z.string().trim(),
  sizeBytes: z.number().min(0),
  url: z.string(),
  category: z.enum(DOCUMENT_CATEGORIES),
  tags: z.string().trim().max(200).optional(),
});

export type DocumentFormValues = z.infer<typeof documentFormSchema>;
export type CreateDocumentInput = DocumentFormValues;
export type UpdateDocumentInput = Partial<DocumentFormValues>;

export interface DocumentFilters {
  search: string;
  category: DocumentCategory | 'all';
}

export const DEFAULT_DOCUMENT_FILTERS: DocumentFilters = {
  search: '',
  category: 'all',
};

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  receipt: 'Receipt',
  contract: 'Contract',
  invoice: 'Invoice',
  tax: 'Tax File',
  certificate: 'Certificate',
  school: 'School Record',
  other: 'Other',
};
