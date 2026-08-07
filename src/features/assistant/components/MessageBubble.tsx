import { BrandMark } from '@/components/shared/BrandMark';
import type { ChatMessage } from '@/features/assistant/types';
import { cn } from '@/lib/utils';

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'gap-2 flex items-end',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {!isUser && (
        <div className="mb-0.5 shrink-0">
          <BrandMark className="size-6" />
        </div>
      )}
      <div
        className={cn(
          'px-4 py-2.5 max-w-[80%] rounded-2xl text-body-sm whitespace-pre-line',
          isUser
            ? 'rounded-br-md bg-brand-600 text-foreground-on-brand'
            : 'rounded-bl-md bg-surface-raised text-foreground',
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
