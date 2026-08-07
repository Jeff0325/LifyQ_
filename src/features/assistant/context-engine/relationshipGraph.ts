export type RelationshipKind = 'structural' | 'inferred';

export interface RelationshipEntry {
  from: string;
  to: string;
  kind: RelationshipKind;
  basis: string;
}

/**
 * The formalized entity-relationship table — docs/38_Context_Engine.md §1,
 * docs/06_Information_Architecture.md §4. Documentation-as-data, not a new
 * database: **structural** rows are stored references (`EntityRef` or a
 * direct field) every domain already has; **inferred** rows are never
 * stored anywhere and only exist when `mockContextEngine.ts` computes them
 * at query time. This table isn't mechanically consumed for runtime
 * dispatch — `mockContextEngine.ts` has its own small keyword classifier —
 * it's the single source of truth for *which* relationships are legitimate
 * to reason over, kept in sync by hand as new domains/relationships ship.
 */
export const RELATIONSHIP_GRAPH: RelationshipEntry[] = [
  {
    from: 'Goal',
    to: 'Project(s)',
    kind: 'structural',
    basis: 'Goal is broken down into Projects',
  },
  {
    from: 'Goal',
    to: 'Habit(s)',
    kind: 'structural',
    basis: 'Goal is broken down into Habits',
  },
  {
    from: 'Project',
    to: 'Task(s)',
    kind: 'structural',
    basis: "Project.taskIds — Project's linked tasks",
  },
  {
    from: 'Task',
    to: 'Calendar Event',
    kind: 'structural',
    basis: 'Task.dueDate surfaces on the Calendar',
  },
  {
    from: 'Habit',
    to: 'Calendar Event',
    kind: 'structural',
    basis: 'Habit.reminderTime surfaces on the Calendar',
  },
  {
    from: 'Task / Event / Habit',
    to: 'Note',
    kind: 'structural',
    basis: 'EntityRef',
  },
  {
    from: 'Journal Entry',
    to: 'Task / Goal / Habit',
    kind: 'structural',
    basis: 'EntityRef',
  },
  {
    from: 'Transaction',
    to: 'Budget',
    kind: 'structural',
    basis: 'Matching category',
  },
  {
    from: 'Reminder',
    to: 'any entity',
    kind: 'structural',
    basis: 'EntityRef',
  },
  {
    from: 'Note',
    to: 'any entity',
    kind: 'structural',
    basis: 'EntityRef',
  },
  {
    from: 'Document',
    to: 'any entity',
    kind: 'structural',
    basis: 'EntityRef',
  },
  {
    from: 'Life Record / Bill / Subscription / Medicine',
    to: 'Reminder',
    kind: 'structural',
    basis: 'Reminder Engine registration',
  },
  {
    from: 'Bill',
    to: 'Budget',
    kind: 'inferred',
    basis: 'Bill.category matches Budget.category',
  },
  {
    from: 'Subscription',
    to: 'Transaction / recurring spending',
    kind: 'inferred',
    basis:
      "Subscription's normalized monthly cost compared against matching-category Transaction history — cost-impact only, see docs/38 §6",
  },
  {
    from: 'Medicine',
    to: 'Health Event (doctor visit)',
    kind: 'inferred',
    basis: 'Medicine.expiresAt compared against upcoming HealthEvent.date',
  },
  {
    from: 'Life Record (passport)',
    to: 'Calendar Event',
    kind: 'inferred',
    basis:
      'LifeRecord.expiresAt compared against a CalendarEvent whose title matches travel keywords (trip/flight/travel/vacation/offsite/conference) — stands in for "future travel" until Travel is a real pillar, see docs/38 §6',
  },
];

export const INFERRED_RELATIONSHIPS = RELATIONSHIP_GRAPH.filter(
  (entry) => entry.kind === 'inferred',
);
