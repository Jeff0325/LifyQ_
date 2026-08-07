import { supabase } from '@/lib/supabase';
import type { FocusArea } from '@/stores/useOnboardingStore';

/**
 * Profile/settings/plan are one-row-per-user config, not a collection —
 * deliberately not forced through the `Repository<T,C,U>` list/get/create/
 * update/remove shape every domain module uses. The `handle_new_user`
 * trigger (see the schema migration) creates all three rows the instant a
 * user signs up, so every function here is an upsert against an
 * already-existing row, never a first insert.
 */

export interface ProfileRow {
  firstName: string;
  lastName: string;
  displayName: string;
  dateOfBirth: string;
  gender: string;
  timeZone: string;
  country: string;
  preferredLanguage: string;
  email: string;
}

export interface UserSettingsRow {
  workStart: string;
  workEnd: string;
  wakeUpTime: string;
  bedTime: string;
  firstDayOfWeek: 'monday' | 'sunday';
  heightCm: string;
  weightKg: string;
  bloodType: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  notificationsEnabled: boolean;
  jarvisVoiceEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  defaultCalendarView: 'day' | 'week' | 'month' | 'agenda';
  focusAreas: FocusArea[];
  onboardingCompleted: boolean;
}

export interface AccountPlanRow {
  plan: 'free' | 'premium';
  billingCycle: 'monthly' | 'yearly' | null;
  currentPeriodEnd: string | null;
}

export async function fetchAccountBundle(userId: string): Promise<{
  profile: ProfileRow;
  settings: UserSettingsRow;
  plan: AccountPlanRow;
}> {
  const [profileRes, settingsRes, planRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('user_settings').select('*').eq('user_id', userId).single(),
    supabase.from('account_plans').select('*').eq('user_id', userId).single(),
  ]);
  if (profileRes.error) throw profileRes.error;
  if (settingsRes.error) throw settingsRes.error;
  if (planRes.error) throw planRes.error;

  const p = profileRes.data;
  const s = settingsRes.data;
  const a = planRes.data;

  return {
    profile: {
      firstName: p.first_name,
      lastName: p.last_name,
      displayName: p.display_name,
      dateOfBirth: p.date_of_birth ?? '',
      gender: p.gender,
      timeZone: p.time_zone,
      country: p.country,
      preferredLanguage: p.preferred_language,
      email: p.email ?? '',
    },
    settings: {
      workStart: s.work_start,
      workEnd: s.work_end,
      wakeUpTime: s.wake_up_time,
      bedTime: s.bed_time,
      firstDayOfWeek: s.first_day_of_week,
      heightCm: s.height_cm,
      weightKg: s.weight_kg,
      bloodType: s.blood_type,
      emergencyContactName: s.emergency_contact_name,
      emergencyContactPhone: s.emergency_contact_phone,
      notificationsEnabled: s.notifications_enabled,
      jarvisVoiceEnabled: s.jarvis_voice_enabled,
      theme: s.theme,
      defaultCalendarView: s.default_calendar_view,
      focusAreas: (s.focus_areas as FocusArea[] | null) ?? [],
      onboardingCompleted: s.onboarding_completed,
    },
    plan: {
      plan: a.plan,
      billingCycle: a.billing_cycle,
      currentPeriodEnd: a.current_period_end,
    },
  };
}

export async function saveOnboarding(
  userId: string,
  profile: Omit<ProfileRow, 'email'>,
  settings: Omit<UserSettingsRow, 'onboardingCompleted'>,
): Promise<void> {
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      first_name: profile.firstName,
      last_name: profile.lastName,
      display_name: profile.displayName,
      date_of_birth: profile.dateOfBirth || null,
      gender: profile.gender,
      time_zone: profile.timeZone,
      country: profile.country,
      preferred_language: profile.preferredLanguage,
    })
    .eq('id', userId);
  if (profileError) throw profileError;

  const { error: settingsError } = await supabase
    .from('user_settings')
    .update({
      work_start: settings.workStart,
      work_end: settings.workEnd,
      wake_up_time: settings.wakeUpTime,
      bed_time: settings.bedTime,
      first_day_of_week: settings.firstDayOfWeek,
      height_cm: settings.heightCm,
      weight_kg: settings.weightKg,
      blood_type: settings.bloodType,
      emergency_contact_name: settings.emergencyContactName,
      emergency_contact_phone: settings.emergencyContactPhone,
      notifications_enabled: settings.notificationsEnabled,
      jarvis_voice_enabled: settings.jarvisVoiceEnabled,
      theme: settings.theme,
      default_calendar_view: settings.defaultCalendarView,
      focus_areas: settings.focusAreas,
      onboarding_completed: true,
    })
    .eq('user_id', userId);
  if (settingsError) throw settingsError;
}

export async function updateProfileName(
  userId: string,
  name: { firstName?: string; lastName?: string; displayName?: string },
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...(name.firstName !== undefined && { first_name: name.firstName }),
      ...(name.lastName !== undefined && { last_name: name.lastName }),
      ...(name.displayName !== undefined && {
        display_name: name.displayName,
      }),
    })
    .eq('id', userId);
  if (error) throw error;
}
