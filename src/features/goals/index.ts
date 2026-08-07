export { GoalCard } from './components/GoalCard';
export { GoalFormDialog } from './components/GoalFormDialog';
export { GoalsGrid } from './components/GoalsGrid';
export { MilestoneList } from './components/MilestoneList';
export {
  goalKeys,
  useCreateGoal,
  useDeleteGoal,
  useGoal,
  useGoals,
  useToggleMilestone,
  useUpdateGoal,
} from './hooks/useGoals';
export { goalsRepository } from './repository';
export type {
  CreateGoalInput,
  Goal,
  GoalCategory,
  GoalStatus,
  Milestone,
  UpdateGoalInput,
} from './types';
