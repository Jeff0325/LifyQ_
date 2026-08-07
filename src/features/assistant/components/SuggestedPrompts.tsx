const PROMPTS = [
  "What's on my schedule today?",
  'What bills are due this week?',
  'When does my passport expire?',
  'Add coffee, eggs, and milk to my grocery list.',
];

export interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function SuggestedPrompts({
  onSelect,
  disabled,
}: SuggestedPromptsProps) {
  return (
    <div className="gap-2 px-4 -mx-4 flex max-w-full overflow-x-auto">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(prompt)}
          className="px-3 py-1.5 duration-base ease-standard shrink-0 rounded-full border border-border bg-surface text-body-sm whitespace-nowrap text-foreground-secondary transition-colors hover:border-brand-600 hover:text-brand-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
