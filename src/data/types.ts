/**
 * Every domain entity extends this — mirrors the standard Postgres/Supabase
 * shape (`id`, `created_at`, `updated_at`) so Phase 4's real tables are a
 * direct translation of these types, not a redesign. See
 * docs/16_Data_Model_Plan.md §2 and docs/13_Technical_Architecture.md §4.
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * The shape every feature's repository implements — mock now, Supabase
 * later, identical signature either way. Nothing above the repository
 * layer (hooks, components) knows or cares which implementation is live.
 */
export interface Repository<
  T extends BaseEntity,
  TCreate extends object,
  TUpdate extends object,
> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | null>;
  create(input: TCreate): Promise<T>;
  update(id: string, input: TUpdate): Promise<T>;
  remove(id: string): Promise<void>;
}
