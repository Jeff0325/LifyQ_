/** Shared date helpers — every feature that needs "today" as an ISO date uses these instead of each reimplementing/duplicating its own. */

/**
 * Formats a `Date` as a local-calendar ISO date (YYYY-MM-DD) — using local
 * getters, not `.toISOString()`. `toISOString()` converts to UTC first,
 * which silently shifts the date by one day for any timezone ahead of UTC
 * whenever the local time is between midnight and the UTC offset (e.g. a
 * UTC+8 user at any time before 8am local sees "today" reported as
 * yesterday's UTC date) — confirmed live during Stage 1 QA of ICE's
 * relative-date resolution ("tomorrow" resolving to today's date). Every
 * caller of this function wants the user's local calendar day, never UTC's.
 */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

const WEEKDAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

/**
 * Resolves a relative-date phrase found anywhere in `text` to an absolute
 * ISO date, or `undefined` if nothing recognizable is present. Used by
 * ICE's extraction rules (docs/35_Intelligent_Capture_Engine_Spec.md §4) so
 * every domain resolves "in two days"/"next weekend"/"every 15th" the same
 * way instead of each rule reimplementing its own date math.
 */
export function resolveRelativeDate(
  text: string,
  reference: Date = new Date(),
): string | undefined {
  const lower = text.toLowerCase();
  const today = new Date(reference);
  today.setHours(0, 0, 0, 0);

  if (/\btoday\b/.test(lower)) return toIsoDate(today);

  if (/\btomorrow\b/.test(lower)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return toIsoDate(d);
  }

  const inDays = lower.match(/\bin (\d+) days?\b/);
  if (inDays) {
    const d = new Date(today);
    d.setDate(d.getDate() + Number(inDays[1]));
    return toIsoDate(d);
  }

  const inWeeks = lower.match(/\bin (\d+) weeks?\b/);
  if (inWeeks) {
    const d = new Date(today);
    d.setDate(d.getDate() + Number(inWeeks[1]) * 7);
    return toIsoDate(d);
  }

  if (/\bnext week\b/.test(lower)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return toIsoDate(d);
  }

  if (/\bnext year\b/.test(lower)) {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() + 1);
    return toIsoDate(d);
  }

  if (/\bthis weekend\b/.test(lower)) {
    const day = today.getDay(); // 0=Sun..6=Sat
    const d = new Date(today);
    d.setDate(d.getDate() + ((6 - day + 7) % 7));
    return toIsoDate(d);
  }

  for (const [i, name] of WEEKDAY_NAMES.entries()) {
    if (new RegExp(`\\b${name}\\b`).test(lower)) {
      const day = today.getDay();
      const delta = (i - day + 7) % 7 || 7; // next occurrence, not today
      const d = new Date(today);
      d.setDate(d.getDate() + delta);
      return toIsoDate(d);
    }
  }

  const everyNth = lower.match(/\bevery (\d{1,2})(st|nd|rd|th)\b/);
  if (everyNth) {
    const dayOfMonth = Number(everyNth[1]);
    const d = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
    if (d < today) d.setMonth(d.getMonth() + 1);
    return toIsoDate(d);
  }

  return undefined;
}

export type RecurrencePhrase = 'daily' | 'weekly' | 'monthly' | 'yearly';

/** Resolves recurrence phrasing ("every 15th", "weekly", "every month") to a shared enum every domain's own recurrence type maps onto. */
export function resolveRecurrencePhrase(
  text: string,
): RecurrencePhrase | undefined {
  const lower = text.toLowerCase();
  if (/\bevery day\b|\bdaily\b/.test(lower)) return 'daily';
  if (/\bevery week\b|\bweekly\b/.test(lower)) return 'weekly';
  if (
    /\bevery (\d{1,2})(st|nd|rd|th)\b|\bevery month\b|\bmonthly\b/.test(lower)
  )
    return 'monthly';
  if (/\bevery year\b|\byearly\b|\bannually\b/.test(lower)) return 'yearly';
  return undefined;
}
