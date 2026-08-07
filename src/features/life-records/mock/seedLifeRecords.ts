import type { LifeRecord } from '@/features/life-records/types';

function timestamp(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

function isoDate(offsetDays: number): string {
  return timestamp(offsetDays).slice(0, 10);
}

export function seedLifeRecords(): LifeRecord[] {
  const base = (
    overrides: Partial<LifeRecord> & Pick<LifeRecord, 'title' | 'category'>,
  ): LifeRecord =>
    ({
      id: crypto.randomUUID(),
      createdAt: timestamp(-60),
      updatedAt: timestamp(-60),
      ...overrides,
    }) as LifeRecord;

  return [
    base({
      title: 'Passport',
      category: 'passport',
      identifier: 'P1234567',
      issuedAt: isoDate(-1800),
      expiresAt: isoDate(30),
      issuingAuthority: 'Dept. of State',
    }),
    base({
      title: "Driver's License",
      category: 'drivers_license',
      identifier: 'DL-882910',
      issuedAt: isoDate(-900),
      expiresAt: isoDate(400),
      issuingAuthority: 'DMV',
    }),
    base({
      title: 'Auto Insurance Policy',
      category: 'insurance',
      identifier: 'POL-55210',
      expiresAt: isoDate(-5),
      issuingAuthority: 'Statewide Insurance',
    }),
    base({
      title: 'Vehicle Registration',
      category: 'vehicle_registration',
      identifier: 'REG-90211',
      expiresAt: isoDate(120),
      issuingAuthority: 'DMV',
    }),
    base({
      title: 'Gym Membership',
      category: 'membership',
      expiresAt: isoDate(200),
      issuingAuthority: 'City Fitness',
    }),
  ];
}
