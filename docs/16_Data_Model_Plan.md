# 16 — Data Model Plan

## 1. Purpose

Defines the typed shape of every entity in the system now, so that (a) mock data is realistic and consistent, and (b) Supabase table design in Phase 4 is a direct translation of these TypeScript types rather than a redesign. Every type below is the literal contract a repository implementation (mock or real) must satisfy, per [13_Technical_Architecture.md](13_Technical_Architecture.md) §4.

## 2. Shared Base Fields

Every entity extends a common base, mapping directly to standard Postgres/Supabase conventions:

```ts
interface BaseEntity {
  id: string;          // UUID; mock layer generates via crypto.randomUUID()
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
  userId: string;      // FK to user; mock layer uses a fixed mock user id
}
```

## 3. MVP Domain Entities

### Task
```ts
interface Task extends BaseEntity {
  title: string;
  notes?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'none' | 'low' | 'medium' | 'high';
  dueDate?: string;
  completedAt?: string;
  projectId?: string;      // FK → Project (Phase 2; nullable now)
  goalId?: string;         // FK → Goal (optional direct link)
  tags: string[];
  subtasks: Subtask[];
}
interface Subtask { id: string; title: string; done: boolean; }
```

### Goal
```ts
interface Goal extends BaseEntity {
  title: string;
  description?: string;
  category: 'career' | 'health' | 'finance' | 'personal' | 'learning' | 'other';
  targetDate?: string;
  status: 'active' | 'completed' | 'archived';
  progress: number;        // 0–100, derived from linked tasks/habits/milestones
  milestones: Milestone[];
}
interface Milestone { id: string; title: string; done: boolean; targetDate?: string; }
```

### Habit
```ts
interface Habit extends BaseEntity {
  title: string;
  frequency: 'daily' | 'weekly' | { daysOfWeek: number[] };
  reminderTime?: string;   // HH:mm
  goalId?: string;         // FK → Goal (optional)
  currentStreak: number;
  longestStreak: number;
  completions: HabitCompletion[];
}
interface HabitCompletion { date: string; completed: boolean; }
```

### CalendarEvent
```ts
interface CalendarEvent extends BaseEntity {
  title: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  location?: string;
  sourceType: 'manual' | 'task' | 'habit';  // 'task'/'habit' = generated/synced, not independently editable
  sourceId?: string;                          // FK to originating Task/Habit if sourceType != 'manual'
}
```

### Note
```ts
interface Note extends BaseEntity {
  title: string;
  content: string;         // rich-text serialized (e.g., JSON from the editor)
  folderId?: string;
  tags: string[];
  linkedEntities: EntityRef[];
}
interface EntityRef {
  type: 'task' | 'goal' | 'habit' | 'event' | 'project'
    | 'lifeRecord' | 'bill' | 'subscription' | 'document'
    | 'medicine' | 'healthEvent' | 'vitalReading' | 'allergy' | 'groceryList';
  id: string;
}
```

### UserProfile / Preferences (mock-session scoped)
```ts
interface UserProfile extends BaseEntity {
  name: string;
  email: string;
  avatarUrl?: string;
  onboardingCompleted: boolean;
  domainPreferences: string[];   // selected during onboarding
}
interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact';
  notificationPrefs: Record<string, boolean>;
}
```

## 4. Post-MVP Domain Entities (defined now, built later — see [07_Feature_Roadmap.md](07_Feature_Roadmap.md))

Defining these now (even though unbuilt) ensures the MVP entities' optional FK fields (`projectId`, `goalId`, etc.) point at real, already-agreed shapes rather than speculative ones.

```ts
interface Project extends BaseEntity {
  title: string; description?: string; goalId?: string;
  status: 'active' | 'completed' | 'archived'; taskIds: string[];
}
interface Transaction extends BaseEntity {
  amount: number; currency: string; type: 'income' | 'expense';
  category: string; date: string; note?: string; budgetId?: string; goalId?: string;
}
interface Budget extends BaseEntity {
  category: string; limit: number; period: 'monthly' | 'weekly'; spent: number;
}
interface JournalEntry extends BaseEntity {
  date: string; content: string; mood?: 'great' | 'good' | 'okay' | 'low' | 'bad';
  linkedEntities: EntityRef[];
}
interface Reminder extends BaseEntity {
  title: string; remindAt: string; linkedEntity?: EntityRef; recurring?: 'daily' | 'weekly' | 'monthly';
  // Life Records / Bills / Subscriptions / Health entries generate these via
  // the Reminder Engine ([13_Technical_Architecture.md](13_Technical_Architecture.md) §10) rather than each module scheduling its own.
}
interface NotificationItem extends BaseEntity {
  type: string; title: string; body?: string; read: boolean; linkedEntity?: EntityRef;
}
```

### Document (enriched — was a bare file record, now the shared attachment layer)
```ts
interface Document extends BaseEntity {
  fileName: string; fileType: string; sizeBytes: number; url: string; // mock: object URL
  category?: 'receipt' | 'contract' | 'invoice' | 'tax' | 'certificate' | 'school' | 'other';
  tags: string[];
  ocrText?: string;              // Phase 4+ real-backend concern; field reserved now
  linkedEntities: EntityRef[];   // attach to a Life Record, Bill, Health entry, or any entity
}
```

