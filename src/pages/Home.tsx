import { useState } from 'react';

import { PageContainer } from '@/components/shared/PageContainer';
import { FadeIn } from '@/components/shared/motion';
import {
  DayAttentionSection,
  DayFocusSection,
  HealthHabitsSection,
  TodaysAnalyticsSection,
  WeekStrip,
  WelcomeSection,
} from '@/features/dashboard';
import { todayIso } from '@/lib/date';

function weekdayLabel(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
  });
}

/**
 * The personal-operating-system home screen — "what's happening on this
 * date," a daily planner rather than a static dashboard. `WeekStrip` picks
 * the date; everything below it (`DayFocusSection`/`DayAttentionSection`)
 * re-derives from that single selection, so nothing is ever shown twice.
 * Jarvis itself doesn't live here — it stays reachable through the bottom
 * nav's center button (docs/06 §5); Home is for awareness/planning, Jarvis
 * is for interaction. No catch-all "see everything" module grid below it
 * either — every domain already has its own full page reachable from nav;
 * Home stays a focused daily planner, not a second index of the app.
 */
export function Home() {
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const dateLabel = weekdayLabel(selectedDate);

  return (
    <PageContainer
      size="lg"
      className="gap-9 py-2 sm:gap-11 sm:py-4 flex flex-col"
    >
      <FadeIn>
        <WelcomeSection />
      </FadeIn>

      <FadeIn delay={0.05}>
        <WeekStrip selectedDate={selectedDate} onSelect={setSelectedDate} />
      </FadeIn>

      <FadeIn key={`${selectedDate}-focus`} delay={0.05}>
        <DayFocusSection date={selectedDate} dateLabel={dateLabel} />
      </FadeIn>

      <FadeIn key={`${selectedDate}-attention`} delay={0.1}>
        <DayAttentionSection date={selectedDate} dateLabel={dateLabel} />
      </FadeIn>

      {/* Always "today," independent of the week strip's selected date —
          daily well-being and a day-in-progress summary, not a preview of
          another day. */}
      <FadeIn delay={0.15}>
        <HealthHabitsSection />
      </FadeIn>

      <FadeIn delay={0.2}>
        <TodaysAnalyticsSection />
      </FadeIn>
    </PageContainer>
  );
}
