import type { FocusArea } from '@/stores/useOnboardingStore';

const FOCUS_AREA_PHRASE: Record<FocusArea, string> = {
  productivity: 'staying productive',
  health: 'your health',
  finance: 'your finances',
  habits: 'building habits',
  'personal-organization': 'keeping everything organized',
};

function focusAreasSentence(focusAreas: FocusArea[]): string {
  if (focusAreas.length === 0) return '';
  const phrases = focusAreas.map((a) => FOCUS_AREA_PHRASE[a]);
  const joined =
    phrases.length === 1
      ? phrases[0]!
      : `${phrases.slice(0, -1).join(', ')} and ${phrases[phrases.length - 1]}`;
  return ` From what you told me during setup, I'll pay extra attention to ${joined}.`;
}

/** Typed once into the chat thread — the very first time the user ever
 * opens Jarvis (`hasSeenIntro` false). Every open after this uses a short
 * contextual greeting instead (see `useConversationManager`). Takes the
 * focus areas chosen during First-Time Setup so the greeting reflects
 * what the user actually said they wanted help with, never invented. */
export function buildOnboardingGreeting(focusAreas: FocusArea[] = []): string {
  return (
    "Hello, I'm Jarvis. Welcome to LifyQ. I'm here to help you stay organized, keep track of what matters, and make everyday life a little easier. " +
    'I can help you manage your schedule, reminders, bills, subscriptions, groceries, medicines, life records, finances, projects, and more.' +
    focusAreasSentence(focusAreas) +
    " You don't need to think about which feature to open. Just tell me what you need. " +
    'What can I help you with today?'
  );
}
