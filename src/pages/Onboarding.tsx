import {
  Activity,
  CalendarDays,
  CheckSquare,
  DollarSign,
  LayoutGrid,
  Repeat,
  Sparkles,
} from 'lucide-react';
import type * as React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ROUTES } from '@/constants/routes';
import { accountBundleKey } from '@/features/settings/hooks/useAccountBootstrap';
import { saveOnboarding } from '@/features/settings/api/account';
import { useNotificationPrefsStore } from '@/features/settings/store';
import { useProfileStore } from '@/features/settings/store';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import {
  FOCUS_AREAS,
  type FocusArea,
  useOnboardingStore,
} from '@/stores/useOnboardingStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useJarvisStore } from '@/stores/useJarvisStore';
import { usePreferencesStore } from '@/stores/usePreferencesStore';
import { useQueryClient } from '@tanstack/react-query';

const GENDERS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const LANGUAGES = [
  'English',
  'Filipino',
  'Spanish',
  'Mandarin Chinese',
  'Japanese',
  'Korean',
  'French',
  'German',
  'Arabic',
  'Hindi',
];
const COUNTRIES = [
  'Philippines',
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Singapore',
  'Japan',
  'South Korea',
  'India',
  'Germany',
  'France',
  'Spain',
  'Mexico',
  'Brazil',
  'United Arab Emirates',
  'Other',
];
const TIME_ZONES = [
  'Asia/Manila',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Hong_Kong',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Australia/Sydney',
  'Pacific/Auckland',
];
const CALENDAR_VIEWS: { value: 'day' | 'week' | 'month' | 'agenda'; label: string }[] = [
  { value: 'agenda', label: 'Agenda' },
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];
const FOCUS_AREA_META: Record<
  FocusArea,
  { label: string; icon: typeof CheckSquare }
> = {
  productivity: { label: 'Productivity', icon: CheckSquare },
  health: { label: 'Health', icon: Activity },
  finance: { label: 'Finance', icon: DollarSign },
  habits: { label: 'Habits', icon: Repeat },
  'personal-organization': {
    label: 'Personal organization',
    icon: CalendarDays,
  },
};

const STEP_COUNT = 5;
const STEP_LABELS = [
  'Personal',
  'Productivity',
  'Health',
  'Preferences',
  'Goals',
];

function FieldLabel({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <Label className="gap-1.5 flex items-center">
      {children}
      {optional && (
        <span className="font-normal text-caption text-foreground-tertiary">
          (optional)
        </span>
      )}
    </Label>
  );
}

/**
 * First-Time Setup — the step after mock sign-in, before Home. Collects
 * the minimum personalization data (docs/22 onboarding architecture) so
 * Home never opens to a generic empty experience: name feeds
 * `useProfileStore` (Home's greeting), theme feeds `usePreferencesStore`,
 * voice feeds `useJarvisStore`, notifications feed
 * `useNotificationPrefsStore` — all on finish, all through each store's
 * own existing setter, never duplicated state. Everything else (DOB,
 * gender, timezone, country, language, schedule, health basics, focus
 * areas) lives in `useOnboardingStore` alone, ready for a later profile
 * page or real backend to read without this flow changing shape.
 */
