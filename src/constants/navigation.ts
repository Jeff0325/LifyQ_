import {
  Activity,
  BellRing,
  BookHeart,
  Calendar,
  CheckSquare,
  CreditCard,
  FolderKanban,
  FolderOpen,
  House,
  IdCard,
  LineChart,
  NotebookText,
  Receipt,
  Repeat,
  ShoppingCart,
  Target,
  User,
  Wallet,
} from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import type { NavItem } from '@/types/nav';

/**
 * The primary navigation set for the mobile-first application shell —
 * docs/28_Mobile_First_Architecture.md, docs/30_Core_Feature_Implementation.md.
 * Home, AI, Tasks, Goals, Calendar, Profile per the Milestone 3 brief;
 * Habits and Notes were reintroduced once built. Later revisions added the
 * life-management expansion modules (docs/07 §Phase 2) — Life Records,
 * Bills, Subscriptions, Documents, Grocery Lists, Health — plus the
 * remaining Phase 2 pillars (Projects, Finance, Journal, Reminders,
 * docs/32) and Analytics (Phase 3, docs/33), completing every planned
 * frontend domain except Notifications (Phase 4). All `enabled: true` and
 * all Tier 2 (reachable via Sidebar / the mobile "More" panel, not a direct
 * bottom tab), per docs/06_Information_Architecture.md §3.
 */
export const PRIMARY_NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: ROUTES.home,
    icon: House,
    enabled: true,
  },
  {
    id: 'tasks',
    label: 'Tasks',
    href: ROUTES.tasks,
    icon: CheckSquare,
    enabled: true,
  },
  {
    id: 'goals',
    label: 'Goals',
    href: ROUTES.goals,
    icon: Target,
    enabled: true,
  },
  {
    id: 'habits',
    label: 'Habits',
    href: ROUTES.habits,
    icon: Repeat,
    enabled: true,
  },
  {
    id: 'calendar',
    label: 'Calendar',
    href: ROUTES.calendar,
    icon: Calendar,
    enabled: true,
  },
  {
    id: 'notes',
    label: 'Notes',
    href: ROUTES.notes,
    icon: NotebookText,
    enabled: true,
  },
  {
    id: 'life-records',
    label: 'Life Records',
    href: ROUTES.lifeRecords,
    icon: IdCard,
    enabled: true,
  },
  {
    id: 'bills',
    label: 'Bills',
    href: ROUTES.bills,
    icon: Receipt,
    enabled: true,
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    href: ROUTES.subscriptions,
    icon: CreditCard,
    enabled: true,
  },
  {
    id: 'documents',
    label: 'Documents',
    href: ROUTES.documents,
    icon: FolderOpen,
    enabled: true,
  },
  {
    id: 'grocery-lists',
    label: 'Grocery Lists',
    href: ROUTES.groceryLists,
    icon: ShoppingCart,
    enabled: true,
  },
  {
    id: 'health',
    label: 'Health',
    href: ROUTES.health,
    icon: Activity,
    enabled: true,
  },
  {
    id: 'projects',
    label: 'Projects',
    href: ROUTES.projects,
    icon: FolderKanban,
    enabled: true,
  },
  {
    id: 'finance',
    label: 'Finance',
    href: ROUTES.finance,
    icon: Wallet,
    enabled: true,
  },
  {
    id: 'journal',
    label: 'Journal',
    href: ROUTES.journal,
    icon: BookHeart,
    enabled: true,
  },
  {
    id: 'reminders',
    label: 'Reminders',
    href: ROUTES.reminders,
    icon: BellRing,
    enabled: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: ROUTES.analytics,
    icon: LineChart,
    enabled: true,
  },
  {
    id: 'profile',
    label: 'Profile',
    href: ROUTES.profile,
    icon: User,
    enabled: true,
  },
];

/**
 * Bottom tab bar shows a max of 3 direct `NavItem` slots + the dedicated,
 * hand-rendered Jarvis button + "More" — docs/10 §2.1. Jarvis is no longer
 * a routed `NavItem` (docs/39 addendum): it's a store-triggered action,
 * rendered directly by `BottomNav`/`Sidebar` rather than mapped from this
 * list, so it isn't one of these ids. Home/Tasks/Goals stay the three
 * direct tabs; every later addition (Habits, Notes, and now the six
 * life-management modules + Profile) joins the "More" disclosure rather
 * than displacing an already-approved direct tab. See docs/30 and
 * docs/06_Information_Architecture.md §3.
 */
export const MOBILE_TAB_ITEM_IDS = ['home', 'tasks', 'goals'];
