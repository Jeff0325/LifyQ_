import { z } from 'zod';

import type { BaseEntity } from '@/data/types';

export interface CalendarEvent extends BaseEntity {
  title: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  /** HH:mm, 24h. Absent → all-day. */
  startTime?: string;
  endTime?: string;
  location?: string;
}

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(140),
    date: z.string().min(1, 'Date is required'),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    location: z.string().trim().max(140).optional(),
  })
  .refine(
    (values) =>
      !values.startTime || !values.endTime || values.endTime > values.startTime,
    { message: 'End time must be after start time', path: ['endTime'] },
  );

export type EventFormValues = z.infer<typeof eventFormSchema>;
export type CreateEventInput = EventFormValues;
export type UpdateEventInput = Partial<EventFormValues>;
