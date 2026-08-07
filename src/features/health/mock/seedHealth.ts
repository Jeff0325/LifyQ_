import type {
  Allergy,
  HealthEvent,
  Medicine,
  VitalReading,
} from '@/features/health/types';

function timestamp(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

function isoDate(offsetDays: number): string {
  return timestamp(offsetDays).slice(0, 10);
}

export function seedMedicines(): Medicine[] {
  return [
    {
      id: crypto.randomUUID(),
      name: 'Loratadine',
      dosage: '10mg, once daily',
      prescribedBy: 'Dr. Chen',
      expiresAt: isoDate(45),
      refillReminderAt: isoDate(30),
      createdAt: timestamp(-90),
      updatedAt: timestamp(-90),
    },
    {
      id: crypto.randomUUID(),
      name: 'Vitamin D3',
      dosage: '2000 IU, once daily',
      expiresAt: isoDate(300),
      createdAt: timestamp(-90),
      updatedAt: timestamp(-90),
    },
  ];
}

export function seedHealthEvents(): HealthEvent[] {
  return [
    {
      id: crypto.randomUUID(),
      type: 'doctor_visit',
      title: 'Annual physical',
      date: isoDate(-20),
      provider: 'Dr. Chen',
      notes: 'Bloodwork normal, follow up in a year.',
      createdAt: timestamp(-20),
      updatedAt: timestamp(-20),
    },
    {
      id: crypto.randomUUID(),
      type: 'vaccination',
      title: 'Flu shot',
      date: isoDate(-60),
      provider: 'City Pharmacy',
      nextDueDate: isoDate(305),
      createdAt: timestamp(-60),
      updatedAt: timestamp(-60),
    },
  ];
}

export function seedVitals(): VitalReading[] {
  return [
    {
      id: crypto.randomUUID(),
      type: 'blood_pressure',
      date: isoDate(-2),
      systolic: 118,
      diastolic: 76,
      unit: 'mmHg',
      createdAt: timestamp(-2),
      updatedAt: timestamp(-2),
    },
    {
      id: crypto.randomUUID(),
      type: 'weight',
      date: isoDate(-2),
      value: 72.5,
      unit: 'kg',
      createdAt: timestamp(-2),
      updatedAt: timestamp(-2),
    },
  ];
}

export function seedAllergies(): Allergy[] {
  return [
    {
      id: crypto.randomUUID(),
      name: 'Penicillin',
      severity: 'severe',
      createdAt: timestamp(-400),
      updatedAt: timestamp(-400),
    },
    {
      id: crypto.randomUUID(),
      name: 'Pollen',
      severity: 'mild',
      notes: 'Seasonal, worse in spring.',
      createdAt: timestamp(-400),
      updatedAt: timestamp(-400),
    },
  ];
}
