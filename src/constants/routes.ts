/**
 * Centralized route paths. Nothing in the app should hardcode a path
 * string outside this file — see docs/15_Routing_Strategy.md §2.
 *
 * Milestone 3 (docs/28) narrowed primary navigation to six sections: Home,
 * AI, Tasks, Goals, Calendar, Profile. Milestone 4 (docs/30) reintroduces
 * Habits and Notes as built features, plus Settings. Later revisions
 * (docs/07 §Phase 2) add the life-management expansion modules — Life
 * Records, Bills, Subscriptions, Documents, Grocery Lists, Health — all
 * Tier 2 (reachable via the "More" panel / Sidebar, not a direct bottom
 * tab), per docs/06_Information_Architecture.md §3. Phase 3.5 (docs/06 §7)
 * renames `ai` → `assistant` (Jarvis) and adds `capture`, the ICE quick
 * entry route.
 */
export const ROUTES = {
  // Public — outside AuthLayout/AppShell, no nav chrome.
  splash: '/splash',
  welcome: '/welcome',
  login: '/login',
  onboarding: '/onboarding',

  // Application — inside AppShell.
  home: '/',
  assistant: '/assistant',
  capture: '/capture',
  tasks: '/tasks',
  goals: '/goals',
  habits: '/habits',
  calendar: '/calendar',
  notes: '/notes',
  lifeRecords: '/life-records',
  bills: '/bills',
  subscriptions: '/subscriptions',
  documents: '/documents',
  groceryLists: '/grocery-lists',
  health: '/health',
  projects: '/projects',
  finance: '/finance',
  journal: '/journal',
  reminders: '/reminders',
  analytics: '/analytics',
  profile: '/profile',
} as const;

export function goalDetailPath(goalId: string): string {
  return `${ROUTES.goals}/${goalId}`;
}

export function groceryListDetailPath(listId: string): string {
  return `${ROUTES.groceryLists}/${listId}`;
}

export function projectDetailPath(projectId: string): string {
  return `${ROUTES.projects}/${projectId}`;
}
