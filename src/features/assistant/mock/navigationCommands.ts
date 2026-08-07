import { ROUTES } from '@/constants/routes';

export interface NavigationCommand {
  route: string;
  label: string;
}

interface NavigationRule extends NavigationCommand {
  pattern: RegExp;
}

// Deliberately excludes bare "show" — "show me my bills" is an information
// request (routed to the query/answer path), not a navigation command; only
// unambiguous navigational phrasing belongs here.
const VERB = /\b(open|go to|take me to|navigate to)\b/i;

/**
 * Tightly-scoped, literal verb+noun patterns — deliberately not inferred
 * from loose phrasing. Checked before extraction/context/converse in the
 * Conversation Manager, so "open my bills" never gets misread as a capture.
 */
const NAVIGATION_RULES: NavigationRule[] = [
  { pattern: /\bbills?\b/i, route: ROUTES.bills, label: 'Bills' },
  {
    pattern: /\bgroceries|grocery\b/i,
    route: ROUTES.groceryLists,
    label: 'Grocery Lists',
  },
  {
    pattern: /\bcalendar|schedule\b/i,
    route: ROUTES.calendar,
    label: 'Calendar',
  },
  {
    pattern: /\bmedicine|medicines|health\b/i,
    route: ROUTES.health,
    label: 'Health',
  },
  {
    pattern: /\bsubscriptions?\b/i,
    route: ROUTES.subscriptions,
    label: 'Subscriptions',
  },
  { pattern: /\btasks?\b/i, route: ROUTES.tasks, label: 'Tasks' },
  { pattern: /\bgoals?\b/i, route: ROUTES.goals, label: 'Goals' },
  { pattern: /\bhabits?\b/i, route: ROUTES.habits, label: 'Habits' },
  {
    pattern: /\bfinance|budgets?\b/i,
    route: ROUTES.finance,
    label: 'Finance',
  },
  { pattern: /\bprojects?\b/i, route: ROUTES.projects, label: 'Projects' },
  { pattern: /\breminders?\b/i, route: ROUTES.reminders, label: 'Reminders' },
  {
    pattern: /\blife records?|passport\b/i,
    route: ROUTES.lifeRecords,
    label: 'Life Records',
  },
  {
    pattern: /\bdocuments?\b/i,
    route: ROUTES.documents,
    label: 'Documents',
  },
  { pattern: /\bjournal\b/i, route: ROUTES.journal, label: 'Journal' },
  { pattern: /\bnotes?\b/i, route: ROUTES.notes, label: 'Notes' },
  { pattern: /\banalytics\b/i, route: ROUTES.analytics, label: 'Analytics' },
];

export function tryNavigationCommand(text: string): NavigationCommand | null {
  if (!VERB.test(text)) return null;
  const rule = NAVIGATION_RULES.find((r) => r.pattern.test(text));
  return rule ? { route: rule.route, label: rule.label } : null;
}
