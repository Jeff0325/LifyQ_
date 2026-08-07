import { Plus } from 'lucide-react';
import { useState } from 'react';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import {
  ProjectFilterBar,
  ProjectFormDialog,
  ProjectsGrid,
} from '@/features/projects';
import {
  DEFAULT_PROJECT_FILTERS,
  type ProjectFilters,
} from '@/features/projects/types';

export function Projects() {
  const [filters, setFilters] = useState<ProjectFilters>(
    DEFAULT_PROJECT_FILTERS,
  );
  const [formOpen, setFormOpen] = useState(false);

  return (
    <PageContainer size="lg" className="gap-4 flex flex-col">
      <div className="gap-3 flex items-center justify-between">
        <h2 className="font-semibold text-h2 text-foreground">Projects</h2>
        <Button onClick={() => setFormOpen(true)} size="sm">
          <Plus aria-hidden="true" />
          New project
        </Button>
      </div>

      <ProjectFilterBar filters={filters} onChange={setFilters} />

      <ProjectsGrid filters={filters} onCreate={() => setFormOpen(true)} />

      <ProjectFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </PageContainer>
  );
}
