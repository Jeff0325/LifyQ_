export { ProjectCard } from './components/ProjectCard';
export { ProjectFilterBar } from './components/ProjectFilterBar';
export { ProjectFormDialog } from './components/ProjectFormDialog';
export { ProjectsGrid } from './components/ProjectsGrid';
export {
  projectKeys,
  useCreateProject,
  useDeleteProject,
  useProject,
  useProjects,
  useSetProjectTasks,
  useUpdateProject,
} from './hooks/useProjects';
export { projectsRepository } from './repository';
export type {
  CreateProjectInput,
  Project,
  ProjectFilters,
  ProjectStatus,
  UpdateProjectInput,
} from './types';
export {
  DEFAULT_PROJECT_FILTERS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUSES,
} from './types';
