import {
  Camera,
  FileText,
  Image as ImageIcon,
  Mail,
  Maximize2,
  Mic,
  Minimize2,
  Minus,
  Paperclip,
  Send,
  Share2,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { CaptureConfirmSheet } from '@/features/assistant/components/CaptureConfirmSheet';
import { ChatThread } from '@/features/assistant/components/ChatThread';
import { JarvisListening } from '@/features/assistant/components/JarvisListening';
import type {
  ConversationPhase,
  useConversationManager,
} from '@/features/assistant/hooks/useConversationManager';
import { useSpeechRecognition } from '@/features/assistant/ice/useSpeechRecognition';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { useJarvisStore } from '@/stores/useJarvisStore';

export interface JarvisPanelProps {
  conversation: ReturnType<typeof useConversationManager>;
}

const PHASE_DOT_CLASS: Record<ConversationPhase, string> = {
  idle: 'bg-foreground-tertiary',
  listening: 'bg-brand-600 animate-pulse',
  understanding: 'bg-brand-600 animate-pulse',
  thinking: 'bg-brand-600 animate-pulse',
  speaking: 'bg-brand-600 animate-pulse',
  ready: 'bg-brand-600',
};

/**
 * The expanded conversation surface — a hand-rolled `fixed` overlay,
 * deliberately not `ResponsiveFormSheet` (see prior docs on why). Desktop
 * (`lg:+`) is a right-docked, full-height glass drawer; mobile keeps its
 * bottom-sheet sizing. Full-screen mode is a plain, instant CSS class
 * toggle — no `transition-*` (animated versions get stuck mid-transition
 * in this test harness).
 */
export function JarvisPanel({ conversation }: JarvisPanelProps) {
  const [value, setValue] = useState('');
  const navigate = useNavigate();
  const panelState = useJarvisStore((state) => state.panelState);
  const minimizePanel = useJarvisStore((state) => state.minimizePanel);
  const startListening = useJarvisStore((state) => state.startListening);
  const isFullscreen = useJarvisStore((state) => state.isFullscreen);
  const toggleFullscreen = useJarvisStore((state) => state.toggleFullscreen);
  const voiceEnabled = useJarvisStore((state) => state.voiceEnabled);
  const toggleVoice = useJarvisStore((state) => state.toggleVoice);
  const speech = useSpeechRecognition();
  const { toast } = useToast();
  const {
    messages,
    phase,
    isThinking,
    isStreaming,
    isInitializing,
    error,
    capture,
    suggestions,
    dismissCapture,
    sendMessage,
    reportCompletion,
  } = conversation;
  const isListening = panelState === 'listening';
  const isBusy = isThinking || isStreaming;

  const handleSubmit = () => {
    const text = value.trim();
    if (!text || isBusy) return;
    setValue('');
    void sendMessage(text, 'text');
  };

  const handleMicClick = () => {
    if (!speech.isSupported) {
      toast({
        variant: 'danger',
        title: 'Voice input is not supported in this browser',
        description: 'Type instead — everything voice can do, typing can too.',
      });
      return;
    }
    startListening();
    speech.start();
  };

  const stubSource = (label: string) => {
    toast({
      title: `${label} capture is coming in a later phase`,
      description: 'Typed and spoken capture are fully working today.',
    });
  };

  return (
    <>
      <div
        role="dialog"
        aria-label="Jarvis"
        className={cn(
          'backdrop-blur-2xl fixed z-50 flex flex-col overflow-hidden border border-border bg-surface-overlay/95 shadow-elevation-4',
          isFullscreen
            ? 'inset-0 h-full w-full rounded-none'
            : cn(
                'inset-x-0 bottom-0 rounded-t-3xl h-[85dvh]',
                'lg:inset-x-auto lg:inset-y-4 lg:right-4 lg:bottom-auto lg:left-auto lg:h-[calc(100%-2rem)] lg:w-full lg:max-w-md lg:rounded-2xl lg:border-l',
              ),
        )}
      >
        <header className="px-4 py-3 flex shrink-0 items-center justify-between border-b border-border">
          <div className="gap-2 flex items-center">
            <span
              aria-hidden="true"
              className={cn('size-2 rounded-full', PHASE_DOT_CLASS[phase])}
            />
            <div className="flex flex-col">
              <span className="font-semibold text-body text-foreground">
                Jarvis
              </span>
              <span className="font-medium tracking-wide text-[10px] text-foreground-tertiary uppercase">
                Personal Assistant
              </span>
            </div>
          </div>
          <div className="gap-1 flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleVoice}
              aria-label={
                voiceEnabled
                  ? 'Turn off voice replies'
                  : 'Turn on voice replies'
              }
            >
              {voiceEnabled ? (
                <Volume2 aria-hidden="true" />
              ) : (
                <VolumeX aria-hidden="true" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              aria-label={
                isFullscreen ? 'Exit full screen' : 'Full screen conversation'
              }
            >
              {isFullscreen ? (
                <Minimize2 aria-hidden="true" />
              ) : (
                <Maximize2 aria-hidden="true" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={minimizePanel}
              aria-label="Minimize Jarvis"
            >
              <Minus aria-hidden="true" />
            </Button>
          </div>
        </header>

        <div className="min-h-0 px-4 flex flex-1 flex-col overflow-y-auto">
          {isListening ? (
            <JarvisListening
              speech={speech}
              onDone={(text) => {
                if (text.trim()) void sendMessage(text, 'voice');
              }}
            />
          ) : isInitializing ? (
            <div className="gap-3 py-10 flex flex-1 flex-col items-center justify-center text-center">
              <div className="size-12 flex items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950">
                <Sparkles
                  aria-hidden="true"
                  className="size-6 animate-pulse text-brand-600 dark:text-brand-400"
                />
              </div>
              <p className="font-medium tracking-wide text-body-sm text-foreground-tertiary uppercase">
                Initializing Jarvis…
              </p>
            </div>
          ) : (
            <>
              <ChatThread
                messages={messages}
                isThinking={isThinking}
                error={error}
                onSelectPrompt={(prompt) => void sendMessage(prompt, 'text')}
              />
              {!isBusy && suggestions.length > 0 && (
                <div className="gap-2 pb-3 -mx-4 px-4 flex overflow-x-auto">
                  {suggestions.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        if (chip.kind === 'ask' && chip.prompt) {
                          void sendMessage(chip.prompt, 'text');
                        } else if (chip.kind === 'open' && chip.route) {
                          navigate(chip.route);
                          minimizePanel();
                        }
                      }}
                      className="px-3 py-1.5 duration-base ease-standard shrink-0 rounded-full border border-border bg-surface text-body-sm whitespace-nowrap text-foreground-secondary transition-colors hover:border-brand-600 hover:text-brand-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {!isListening && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
            className="gap-2 px-4 pt-3 flex shrink-0 items-center border-t border-border pb-[max(env(safe-area-inset-bottom),0.75rem)]"
          >
            <Input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Ask Jarvis anything..."
              aria-label="Ask Jarvis anything"
              disabled={isBusy}
              className="flex-1"
            />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={handleMicClick}
              disabled={isBusy}
              aria-label="Start voice mode"
            >
              <Mic aria-hidden="true" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  aria-label="Attach"
                >
                  <Paperclip aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => stubSource('Camera')}>
                  <Camera aria-hidden="true" className="size-4" />
                  Scan with camera
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => stubSource('Photo')}>
                  <ImageIcon aria-hidden="true" className="size-4" />
                  Attach a photo
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => stubSource('PDF')}>
                  <FileText aria-hidden="true" className="size-4" />
                  Upload a PDF
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => stubSource('Email')}>
                  <Mail aria-hidden="true" className="size-4" />
                  Forward an email
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => stubSource('Shared content')}>
                  <Share2 aria-hidden="true" className="size-4" />
                  Shared content
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              type="submit"
              size="icon"
              disabled={isBusy || !value.trim()}
              aria-label="Send to Jarvis"
            >
              <Send aria-hidden="true" />
            </Button>
          </form>
        )}
      </div>

      <CaptureConfirmSheet
        capture={capture}
        onClose={dismissCapture}
        onSaved={reportCompletion}
      />
    </>
  );
}
