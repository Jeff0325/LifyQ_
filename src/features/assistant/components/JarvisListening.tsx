import { Mic, Square } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { JARVIS_GRADIENT_CLASS } from '@/constants/moduleColors';
import type { UseSpeechRecognitionResult } from '@/features/assistant/ice/useSpeechRecognition';
import { cn } from '@/lib/utils';
import { useJarvisStore } from '@/stores/useJarvisStore';

export interface JarvisListeningProps {
  speech: UseSpeechRecognitionResult;
  onDone: (text: string) => void;
}

const PULSE_RINGS = [0, 1, 2];

/**
 * A dedicated takeover of `JarvisPanel`'s body while `panelState ===
 * 'listening'` — docs/39 addendum's Voice Mode requirement for a clearly
 * distinct listening surface, not just a mic icon changing color inline.
 * Ending listening (button press or the browser's own silence timeout)
 * both funnel through the same `speech.isListening` transition below, so
 * there's exactly one "listening stopped" path.
 */
export function JarvisListening({ speech, onDone }: JarvisListeningProps) {
  const stopListening = useJarvisStore((state) => state.stopListening);

  useEffect(() => {
    if (!speech.isListening) {
      stopListening();
      onDone(speech.transcript);
    }
    // Only re-run when isListening flips — the transcript is read from the
    // closure at that moment, not on every interim-result keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.isListening]);

  return (
    <div className="gap-6 py-10 flex flex-1 flex-col items-center justify-center text-center">
      <div className="size-24 relative flex items-center justify-center">
        {PULSE_RINGS.map((ring) => (
          <motion.span
            key={ring}
            className="absolute size-full rounded-full bg-brand-600/25"
            initial={{ scale: 0.6, opacity: 0.6 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: ring * 0.5,
              ease: 'easeOut',
            }}
          />
        ))}
        <div
          className={cn(
            'size-16 relative flex items-center justify-center rounded-full text-foreground-on-brand',
            JARVIS_GRADIENT_CLASS,
          )}
        >
          <Mic aria-hidden="true" className="size-7" />
        </div>
      </div>

      <div className="gap-1 flex flex-col">
        <p className="font-medium text-body text-foreground">Listening…</p>
        <p className="max-w-xs text-body-sm text-foreground-secondary">
          {speech.transcript || "Say something — I'm listening."}
        </p>
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={speech.stop}
        className="gap-2"
      >
        <Square aria-hidden="true" className="size-4" />
        Stop
      </Button>
    </div>
  );
}
