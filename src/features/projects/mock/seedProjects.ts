import type { Project } from '@/features/projects/types';

function timestamp(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

/**
 * `taskIds` is left empty here rather than hardcoded against
 * `seedTasks.ts`'s generated UUIDs (they're created fresh via
 * `crypto.randomUUID()` each seed run, so referencing them by literal ID
 * would drift immediately). Linking a real task happens from the Project
 * Detail page, which reads live IDs off `useTasks()`.
 */
export function seedProjects(): Project[] {
  const base = (
    overrides: Partial<Project> & Pick<Project, 'title' | 'status'>,
  ): Project =>
    ({
      id: crypto.randomUUID(),
      taskIds: [],
      createdAt: timestamp(-45),
      updatedAt: timestamp(-45),
      ...overrides,
    }) as Project;

  return [
    base({
      title: 'LifyQ v1 Launch',
      description: 'Everything needed to ship the first public version.',
      status: 'active',
    }),
    base({
      title: 'Denver Offsite',
      description: 'Travel, agenda, and logistics for the team offsite.',
      status: 'active',
    }),
    base({
      title: 'Home Office Refresh',
      description: 'Redesign the office corner — desk, lighting, storage.',
      status: 'archived',
    }),
  ];
}
