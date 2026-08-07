import { timeOfDayGreeting } from '@/features/dashboard/utils';
import { useProfileStore } from '@/features/settings/store';

export function WelcomeSection() {
  const firstName =
    useProfileStore((state) => state.name.split(' ')[0]) || 'there';
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="gap-1.5 flex flex-col">
      <h1 className="font-semibold tracking-tight text-display text-foreground">
        {timeOfDayGreeting()}, {firstName}.
      </h1>
      <p className="text-body text-foreground-tertiary">{today}</p>
    </div>
  );
}
