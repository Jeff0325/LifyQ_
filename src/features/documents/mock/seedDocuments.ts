import type { AppDocument } from '@/features/documents/types';

function timestamp(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

export function seedDocuments(): AppDocument[] {
  const base = (
    overrides: Partial<AppDocument> &
      Pick<AppDocument, 'fileName' | 'fileType' | 'category'>,
  ): AppDocument =>
    ({
      id: crypto.randomUUID(),
      sizeBytes: 0,
      url: '',
      tags: '',
      createdAt: timestamp(-40),
      updatedAt: timestamp(-40),
      ...overrides,
    }) as AppDocument;

  return [
    base({
      fileName: 'Apartment lease.pdf',
      fileType: 'application/pdf',
      category: 'contract',
      sizeBytes: 245_000,
      tags: 'lease, home',
    }),
    base({
      fileName: 'Q2 tax return.pdf',
      fileType: 'application/pdf',
      category: 'tax',
      sizeBytes: 512_000,
      tags: 'tax, 2026',
    }),
    base({
      fileName: 'Laptop receipt.jpg',
      fileType: 'image/jpeg',
      category: 'receipt',
      sizeBytes: 88_000,
      tags: 'electronics',
    }),
    base({
      fileName: 'Diploma.pdf',
      fileType: 'application/pdf',
      category: 'certificate',
      sizeBytes: 190_000,
    }),
  ];
}
