import { billsRepository } from '@/features/bills/repository';
import { eventsRepository } from '@/features/calendar/repository';
import { buildUrgencyFeed } from '@/features/dashboard/utils';
import { medicinesRepository } from '@/features/health/repository';
import { lifeRecordsRepository } from '@/features/life-records/repository';
import { remindersRepository } from '@/features/reminders/repository';
import { subscriptionsRepository } from '@/features/subscriptions/repository';
import { tasksRepository } from '@/features/tasks/repository';

/**
 * One grounded "worth knowing beyond today" sentence, reusing the exact
 * urgency feed the Dashboard already builds from — no new data source, no
 * invented information. Returns null when nothing qualifies.
 */
export async function generateProactiveInsight(): Promise<string | null> {
  const [
    tasks,
    events,
    reminders,
    bills,
    medicines,
    lifeRecords,
    subscriptions,
  ] = await Promise.all([
    tasksRepository.list(),
    eventsRepository.list(),
    remindersRepository.list(),
    billsRepository.list(),
    medicinesRepository.list(),
    lifeRecordsRepository.list(),
    subscriptionsRepository.list(),
  ]);

  const feed = buildUrgencyFeed({
    tasks,
    events,
    reminders,
    bills,
    medicines,
    lifeRecords,
    subscriptions,
  });
  const upcoming = feed.find((item) => item.severity === 'upcoming');
  if (!upcoming) return null;

  return `One more thing worth knowing — your ${upcoming.domain.toLowerCase()} "${upcoming.title}" is ${upcoming.subtitle.toLowerCase()}. Nothing urgent, just good to have on your radar.`;
}
