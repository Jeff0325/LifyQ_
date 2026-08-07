import { ROUTES } from '@/constants/routes';

export interface SuggestionChip {
  label: string;
  kind: 'ask' | 'open' | 'insight';
  prompt?: string;
  route?: string;
}

interface PoolEntry {
  keywords: RegExp;
  ask: SuggestionChip;
  open: SuggestionChip;
}

const POOL: PoolEntry[] = [
  {
    keywords: /\btask/i,
    ask: {
      label: "What's on my plate today?",
      kind: 'ask',
      prompt: "What's on my plate today?",
    },
    open: { label: 'Open Tasks', kind: 'open', route: ROUTES.tasks },
  },
  {
    keywords: /\bgoal/i,
    ask: {
      label: 'How are my goals tracking?',
      kind: 'ask',
      prompt: 'How are my goals tracking?',
    },
    open: { label: 'Open Goals', kind: 'open', route: ROUTES.goals },
  },
  {
    keywords: /\bhabit/i,
    ask: {
      label: 'Did I keep up my habits?',
      kind: 'ask',
      prompt: 'Did I keep up my habits today?',
    },
    open: { label: 'Open Habits', kind: 'open', route: ROUTES.habits },
  },
  {
    keywords: /\b(calendar|event|schedule)/i,
    ask: {
      label: "What's on my calendar?",
      kind: 'ask',
      prompt: "What's next on my calendar?",
    },
    open: { label: 'Open Calendar', kind: 'open', route: ROUTES.calendar },
  },
  {
    keywords: /\bbill/i,
    ask: {
      label: 'What bills are due?',
      kind: 'ask',
      prompt: 'What bills are due this week?',
    },
    open: { label: 'Open Bills', kind: 'open', route: ROUTES.bills },
  },
  {
    keywords: /\b(finance|budget|spend)/i,
    ask: {
      label: 'How is my spending?',
      kind: 'ask',
      prompt: 'How much have I spent this month?',
    },
    open: { label: 'Open Finance', kind: 'open', route: ROUTES.finance },
  },
  {
    keywords: /\bproject/i,
    ask: {
      label: 'How are my projects going?',
      kind: 'ask',
      prompt: 'How are my projects going?',
    },
    open: { label: 'Open Projects', kind: 'open', route: ROUTES.projects },
  },
];

/**
 * Up to 3 chips, excluding whatever domain the last exchange already
 * covered — keyword-based, same honestly-scoped-mock spirit as the rest
 * of ICE/the Context Engine, not real topic modeling. The last pick is an
 * "open" (navigate) chip, the rest are "ask" chips — mirrors the mix of
 * question/action chips observed in the studied KURAMA experience.
 */
export function suggestNextSteps(lastText: string): SuggestionChip[] {
  const remaining = POOL.filter(
    (entry) => !entry.keywords.test(lastText),
  ).slice(0, 3);
  return remaining.map((entry, i) =>
    i === remaining.length - 1 ? entry.open : entry.ask,
  );
}
