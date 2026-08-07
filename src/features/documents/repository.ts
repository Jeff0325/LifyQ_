import { createSupabaseRepository } from '@/data/createSupabaseRepository';
import type { Repository } from '@/data/types';
import type {
  AppDocument,
  CreateDocumentInput,
  UpdateDocumentInput,
} from '@/features/documents/types';

export type DocumentsRepository = Repository<
  AppDocument,
  CreateDocumentInput,
  UpdateDocumentInput
>;

function fromRow(row: Record<string, unknown>): AppDocument {
  return {
    id: row.id as string,
    fileName: row.file_name as string,
    fileType: row.file_type as string,
    sizeBytes: Number(row.size_bytes),
    url: row.url as string,
    category: row.category as AppDocument['category'],
    tags: row.tags as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * `url` is still a client-side data URL for now — real Supabase Storage
 * upload (bucket + signed URL) is a drop-in swap of `toInsertRow`/
 * `toUpdateRow` here later, the rest of this repository doesn't change.
 */
export const documentsRepository: DocumentsRepository =
  createSupabaseRepository<
    AppDocument,
    CreateDocumentInput,
    UpdateDocumentInput
  >({
    table: 'documents',
    fromRow,
    toInsertRow: (input) => ({
      file_name: input.fileName,
      file_type: input.fileType,
      size_bytes: input.sizeBytes,
      url: input.url,
      category: input.category,
      tags: input.tags ?? '',
    }),
    toUpdateRow: (input) => ({
      ...(input.fileName !== undefined && { file_name: input.fileName }),
      ...(input.fileType !== undefined && { file_type: input.fileType }),
      ...(input.sizeBytes !== undefined && {
        size_bytes: input.sizeBytes,
      }),
      ...(input.url !== undefined && { url: input.url }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.tags !== undefined && { tags: input.tags }),
    }),
  });
