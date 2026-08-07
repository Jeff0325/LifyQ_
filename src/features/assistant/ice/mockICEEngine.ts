import { extractMock } from '@/features/assistant/ice/extractionRules';
import { converseMock } from '@/features/assistant/mock/mockAssistantEngine';
import type { AIProvider } from '@/features/assistant/types';

/**
 * The mock-phase `AIProvider` — docs/34_AI_Architecture.md §5. Composes the
 * two independently-built halves (`converseMock` for freeform chat,
 * `extractMock` for structured capture) into one object satisfying the
 * interface a real vendor implementation (Phase 5) will satisfy identically.
 * Neither half needs to know about the other.
 */
export const mockICEEngine: AIProvider = {
  converse: converseMock,
  extract: extractMock,
};
