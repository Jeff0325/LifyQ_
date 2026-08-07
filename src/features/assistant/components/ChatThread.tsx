import { Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { FadeIn } from '@/components/shared/motion';
import { MessageBubble } from '@/features/assistant/components/MessageBubble';
import { SuggestedPrompts } from '@/features/assistant/components/SuggestedPrompts';
import { TypingIndicator } from '@/features/assistant/components/TypingIndicator';
import type { ChatMessage } from '@/features/assistant/types';

export interface ChatThreadProps {
  messages: ChatMessage[];
  isThinking: boolean;
  error: boolean;
  onSelectPrompt: (prompt: string) => void;
}

export function ChatThread({
  messages,
  isThinking,
  error,
  onSelectPrompt,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isThinking]);

  if (messages.length === 0) {
    return (
      <div className="gap-4 py-10 flex flex-1 flex-col items-center justify-center text-center">
        <div className="size-14 flex items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950">
          <Sparkles
            aria-hidden="true"
            className="size-7 text-brand-600 dark:text-brand-400"
          />
        </div>
        <div className="gap-1.5 flex flex-col">
          <h2 className="font-semibold text-h3 text-foreground">
            Ask me anything
          </h2>
          <p className="max-w-sm text-body-sm text-foreground-secondary">
            I can look across your tasks, goals, habits, and calendar to help
            you plan your day.
          </p>
        </div>
        <SuggestedPrompts onSelect={onSelectPrompt} />
      </div>
    );
  }

  return (
    <div className="gap-4 py-4 flex flex-1 flex-col">
      {messages.map((message) => (
        <FadeIn key={message.id}>
          <MessageBubble message={message} />
        </FadeIn>
      ))}
      {isThinking && <TypingIndicator />}
      {error && (
        <p role="alert" className="text-body-sm text-danger">
          Something went wrong. Please try again.
        </p>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
