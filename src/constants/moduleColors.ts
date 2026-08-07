/**
 * The single source of truth for "which color is this module" — every
 * nav icon, page empty state, stat tile, and Home badge looks a module's
 * accent up here rather than hardcoding a Tailwind color, so a module is
 * always the same color everywhere it appears. Backed by the `--hue-*`
 * tokens in src/styles/tokens.css (never raw palette utilities directly —
 * see that file's header comment).
 */
export type ModuleId =
  | 'home'
  | 'tasks'
  | 'goals'
  | 'habits'
  | 'calendar'
  | 'notes'
  | 'life-records'
  | 'bills'
  | 'subscriptions'
  | 'documents'
  | 'grocery-lists'
  | 'health'
  | 'projects'
  | 'finance'
  | 'journal'
  | 'reminders'
  | 'analytics'
  | 'profile'
  | 'jarvis';

export interface ModuleAccentClasses {
  /** Icon/text color. */
  icon: string;
  /** Tinted tile/badge background, pairs with `icon`. */
  iconBg: string;
}

type Hue =
  | 'blue'
  | 'purple'
  | 'emerald'
  | 'sky'
  | 'yellow'
  | 'slate'
  | 'orange'
  | 'amber'
  | 'cyan'
  | 'green'
  | 'red'
  | 'violet'
  | 'rose'
  | 'pink'
  | 'gray';

function hueClasses(hue: Hue): ModuleAccentClasses {
  return { icon: `text-hue-${hue}`, iconBg: `bg-hue-${hue}-subtle` };
}

/** Home/Analytics/Jarvis reuse the brand palette rather than a dedicated
 * "indigo" hue — brand already *is* indigo (docs/08 §2.1). */
const BRAND_CLASSES: ModuleAccentClasses = {
  icon: 'text-brand-600 dark:text-brand-400',
  iconBg: 'bg-brand-50 dark:bg-brand-950',
};

export const MODULE_ACCENT: Record<ModuleId, ModuleAccentClasses> = {
  home: BRAND_CLASSES,
  tasks: hueClasses('blue'),
  goals: hueClasses('purple'),
  habits: hueClasses('emerald'),
  calendar: hueClasses('sky'),
  notes: hueClasses('yellow'),
  'life-records': hueClasses('slate'),
  bills: hueClasses('orange'),
  subscriptions: hueClasses('amber'),
  documents: hueClasses('cyan'),
  'grocery-lists': hueClasses('green'),
  health: hueClasses('red'),
  projects: hueClasses('violet'),
  finance: hueClasses('emerald'),
  journal: hueClasses('rose'),
  reminders: hueClasses('pink'),
  analytics: BRAND_CLASSES,
  profile: hueClasses('gray'),
  jarvis: BRAND_CLASSES,
};

/** Jarvis-only — its surfaces (launch card, avatar) use a true blue→purple
 * gradient rather than a flat tint, per its "operating system" framing. */
export const JARVIS_GRADIENT_CLASS =
  'bg-linear-to-br from-blue-500 to-purple-600';
