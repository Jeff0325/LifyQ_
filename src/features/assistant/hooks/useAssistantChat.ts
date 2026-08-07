import { useCallback, useState } from 'react';

import { answerCrossDomain } from '@/features/assistant/context-engine/mockContextEngine';
import { mockICEEngine } from '@/features/assistant/ice/mockICEEngine';
import type { ChatMessage } from '@/features/assistant/types';

/**
 * Owns the conversation array + "thinking" state and calls whichever
 * `AIProvider` is wired up — today `mockICEEngine`, later a real one, with
 * no change to this hook's callers. Conversation state is intentionally
 * local (`useState`), not persisted — a real thread history is a
 * Phase 4/backend concern, not frontend state management.
 *
 * Tries the Context Engine first (docs/38_Context_Engine.md) — a cheap
 * regex check with no repository read unless a cross-domain question
 * actually matches. `null` means single-domain, and falls through to the
 * exact same `converse()` path this hook already used, unchanged speed
 * (docs/38 §2's explicit requirement).
 */
export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState(false);

  const send = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [...current, userMessage]);
      setIsThinking(true);
      setError(false);

      try {
        const crossDomainAnswer = await answerCrossDomain(trimmed);
        const reply =
          crossDomainAnswer ??
          (await mockICEEngine.converse([...messages, userMessage], trimmed));
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: reply,
          createdAt: new Date().toISOString(),
        };
        setMessages((current) => [...current, assistantMessage]);
      } catch {
        setError(true);
      } finally {
        setIsThinking(false);
      }
    },
    [messages],
  );

  const reset = useCallback(() => {
    setMessages([]);
    setError(false);
  }, []);

  return { messages, isThinking, error, send, reset };
}
