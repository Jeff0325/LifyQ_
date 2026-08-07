import type { BaseEntity, Repository } from '@/data/types';

export interface MockRepositoryOptions<T extends BaseEntity> {
  /** localStorage key — in-session edits survive a refresh without pretending to be real cloud persistence, per docs/16_Data_Model_Plan.md §7. */
  storageKey: string;
  /** Fresh fixture data, used on first load and by `reset()`. */
  seed: () => T[];
  minLatencyMs?: number;
  maxLatencyMs?: number;
  /** Optional post-read transform for computed fields (Goal.progress, Habit.currentStreak, ...) — docs/16 §6. Applied on every read, never persisted. */
  deriveOnRead?: (entity: T) => T;
  /**
   * Fills in fields the create form doesn't carry (e.g. Goal's `milestones: []`,
   * `status: 'active'`) before the entity is stored. Defaults to treating
   * `TCreate` as already containing every non-`BaseEntity` field — true for
   * simple entities (Task) but not for ones with extra defaulted/derived
   * fields (Goal, Habit).
   */
  prepareCreate?: (input: unknown) => Partial<T>;
}

function delay(min: number, max: number): Promise<void> {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Builds a mock repository over an in-memory + localStorage-backed array.
 * The single seam every feature's real repository interface is implemented
 * against now; a Supabase-backed implementation later satisfies the exact
 * same `Repository<T, TCreate, TUpdate>` shape — see
 * docs/13_Technical_Architecture.md §4 and docs/30_Core_Feature_Implementation.md.
 */
export function createMockRepository<
  T extends BaseEntity,
  TCreate extends object,
  TUpdate extends object,
>(options: MockRepositoryOptions<T>) {
  const {
    storageKey,
    seed,
    minLatencyMs = 150,
    maxLatencyMs = 500,
    deriveOnRead,
    prepareCreate,
  } = options;
  let store: T[] | null = null;

  function load(): T[] {
    if (store) return store;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        store = JSON.parse(raw) as T[];
        return store;
      }
    } catch {
      // corrupt/blocked storage — fall through to fresh seed
    }
    store = seed();
    persist();
    return store;
  }

  function persist(): void {
    try {
      localStorage.setItem(storageKey, JSON.stringify(store));
    } catch {
      // storage unavailable (private browsing, quota) — in-memory still works for this session
    }
  }

  function present(entity: T): T {
    return deriveOnRead ? deriveOnRead(entity) : entity;
  }

  const repository: Repository<T, TCreate, TUpdate> & { reset: () => void } = {
    async list() {
      await delay(minLatencyMs, maxLatencyMs);
      return load().map(present);
    },

    async get(id) {
      await delay(minLatencyMs, maxLatencyMs);
      const found = load().find((entity) => entity.id === id);
      return found ? present(found) : null;
    },

    async create(input) {
      await delay(minLatencyMs, maxLatencyMs);
      const now = new Date().toISOString();
      const body = prepareCreate ? prepareCreate(input) : input;
      const entity = {
        ...body,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      } as unknown as T;
      load().unshift(entity);
      persist();
      return present(entity);
    },

    async update(id, input) {
      await delay(minLatencyMs, maxLatencyMs);
      const list = load();
      const index = list.findIndex((entity) => entity.id === id);
      if (index === -1) {
        throw new Error(`${storageKey}: no entity with id "${id}"`);
      }
      const updated = {
        ...list[index],
        ...input,
        updatedAt: new Date().toISOString(),
      } as unknown as T;
      list[index] = updated;
      persist();
      return present(updated);
    },

    async remove(id) {
      await delay(minLatencyMs, maxLatencyMs);
      store = load().filter((entity) => entity.id !== id);
      persist();
    },

    /** Discards in-session edits and restores the original seed — surfaced in Settings → Data & Privacy per docs/16 §7 (not built yet, but the primitive is ready). */
    reset() {
      store = seed();
      persist();
    },
  };

  return repository;
}
