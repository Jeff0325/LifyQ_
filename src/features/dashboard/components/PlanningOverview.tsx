import { BellRing, BookHeart, FolderKanban, Wallet } from 'lucide-react';

import { computeSpent, useBudgets, useTransactions } from '@/features/finance';
import { useJournalEntries } from '@/features/journal';
import { useProjects } from '@/features/projects';
import { useReminders } from '@/features/reminders';
import { StatTile } from '@/features/dashboard/components/StatTile';
import { todayIso } from '@/lib/date';

/**
 * The remaining Phase 2 modules' stat row (Projects, Finance, Journal,
 * Reminders). Trimmed to stats only — its "Reminders" list is now part of
 * the merged `UrgencyFeed` on the redesigned Home
 * (docs/37_Dashboard_Design_Philosophy.md §7's migration table). Lives in
 * the "See everything" disclosure layer now.
 */
export function PlanningOverview() {
  const { data: reminders, isLoading: remindersLoading } = useReminders();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();
  const { data: transactions, isLoading: transactionsLoading } =
    useTransactions();
  const { data: journalEntries, isLoading: journalLoading } =
    useJournalEntries();

  const today = todayIso();
  const dueReminders = (reminders ?? []).filter(
    (r) => !r.completed && r.remindAt <= today,
  );
  const activeProjects = (projects ?? []).filter(
    (p) => p.status === 'active',
  ).length;
  const overBudgetCount = (budgets ?? []).filter(
    (b) => computeSpent(b, transactions ?? []) > b.limit,
  ).length;
  const lastEntry = [...(journalEntries ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date),
  )[0];
  const daysSinceEntry = lastEntry
    ? Math.floor(
        (new Date(today).getTime() - new Date(lastEntry.date).getTime()) /
          86_400_000,
      )
    : null;

  return (
    <div className="gap-3 sm:grid-cols-4 grid grid-cols-2">
      <StatTile
        icon={BellRing}
        label="Reminders due"
        value={String(dueReminders.length)}
        loading={remindersLoading}
        tone={dueReminders.length > 0 ? 'danger' : 'brand'}
      />
      <StatTile
        icon={FolderKanban}
        label="Active projects"
        value={String(activeProjects)}
        loading={projectsLoading}
        tone="brand"
      />
      <StatTile
        icon={Wallet}
        label={overBudgetCount > 0 ? 'Over budget' : 'Budgets on track'}
        value={String(
          overBudgetCount > 0 ? overBudgetCount : (budgets?.length ?? 0),
        )}
        loading={budgetsLoading || transactionsLoading}
        tone={overBudgetCount > 0 ? 'danger' : 'success'}
      />
      <StatTile
        icon={BookHeart}
        label="Days since last entry"
        value={daysSinceEntry === null ? '—' : String(daysSinceEntry)}
        loading={journalLoading}
        tone="warning"
      />
    </div>
  );
}