### Life Records
```ts
interface LifeRecord extends BaseEntity {
  title: string;
  category: 'passport' | 'drivers_license' | 'national_id' | 'vehicle_registration'
    | 'insurance' | 'membership' | 'bank_card' | 'professional_license' | 'visa' | 'other';
  identifier?: string;           // record/document number
  issuedAt?: string;
  expiresAt?: string;            // drives Reminder Engine generation
  issuingAuthority?: string;
  documentIds: string[];         // FK → Document (attached photos/scans)
}
```

### Bill
```ts
interface Bill extends BaseEntity {
  title: string;
  category: 'electricity' | 'water' | 'internet' | 'mobile' | 'rent' | 'mortgage' | 'other';
  amount?: number;
  dueDate: string;
  recurrence: 'one_time' | 'weekly' | 'monthly' | 'yearly';
  paidHistory: { date: string; amount: number }[];
}
```

### Subscription
```ts
interface Subscription extends BaseEntity {
  serviceName: string;           // e.g. "Netflix", "Claude", "Hosting"
  cost: number;
  billingCycle: 'monthly' | 'yearly';
  nextRenewalAt: string;
  category?: 'entertainment' | 'productivity' | 'ai_tools' | 'domains_hosting' | 'other';
}
```

### Health (four compact entities cover the full requested scope — Medicines and
### Prescriptions share one type since a prescription is a medicine plus a
### dosage schedule; Vaccinations and Doctor Visits share one dated-event type;
### Blood Pressure and Weight share one vitals-reading type. This keeps the
### domain proportionate rather than one interface per bullet point.)
```ts
interface Medicine extends BaseEntity {
  name: string; dosage?: string; form?: 'pill' | 'liquid' | 'injection' | 'other';
  prescribedBy?: string; startDate?: string; endDate?: string;
  expiresAt?: string;             // drives a Reminder Engine expiration nudge
  refillReminderAt?: string;
}
interface HealthEvent extends BaseEntity {
  type: 'vaccination' | 'doctor_visit';
  title: string; date: string; provider?: string; notes?: string;
  nextDueDate?: string;            // e.g. next vaccination booster
}
interface VitalReading extends BaseEntity {
  type: 'blood_pressure' | 'weight';
  date: string;
  value: number | { systolic: number; diastolic: number };
  unit: string;                    // 'kg' | 'lb' | 'mmHg'
}
interface Allergy extends BaseEntity {
  name: string; severity?: 'mild' | 'moderate' | 'severe'; notes?: string;
}
```

### Grocery List (items nested, mirroring `Task.subtasks`)
```ts
interface GroceryList extends BaseEntity {
  title: string;
  source: 'manual' | 'voice' | 'ai';   // voice/AI generation is Phase 5, behind AssistantEngine
  items: GroceryItem[];
}
interface GroceryItem { id: string; name: string; category?: string; quantity?: string; checked: boolean; }
```

## 5. Entity Relationship Diagram (conceptual)

```
Goal 1───* Project 1───* Task
Goal 1───* Habit
Task *───1 CalendarEvent (generated)
Habit *───1 CalendarEvent (generated)
Note *───* {Task | Goal | Habit | Event | Project}   (via EntityRef, many-to-many)
JournalEntry *───* {any entity}                       (via EntityRef)
Transaction *───1 Budget
Transaction *───0..1 Goal
Reminder 0..1───1 {any entity}
LifeRecord *───* Document                             (attached photos/scans, via documentIds)
Bill 1───* {paid history entries}                      (embedded, not a separate entity)
Subscription (standalone, no required links)
Medicine / HealthEvent / VitalReading / Allergy        (siblings under Health; no forced cross-links)
GroceryList 1───* GroceryItem                          (embedded, mirrors Task.subtasks)
Document *───* {any entity}                             (via EntityRef, many-to-many — the shared attachment layer)
```

This mirrors [06_Information_Architecture.md](06_Information_Architecture.md) §4 exactly — that document is the narrative version of this diagram.

## 6. Repository Interfaces (one per domain, standard CRUD shape)

Every domain repository follows the identical interface shape shown in [13_Technical_Architecture.md](13_Technical_Architecture.md) §4 (`list`, `get`, `create`, `update`, `remove`), parameterized by that domain's entity and `Create{X}Input`/`Update{X}Input` types (derived from the entity type via TypeScript `Omit`/`Partial` utility types, never hand-duplicated). Domains with derived/computed fields (Goal's `progress`, Habit's `currentStreak`) compute them in the repository layer so both mock and future Supabase implementations (via a Postgres view or computed column) produce identical shapes to the UI.

## 7. Mock Data / Seeding Strategy

- Each feature's `/mock/seed{Domain}.ts` generates realistic, varied fixture data (using `@faker-js/faker` for names/text where appropriate, hand-authored for narratively coherent cross-links — e.g., a seeded "Run a half-marathon" Goal genuinely links to seeded Habit and Task rows so demo data tells a believable story, directly supporting the journeys in [05_User_Journeys.md](05_User_Journeys.md)).
- Seed data is regenerated fresh per session unless `localStorage` mutations exist (create/update/delete during the session persist locally so a demo/user doesn't lose in-session changes on refresh, without pretending to be real cloud persistence).
- A "Reset mock data" action exists in Settings → Data & Privacy for demo/testing convenience.

## 8. Validation

Every entity has a paired Zod schema (`taskSchema`, `goalSchema`, etc.) co-located in the feature's `types.ts`, used for (a) form validation via React Hook Form ([14_State_Management_Strategy.md](14_State_Management_Strategy.md) §4), and (b) repository-boundary validation (mock repository methods parse input through the schema, matching how a real API layer would reject malformed payloads) — so validation behavior is proven correct before any real backend exists.
