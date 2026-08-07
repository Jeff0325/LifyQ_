import { BrandMark } from '@/components/shared/BrandMark';

/** The assistant's "thinking" loading state. */
export function TypingIndicator() {
  return (
    <div
      className="gap-2 flex items-end"
      role="status"
      aria-label="Assistant is typing"
    >
      <div className="mb-0.5 shrink-0">
        <BrandMark className="size-6" />
      </div>
      <div className="gap-1 px-4 py-3 flex items-center rounded-2xl rounded-bl-md bg-surface-raised">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce rounded-full bg-foreground-tertiary"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
