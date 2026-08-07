import {
  createSupabaseRepository,
  orUndefined,
} from '@/data/createSupabaseRepository';
import type { Repository } from '@/data/types';
import type {
  CreateLifeRecordInput,
  LifeRecord,
  UpdateLifeRecordInput,
} from '@/features/life-records/types';

export type LifeRecordsRepository = Repository<
  LifeRecord,
  CreateLifeRecordInput,
  UpdateLifeRecordInput
>;

function fromRow(row: Record<string, unknown>): LifeRecord {
  return {
    id: row.id as string,
    title: row.title as string,
    category: row.category as LifeRecord['category'],
    identifier: orUndefined(row.identifier as string | null),
    issuedAt: orUndefined(row.issued_at as string | null),
    expiresAt: orUndefined(row.expires_at as string | null),
    issuingAuthority: orUndefined(row.issuing_authority as string | null),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const lifeRecordsRepository: LifeRecordsRepository =
  createSupabaseRepository<
    LifeRecord,
    CreateLifeRecordInput,
    UpdateLifeRecordInput
  >({
    table: 'life_records',
    fromRow,
    toInsertRow: (input) => ({
      title: input.title,
      category: input.category,
      identifier: input.identifier,
      issued_at: input.issuedAt || null,
      expires_at: input.expiresAt || null,
      issuing_authority: input.issuingAuthority,
    }),
    toUpdateRow: (input) => ({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.identifier !== undefined && {
        identifier: input.identifier,
      }),
      ...(input.issuedAt !== undefined && {
        issued_at: input.issuedAt || null,
      }),
      ...(input.expiresAt !== undefined && {
        expires_at: input.expiresAt || null,
      }),
      ...(input.issuingAuthority !== undefined && {
        issuing_authority: input.issuingAuthority,
      }),
    }),
  });
