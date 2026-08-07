import { useCallback, useRef, useState } from 'react';

export interface UseSpeechRecognitionResult {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  start: () => void;
  stop: () => void;
  error: string | null;
}

/**
 * A thin wrapper around the browser-native Web Speech API
 * (`SpeechRecognition`/`webkitSpeechRecognition`) — genuinely functional,
 * not mocked, since it's a client-side browser capability rather than a
 * real AI provider call (docs/35_Intelligent_Capture_Engine_Spec.md §2).
 *
 * Firefox has no support at all; Safari/iOS is webkit-prefixed and
 * historically inconsistent — `isSupported` must gate any mic affordance,
 * and typed text must always be a fully equivalent path
 * (docs/36_UX_Philosophy.md §5).
 */
export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const RecognitionCtor =
    typeof window !== 'undefined'
      ? (window.SpeechRecognition ?? window.webkitSpeechRecognition)
      : undefined;
  const isSupported = !!RecognitionCtor;

  const start = useCallback(() => {
    if (!RecognitionCtor) {
      setError('Voice input is not supported in this browser.');
      return;
    }

    setError(null);
    setTranscript('');

    const recognition = new RecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let combined = '';
      for (let i = 0; i < event.results.length; i += 1) {
        combined += event.results[i]![0]!.transcript;
      }
      setTranscript(combined);
    };
    recognition.onerror = (event) => {
      setError(event.message || event.error || 'Voice input failed.');
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [RecognitionCtor]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isSupported, isListening, transcript, start, stop, error };
}