export function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id);

  const personal = useOnboardingStore((state) => state.personal);
  const productivity = useOnboardingStore((state) => state.productivity);
  const health = useOnboardingStore((state) => state.health);
  const preferences = useOnboardingStore((state) => state.preferences);
  const focusAreas = useOnboardingStore((state) => state.focusAreas);
  const updatePersonal = useOnboardingStore((state) => state.updatePersonal);
  const updateProductivity = useOnboardingStore(
    (state) => state.updateProductivity,
  );
  const updateHealth = useOnboardingStore((state) => state.updateHealth);
  const updatePreferences = useOnboardingStore(
    (state) => state.updatePreferences,
  );
  const toggleFocusArea = useOnboardingStore((state) => state.toggleFocusArea);
  const markCompleted = useOnboardingStore((state) => state.markCompleted);

  const setProfile = useProfileStore((state) => state.setProfile);
  const profileEmail = useProfileStore((state) => state.email);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const jarvisVoiceEnabled = useJarvisStore((state) => state.voiceEnabled);
  const toggleJarvisVoice = useJarvisStore((state) => state.toggleVoice);
  const setNotificationPref = useNotificationPrefsStore(
    (state) => state.setPref,
  );

  const canContinue = step !== 0 || personal.firstName.trim().length > 0;

  const finish = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await saveOnboarding(
        userId,
        {
          firstName: personal.firstName,
          lastName: personal.lastName,
          displayName: personal.displayName,
          dateOfBirth: personal.dateOfBirth,
          gender: personal.gender,
          timeZone: personal.timeZone,
          country: personal.country,
          preferredLanguage: personal.preferredLanguage,
        },
        {
          workStart: productivity.workStart,
          workEnd: productivity.workEnd,
          wakeUpTime: productivity.wakeUpTime,
          bedTime: productivity.bedTime,
          firstDayOfWeek: productivity.firstDayOfWeek,
          heightCm: health.heightCm,
          weightKg: health.weightKg,
          bloodType: health.bloodType,
          emergencyContactName: health.emergencyContactName,
          emergencyContactPhone: health.emergencyContactPhone,
          notificationsEnabled: preferences.notificationsEnabled,
          jarvisVoiceEnabled: preferences.jarvisVoiceEnabled,
          theme: preferences.theme,
          defaultCalendarView: preferences.defaultCalendarView,
          focusAreas,
        },
      );

      const fullName =
        personal.displayName.trim() ||
        [personal.firstName, personal.lastName]
          .filter(Boolean)
          .join(' ')
          .trim();
      if (fullName) setProfile({ name: fullName, email: profileEmail });
      setTheme(preferences.theme);
      if (jarvisVoiceEnabled !== preferences.jarvisVoiceEnabled)
        toggleJarvisVoice();
      if (!preferences.notificationsEnabled) {
        setNotificationPref('taskReminders', false);
        setNotificationPref('habitReminders', false);
        setNotificationPref('weeklyDigest', false);
      }
      markCompleted();
      await queryClient.invalidateQueries({
        queryKey: accountBundleKey(userId),
      });
      navigate(ROUTES.home, { replace: true });
    } catch {
      toast({
        variant: 'danger',
        title: "Couldn't save your setup",
        description: 'Check your connection and try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    if (step < STEP_COUNT - 1) setStep(step + 1);
    else void finish();
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const allFocusSelected = FOCUS_AREAS.every((a) => focusAreas.includes(a));
  const toggleAllFocus = () => {
    FOCUS_AREAS.forEach((a) => {
      const included = focusAreas.includes(a);
      if (allFocusSelected ? included : !included) toggleFocusArea(a);
    });
  };

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <PageContainer
        size="sm"
        className="gap-6 px-6 py-8 flex flex-1 flex-col"
      >
        <div className="gap-1.5 flex items-center justify-center" aria-hidden="true">
          {Array.from({ length: STEP_COUNT }).map((_, index) => (
            <span
              key={index}
              className={cn(
                'h-1.5 w-8 duration-base ease-standard rounded-full transition-colors',
                index === step ? 'bg-brand-600' : 'bg-border',
              )}
            />
          ))}
        </div>

        <div className="gap-1 flex flex-col text-center">
          <p className="font-medium tracking-wide text-caption text-brand-600 uppercase">
            Step {step + 1} of {STEP_COUNT} — {STEP_LABELS[step]}
          </p>
        </div>

        <div className="gap-5 flex flex-1 flex-col overflow-y-auto">
          {step === 0 && (
            <div className="gap-4 flex flex-col">
              <div className="gap-2 flex flex-col text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950">
                  <Sparkles
                    aria-hidden="true"
                    className="size-7 text-brand-600 dark:text-brand-400"
                  />
                </div>
                <h1 className="font-semibold text-h2 text-foreground">
                  Tell us about yourself
                </h1>
                <p className="text-body-sm text-foreground-secondary">
                  This is what LifyQ and Jarvis will use to greet you.
                </p>
              </div>

              <div className="gap-3 grid grid-cols-2">
                <div className="gap-1.5 flex flex-col">
                  <FieldLabel>First name</FieldLabel>
                  <Input
                    value={personal.firstName}
                    onChange={(e) =>
                      updatePersonal({ firstName: e.target.value })
                    }
                    placeholder="Jefferson"
                  />
                </div>
                <div className="gap-1.5 flex flex-col">
                  <FieldLabel optional>Last name</FieldLabel>
                  <Input
                    value={personal.lastName}
                    onChange={(e) =>
                      updatePersonal({ lastName: e.target.value })
                    }
                    placeholder="Germino"
                  />
                </div>
              </div>

              <div className="gap-1.5 flex flex-col">
                <FieldLabel optional>Display name</FieldLabel>
                <Input
                  value={personal.displayName}
                  onChange={(e) =>
                    updatePersonal({ displayName: e.target.value })
                  }
                  placeholder="How Jarvis should address you"
                />
              </div>

              <div className="gap-3 grid grid-cols-2">
                <div className="gap-1.5 flex flex-col">
                  <FieldLabel optional>Date of birth</FieldLabel>
                  <Input
                    type="date"
                    value={personal.dateOfBirth}
                    onChange={(e) =>
                      updatePersonal({ dateOfBirth: e.target.value })
                    }
                  />
                </div>
                <div className="gap-1.5 flex flex-col">
                  <FieldLabel optional>Gender</FieldLabel>
                  <Select
                    value={personal.gender || undefined}
                    onValueChange={(v) => updatePersonal({ gender: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="gap-3 grid grid-cols-2">
                <div className="gap-1.5 flex flex-col">
                  <FieldLabel>Country</FieldLabel>
                  <Select
                    value={personal.country || undefined}
                    onValueChange={(v) => updatePersonal({ country: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="gap-1.5 flex flex-col">
                  <FieldLabel>Time zone</FieldLabel>
                  <Select
                    value={personal.timeZone}
                    onValueChange={(v) => updatePersonal({ timeZone: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_ZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="gap-1.5 flex flex-col">
                <FieldLabel>Preferred language</FieldLabel>
                <Select
                  value={personal.preferredLanguage}
                  onValueChange={(v) =>
                    updatePersonal({ preferredLanguage: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="gap-4 flex flex-col">
              <div className="gap-2 flex flex-col text-center">
                <h1 className="font-semibold text-h2 text-foreground">
                  How does your day usually go?
                </h1>
                <p className="text-body-sm text-foreground-secondary">
                  Jarvis uses this to plan around your schedule.
                </p>
              </div>

              <div className="gap-3 grid grid-cols-2">
                <div className="gap-1.5 flex flex-col">
                  <FieldLabel optional>Work starts</FieldLabel>
                  <Input
                    type="time"
                    value={productivity.workStart}
                    onChange={(e) =>
                      updateProductivity({ workStart: e.target.value })
                    }
                  />
                </div>
                <div className="gap-1.5 flex flex-col">
                  <FieldLabel optional>Work ends</FieldLabel>
                  <Input
                    type="time"
                    value={productivity.workEnd}
                    onChange={(e) =>
                      updateProductivity({ workEnd: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="gap-3 grid grid-cols-2">
                <div className="gap-1.5 flex flex-col">
                  <FieldLabel optional>Usual wake-up time</FieldLabel>
                  <Input
                    type="time"
                    value={productivity.wakeUpTime}
                    onChange={(e) =>
                      updateProductivity({ wakeUpTime: e.target.value })
                    }
                  />
                </div>
                <div className="gap-1.5 flex flex-col">
                  <FieldLabel optional>Usual bedtime</FieldLabel>
                  <Input
                    type="time"
                    value={productivity.bedTime}
                    onChange={(e) =>
                      updateProductivity({ bedTime: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="gap-1.5 flex flex-col">
                <FieldLabel>Preferred first day of the week</FieldLabel>
                <div className="gap-2 flex">
                  {(['monday', 'sunday'] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={productivity.firstDayOfWeek === value}
                      onClick={() =>
                        updateProductivity({ firstDayOfWeek: value })
                      }
                      className={cn(
                        'flex-1 px-3 py-2 duration-base ease-standard rounded-md border text-body-sm font-medium capitalize transition-colors',
                        productivity.firstDayOfWeek === value
                          ? 'border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-950'
                          : 'border-border text-foreground-secondary hover:bg-surface-raised',
                      )}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="gap-4 flex flex-col">
              <div className="gap-2 flex flex-col text-center">
                <h1 className="font-semibold text-h2 text-foreground">
                  A few health basics
                </h1>
                <p className="text-body-sm text-foreground-secondary">
                  Completely optional — skip if you'd rather not share this
                  yet.
                </p>
              </div>

              <div className="gap-3 grid grid-cols-2">
                <div className="gap-1.5 flex flex-col">
                  <FieldLabel optional>Height (cm)</FieldLabel>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={health.heightCm}
                    onChange={(e) =>
                      updateHealth({ heightCm: e.target.value })
                    }
                    placeholder="170"
                  />
                </div>
                <div className="gap-1.5 flex flex-col">
                  <FieldLabel optional>Weight (kg)</FieldLabel>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={health.weightKg}
                    onChange={(e) =>
                      updateHealth({ weightKg: e.target.value })
                    }
                    placeholder="65"
                  />
                </div>
              </div>

              <div className="gap-1.5 flex flex-col">
                <FieldLabel optional>Blood type</FieldLabel>
                <Select
                  value={health.bloodType || undefined}
                  onValueChange={(v) => updateHealth({ bloodType: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPES.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="gap-3 grid grid-cols-2">
                <div className="gap-1.5 flex flex-col">
                  <FieldLabel optional>Emergency contact name</FieldLabel>
                  <Input
                    value={health.emergencyContactName}
                    onChange={(e) =>
                      updateHealth({ emergencyContactName: e.target.value })
                    }
                  />
                </div>
                <div className="gap-1.5 flex flex-col">
                  <FieldLabel optional>Emergency contact phone</FieldLabel>
                  <Input
                    type="tel"
                    value={health.emergencyContactPhone}
                    onChange={(e) =>
                      updateHealth({ emergencyContactPhone: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="gap-4 flex flex-col">
              <div className="gap-2 flex flex-col text-center">
                <h1 className="font-semibold text-h2 text-foreground">
                  Make it yours
                </h1>
                <p className="text-body-sm text-foreground-secondary">
                  You can change any of this later in Profile.
                </p>
              </div>

              <div className="gap-3 flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="font-medium text-body-sm text-foreground">
                    Enable notifications
                  </p>
                  <p className="text-caption text-foreground-tertiary">
                    Reminders for tasks, habits, and bills.
                  </p>
                </div>
                <Switch
                  checked={preferences.notificationsEnabled}
                  onCheckedChange={(checked) =>
                    updatePreferences({ notificationsEnabled: checked })
                  }
                  aria-label="Enable notifications"
                />
              </div>

              <div className="gap-3 flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="font-medium text-body-sm text-foreground">
                    Jarvis voice replies
                  </p>
                  <p className="text-caption text-foreground-tertiary">
                    Jarvis speaks its answers aloud, not just text.
                  </p>
                </div>
                <Switch
                  checked={preferences.jarvisVoiceEnabled}
                  onCheckedChange={(checked) =>
                    updatePreferences({ jarvisVoiceEnabled: checked })
                  }
                  aria-label="Enable Jarvis voice replies"
                />
              </div>

              <div className="gap-1.5 flex flex-col">
                <FieldLabel>Theme</FieldLabel>
                <div className="gap-2 flex">
                  {(['light', 'system', 'dark'] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={preferences.theme === value}
                      onClick={() => updatePreferences({ theme: value })}
                      className={cn(
                        'flex-1 px-3 py-2 duration-base ease-standard rounded-md border text-body-sm font-medium capitalize transition-colors',
                        preferences.theme === value
                          ? 'border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-950'
                          : 'border-border text-foreground-secondary hover:bg-surface-raised',
                      )}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="gap-1.5 flex flex-col">
                <FieldLabel>Default calendar view</FieldLabel>
                <Select
                  value={preferences.defaultCalendarView}
                  onValueChange={(v) =>
                    updatePreferences({
                      defaultCalendarView: v as typeof preferences.defaultCalendarView,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CALENDAR_VIEWS.map((v) => (
                      <SelectItem key={v.value} value={v.value}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="gap-4 flex flex-col">
              <div className="gap-2 flex flex-col text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950">
                  <LayoutGrid
                    aria-hidden="true"
                    className="size-7 text-brand-600 dark:text-brand-400"
                  />
                </div>
                <h1 className="font-semibold text-h2 text-foreground">
                  What do you want LifyQ to help you with?
                </h1>
                <p className="text-body-sm text-foreground-secondary">
                  Pick as many as you like — you can change this anytime.
                </p>
              </div>

              <div className="gap-2 grid grid-cols-2">
                {FOCUS_AREAS.map((area) => {
                  const { label, icon: Icon } = FOCUS_AREA_META[area];
                  const selected = focusAreas.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleFocusArea(area)}
                      className={cn(
                        'gap-2 p-3 duration-base ease-standard flex flex-col items-start rounded-xl border text-left transition-colors',
                        selected
                          ? 'border-brand-600 bg-brand-50 dark:bg-brand-950'
                          : 'border-border hover:bg-surface-raised',
                      )}
                    >
                      <Icon
                        aria-hidden="true"
                        className={cn(
                          'size-5',
                          selected
                            ? 'text-brand-600'
                            : 'text-foreground-tertiary',
                        )}
                      />
                      <span className="font-medium text-body-sm text-foreground">
                        {label}
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  aria-pressed={allFocusSelected}
                  onClick={toggleAllFocus}
                  className={cn(
                    'gap-2 p-3 duration-base ease-standard flex flex-col items-start rounded-xl border text-left transition-colors',
                    allFocusSelected
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-950'
                      : 'border-border hover:bg-surface-raised',
                  )}
                >
                  <Sparkles
                    aria-hidden="true"
                    className={cn(
                      'size-5',
                      allFocusSelected
                        ? 'text-brand-600'
                        : 'text-foreground-tertiary',
                    )}
                  />
                  <span className="font-medium text-body-sm text-foreground">
                    All of the above
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="gap-3 flex flex-col">
          <div className="gap-3 flex">
            {step > 0 && (
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={back}
              >
                Back
              </Button>
            )}
            <Button
              size="lg"
              className="flex-1"
              onClick={next}
              disabled={!canContinue || saving}
            >
              {saving
                ? 'Saving…'
                : step < STEP_COUNT - 1
                  ? 'Continue'
                  : 'Continue to LifyQ'}
            </Button>
          </div>
          {step < STEP_COUNT - 1 && (
            <Button
              variant="ghost"
              className="w-full"
              disabled={saving}
              onClick={() => void finish()}
            >
              Skip remaining steps
            </Button>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
