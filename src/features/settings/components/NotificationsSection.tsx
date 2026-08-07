import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useNotificationPrefsStore } from '@/features/settings/store';

const ROWS: {
  key: 'taskReminders' | 'habitReminders' | 'weeklyDigest' | 'productUpdates';
  label: string;
  description: string;
}[] = [
  {
    key: 'taskReminders',
    label: 'Task reminders',
    description: 'Nudges for tasks due today or overdue.',
  },
  {
    key: 'habitReminders',
    label: 'Habit reminders',
    description: "A nudge if today's habit isn't checked off yet.",
  },
  {
    key: 'weeklyDigest',
    label: 'Weekly digest',
    description: 'A Monday summary of the week ahead.',
  },
  {
    key: 'productUpdates',
    label: 'Product updates',
    description: "What's new in LifyQ.",
  },
];

/** UI-only — no delivery mechanism exists yet, per docs/02_Product_Requirements_Document.md §3.8. */
export function NotificationsSection() {
  const prefs = useNotificationPrefsStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent className="gap-4 flex flex-col">
        {ROWS.map((row) => (
          <div
            key={row.key}
            className="gap-3 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-body-sm text-foreground">
                {row.label}
              </p>
              <p className="text-caption text-foreground-tertiary">
                {row.description}
              </p>
            </div>
            <Switch
              checked={prefs[row.key]}
              onCheckedChange={(checked) => prefs.setPref(row.key, checked)}
              aria-label={row.label}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
