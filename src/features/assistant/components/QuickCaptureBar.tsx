import {
  Camera,
  FileText,
  Image as ImageIcon,
  Mail,
  Mic,
  MicOff,
  Send,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { CaptureConfirmSheet } from '@/features/assistant/components/CaptureConfirmSheet';
import { useCapture } from '@/features/assistant/hooks/useCapture';
import { useSpeechRecognition } from '@/features/assistant/ice/useSpeechRecognition';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { useJarvisStore } from '@/stores/useJarvisStore';

export interface QuickCaptureBarProps {
  className?: string;
  /** A shorter placeholder for tight spaces (e.g. the global AppShell bar) vs. Home's elevated, full-width placement. */
  compact?: boolean;
}

/**
 * An inline ICE entry point elevated on the redesigned Home (docs/37 §4) —
 * a quick-capture-only surface, distinct from the global floating Jarvis
 * companion (`JarvisRoot`, docs/39 addendum) reachable from `TopBar`,
 * `BottomNav`, and `Sidebar`. Voice and text are equally prominent, never
 * one gated behind the other (docs/36_UX_Philosophy.md §5). Camera/image/
 * PDF/email are visible, reachable, non-functional stubs this phase
 * (docs/35 §2). A query-shaped input (not a capture) hands off to the
 * floating companion via `useJarvisStore.queuePendingQuery` rather than
 * answering inline — this component doesn't own conversation state.
 */
export function QuickCaptureBar({ className, compact }: QuickCaptureBarProps) {
  const [value, setValue] = useState('');
  const { capture, isExtracting, submit, dismiss } = useCapture();
  const speech = useSpeechRecognition();
  const queuePendingQuery = useJarvisStore((state) => state.queuePendingQuery);
  const { toast } = useToast();

  useEffect(() => {
    if (speech.error) toast({ variant: 'danger', title: speech.error });
  }, [speech.error, toast]);

  // While listening, the field shows the live transcript directly rather
  // than mirroring it into `value` via an effect — an effect that calls
  // setState synchronously on every transcript tick is exactly the pattern
  // this codebase's lint config forbids (react-hooks/set-state-in-effect).
  // `value` only needs to actually hold the recognized text once listening
  // stops, which `handleMicClick` sets directly from the same closure.
  const displayValue = speech.isListening ? speech.transcript : value;

  const handleSubmit = async () => {
    const text = displayValue.trim();
    if (!text || isExtracting) return;
    setValue('');
    const { isQuery } = await submit(
      text,
      speech.isListening ? 'voice' : 'text',
    );
    if (isQuery) {
      queuePendingQuery(text);
    }
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
    if (speech.isListening) {
      speech.stop();
      setValue(speech.transcript);
    } else {
      setValue('');
      speech.start();
    }
  };

  const stubSource = (label: string) => {
    toast({
      title: `${label} capture is coming in a later phase`,
      description: 'Typed and spoken capture are fully working today.',
    });
  };

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
        onPaste={(event) => {
          const pasted = event.clipboardData.getData('text');
          if (pasted) setValue(pasted);
        }}
        className={cn('gap-2 flex items-center', className)}
      >
        <Input
          value={displayValue}
          onChange={(event) => setValue(event.target.value)}
          placeholder={
            compact
              ? 'Tell Jarvis anything…'
              : '"Buy coffee tomorrow", "electricity bill due the 15th"…'
          }
          aria-label="Tell Jarvis anything"
          disabled={isExtracting || speech.isListening}
          className="flex-1"
        />
        <Button
          type="button"
          size="icon"
          variant={speech.isListening ? 'primary' : 'secondary'}
          onClick={handleMicClick}
          disabled={isExtracting}
          aria-label={
            speech.isListening ? 'Stop voice input' : 'Start voice input'
          }
        >
          {speech.isListening ? (
            <MicOff aria-hidden="true" />
          ) : (
            <Mic aria-hidden="true" />
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              aria-label="More capture sources"
            >
              <Camera aria-hidden="true" />
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
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          type="submit"
          size="icon"
          disabled={isExtracting || !displayValue.trim()}
          aria-label="Send to Jarvis"
        >
          <Send aria-hidden="true" />
        </Button>
      </form>

      <CaptureConfirmSheet capture={capture} onClose={dismiss} />
    </>
  );
}
