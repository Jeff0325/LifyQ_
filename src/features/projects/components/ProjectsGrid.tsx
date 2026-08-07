import { FolderKanban } from 'lucide-react';
import { useMemo } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { StaggerItem, StaggerList } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { ProjectsSkeleton } from '@/features/projects/components/ProjectsSkeleton';
import { useProjects } from '@/features/projects/hooks/useProjects';
import type { Project, ProjectFilters } from '@/features/projects/types';

function matchesFilters(project: Project, filters: ProjectFilters): boolean {
  if (filters.status !== 'all' && project.status !== filters.status)
    return false;
  if (filters.search.trim()) {
    const needle = filters.search.trim().toLowerCase();
    const haystack =
      `${project.title} ${project.description ?? ''}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

export interface ProjectsGridProps {
  filters: ProjectFilters;
  onCreate: () => void;
}

export function ProjectsGrid({ filters, onCreate }: ProjectsGridProps) {
  const { data: projects, isLoading, isError, refetch } = useProjects();

  const visible = useMemo(() => {
    if (!projects) return [];
    return projects.filter((project) => matchesFilters(project, filters));
  }, [projects, filters]);

  if (isLoading) return <ProjectsSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your projects"
        onRetry={() => void refetch()}
      />
    );
  }

  if (projects && projects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No projects yet"
        description="Group related tasks under a project to track them together."
        module="projects"
        action={<Button onClick={onCreate}>New project</Button>}
      />
    );
  }

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No projects match your filters"
        description="Try a different search or status."
      />
    );
  }

  return (
    <StaggerList className="gap-4 sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
      {visible.map((project) => (
        <StaggerItem key={project.id}>
          <ProjectCard project={project} />
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
