import { lazy, Suspense } from 'react';
import type * as React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { RouteLoading } from '@/components/shared/RouteLoading';
import { ROUTES } from '@/constants/routes';
import { JarvisRedirect } from '@/features/assistant/components/JarvisRedirect';
import { AppShell } from '@/layouts/AppShell';
import { AuthLayout } from '@/layouts/AuthLayout';
import { RootLayout } from '@/layouts/RootLayout';
import { ErrorPage } from '@/pages/ErrorPage';
import { NotFound } from '@/pages/NotFound';

// Route-level code splitting, one chunk per screen — docs/15_Routing_Strategy.md
// §4 / docs/18_Performance_Strategy.md §2. DesignSystemShowcase in particular
// pulls in every primitive at once and must never ship in the main bundle.
function lazyPage<T extends Record<string, React.ComponentType>>(
  loader: () => Promise<T>,
  named: keyof T,
) {
  return lazy(() =>
    loader().then(
      (m) => ({ default: m[named] }) as { default: React.ComponentType },
    ),
  );
}

const Splash = lazyPage(() => import('@/pages/Splash'), 'Splash');
const Welcome = lazyPage(() => import('@/pages/Welcome'), 'Welcome');
const Login = lazyPage(() => import('@/pages/Login'), 'Login');
const Onboarding = lazyPage(() => import('@/pages/Onboarding'), 'Onboarding');
const Home = lazyPage(() => import('@/pages/Home'), 'Home');
const Tasks = lazyPage(() => import('@/pages/Tasks'), 'Tasks');
const Goals = lazyPage(() => import('@/pages/Goals'), 'Goals');
const GoalDetail = lazyPage(() => import('@/pages/GoalDetail'), 'GoalDetail');
const Habits = lazyPage(() => import('@/pages/Habits'), 'Habits');
const Calendar = lazyPage(() => import('@/pages/Calendar'), 'Calendar');
const Notes = lazyPage(() => import('@/pages/Notes'), 'Notes');
const LifeRecords = lazyPage(
  () => import('@/pages/LifeRecords'),
  'LifeRecords',
);
const Bills = lazyPage(() => import('@/pages/Bills'), 'Bills');
const Subscriptions = lazyPage(
  () => import('@/pages/Subscriptions'),
  'Subscriptions',
);
const Documents = lazyPage(() => import('@/pages/Documents'), 'Documents');
const GroceryLists = lazyPage(
  () => import('@/pages/GroceryLists'),
  'GroceryLists',
);
const GroceryListDetail = lazyPage(
  () => import('@/pages/GroceryListDetail'),
  'GroceryListDetail',
);
const Health = lazyPage(() => import('@/pages/Health'), 'Health');
const Projects = lazyPage(() => import('@/pages/Projects'), 'Projects');
const ProjectDetail = lazyPage(
  () => import('@/pages/ProjectDetail'),
  'ProjectDetail',
);
const Finance = lazyPage(() => import('@/pages/Finance'), 'Finance');
const Journal = lazyPage(() => import('@/pages/Journal'), 'Journal');
const Reminders = lazyPage(() => import('@/pages/Reminders'), 'Reminders');
const Analytics = lazyPage(() => import('@/pages/Analytics'), 'Analytics');
const Profile = lazyPage(() => import('@/pages/Profile'), 'Profile');
const DesignSystemShowcase = lazyPage(
  () => import('@/pages/DesignSystemShowcase'),
  'DesignSystemShowcase',
);

/**
 * Client-side data router. Layout nesting mirrors
 * docs/15_Routing_Strategy.md §2: RootLayout (providers) → AuthLayout
 * (reserved auth gate, inert for now) → AppShell (nav chrome).
 *
 * `/splash` and `/onboarding` are public — full-bleed, no AppShell chrome,
 * reachable but not yet wired into an automatic app-boot redirect (that
 * requires real session/onboarding-completion state, deferred along with
 * auth — see docs/28_Mobile_First_Architecture.md).
 *
 * `/design-system` is deliberately outside AuthLayout/AppShell and not in
 * PRIMARY_NAV_ITEMS — it's internal component-library tooling, not a
 * product page. See docs/27_Design_System_Implementation.md.
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: ROUTES.splash,
        element: (
          <Suspense fallback={<RouteLoading />}>
            <Splash />
          </Suspense>
        ),
      },
      {
        path: ROUTES.welcome,
        element: (
          <Suspense fallback={<RouteLoading />}>
            <Welcome />
          </Suspense>
        ),
      },
      {
        path: ROUTES.login,
        element: (
          <Suspense fallback={<RouteLoading />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: ROUTES.onboarding,
        element: (
          <Suspense fallback={<RouteLoading />}>
            <Onboarding />
          </Suspense>
        ),
      },
      {
        path: '/design-system',
        element: (
          <Suspense fallback={<RouteLoading />}>
            <DesignSystemShowcase />
          </Suspense>
        ),
      },
      {
        element: <AuthLayout />,
        children: [
          {
            element: <AppShell />,
            errorElement: <ErrorPage />,
            children: [
              { index: true, element: <Home /> },
              { path: ROUTES.assistant, element: <JarvisRedirect /> },
              { path: ROUTES.capture, element: <JarvisRedirect /> },
              { path: ROUTES.tasks, element: <Tasks /> },
              { path: ROUTES.goals, element: <Goals /> },
              { path: `${ROUTES.goals}/:goalId`, element: <GoalDetail /> },
              { path: ROUTES.habits, element: <Habits /> },
              { path: ROUTES.calendar, element: <Calendar /> },
              { path: ROUTES.notes, element: <Notes /> },
              { path: ROUTES.lifeRecords, element: <LifeRecords /> },
              { path: ROUTES.bills, element: <Bills /> },
              { path: ROUTES.subscriptions, element: <Subscriptions /> },
              { path: ROUTES.documents, element: <Documents /> },
              { path: ROUTES.groceryLists, element: <GroceryLists /> },
              {
                path: `${ROUTES.groceryLists}/:listId`,
                element: <GroceryListDetail />,
              },
              { path: ROUTES.health, element: <Health /> },
              { path: ROUTES.projects, element: <Projects /> },
              {
                path: `${ROUTES.projects}/:projectId`,
                element: <ProjectDetail />,
              },
              { path: ROUTES.finance, element: <Finance /> },
              { path: ROUTES.journal, element: <Journal /> },
              { path: ROUTES.reminders, element: <Reminders /> },
              { path: ROUTES.analytics, element: <Analytics /> },
              { path: ROUTES.profile, element: <Profile /> },
              { path: '*', element: <NotFound /> },
            ],
          },
        ],
      },
    ],
  },
]);
