import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseSpeechSynthesisResult {
  isSupported: boolean;
  isSpeaking: boolean;
  speak: (text: string) => void;
  stop: () => void;
  error: string | null;
}

/**
 * A thin wrapper around the browser-native `speechSynthesis` API, mirroring
 * `useSpeechRecognition`'s shape (`src/features/assistant/ice/useSpeechRecognition.ts`)
 * on purpose — same "genuinely functional browser capability, not a mocked
 * AI call" reasoning (docs/35_Intelligent_Capture_Engine_Spec.md §2)
 * applies to text-to-speech as it does to speech-to-text.
 *
 * `speak()` cancels any in-flight utterance before starting a new one —
 * Jarvis's replies are spoken every time (confirmed product decision), so a
 * rapid back-and-forth conversation must not queue several utterances and
 * play them back-to-back long after the exchange moved on.
 */
export function useSpeechSynthesis(): UseSpeechSynthesisResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Stop any in-flight speech on unmount (e.g. minimizing mid-reply) rather
  // than leaving audio playing after the panel is gone.
  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) {
        setError('Voice replies are not supported in this browser.');
        return;
      }
      setError(null);
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        setError(event.error || 'Voice reply failed.');
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported],
  );

  const stop = useCallback(() => {
    if (isSupported) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { isSupported, isSpeaking, speak, stop, error };
}
