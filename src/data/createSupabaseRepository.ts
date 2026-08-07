import { supabase } from '@/lib/supabase';
import type { BaseEntity, Repository } from '@/data/types';

/** Postgres `null` → TS `undefined`, matching how the mock repositories'
 * optional fields already behave (never `null` in a `Task`/`Bill`/etc.). */
export function orUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

export interface SupabaseRepositoryOptions<
  T extends BaseEntity,
  TCreate extends object,
  TUpdate extends object,
> {
  /** The `public.<table>` this entity lives in — see the schema migration. */
  table: string;
  /** Postgres row (snake_case) → the app's entity type (camelCase). */
  fromRow: (row: Record<string, unknown>) => T;
  /** Create input → the columns to insert. `user_id` is added automatically. */
  toInsertRow: (input: TCreate) => Record<string, unknown>;
  /** Update input → the columns to patch. */
  toUpdateRow: (input: TUpdate) => Record<string, unknown>;
  orderBy?: { column: string; ascending?: boolean };
  /** Same purpose as `createMockRepository`'s — computed fields (Goal
   * progress, Habit streaks) that are always derived on read, never
   * trusted from storage. */
  deriveOnRead?: (entity: T) => T;
}

/**
 * The Supabase-backed twin of `createMockRepository` — same
 * `Repository<T, TCreate, TUpdate>` shape, so every hook/component built
 * against a repository doesn't know or care which one is live (docs/13 §4).
 * Row-level security (one `auth.uid() = user_id` policy per table, see the
 * schema migration) is what actually scopes every query to the signed-in
 * user; `user_id` is still set explicitly on insert because RLS's `WITH
 * CHECK` requires it to already be present in the row being inserted.
 */
export function createSupabaseRepository<
  T extends BaseEntity,
  TCreate extends object,
  TUpdate extends object,
>(
  options: SupabaseRepositoryOptions<T, TCreate, TUpdate>,
): Repository<T, TCreate, TUpdate> {
  const { table, fromRow, toInsertRow, toUpdateRow, orderBy, deriveOnRead } =
    options;
  const order = orderBy ?? { column: 'created_at', ascending: false };

  function present(entity: T): T {
    return deriveOnRead ? deriveOnRead(entity) : entity;
  }

  async function requireUserId(): Promise<string> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error(`${table}: not signed in`);
    return user.id;
  }

  return {
    async list() {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order(order.column, { ascending: order.ascending ?? false });
      if (error) throw error;
      return (data ?? []).map((row) => present(fromRow(row)));
    },

    async get(id) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? present(fromRow(data)) : null;
    },

    async create(input) {
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from(table)
        .insert({ ...toInsertRow(input), user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return present(fromRow(data));
    },

    async update(id, input) {
      const { data, error } = await supabase
        .from(table)
        .update(toUpdateRow(input))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return present(fromRow(data));
    },

    async remove(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },
  };
}
