import { useCallback, useState } from 'react';

import { mockICEEngine } from '@/features/assistant/ice/mockICEEngine';
import type {
  CaptureSourceType,
  StructuredCapture,
} from '@/features/assistant/types';

export interface CaptureSubmitResult {
  /** True when the input looked like a question rather than something to capture — docs/35 §5's "query" row. The caller (QuickCaptureBar) is responsible for routing this to Jarvis's chat surface; this hook doesn't own conversation state. */
  isQuery: boolean;
}

export interface UseCaptureResult {
  capture: StructuredCapture | null;
  isExtracting: boolean;
  submit: (
    text: string,
    sourceType?: CaptureSourceType,
  ) => Promise<CaptureSubmitResult>;
  dismiss: () => void;
}

/**
 * Owns exactly one capture at a time — the ICE half of docs/34 §1's
 * pipeline, ending at `StructuredCapture`, never a mutation call (docs/34
 * §2). `CaptureConfirmSheet` is what actually writes, and only once the
 * user confirms.
 */
export function useCapture(): UseCaptureResult {
  const [capture, setCapture] = useState<StructuredCapture | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const submit = useCallback(
    async (
      text: string,
      sourceType: CaptureSourceType = 'text',
    ): Promise<CaptureSubmitResult> => {
      const trimmed = text.trim();
      if (!trimmed) return { isQuery: false };

      setIsExtracting(true);
      try {
        const result = await mockICEEngine.extract({
          sourceType,
          text: trimmed,
        });
        if (result.proposals.length === 0) {
          return { isQuery: true };
        }
        setCapture(result);
        return { isQuery: false };
      } finally {
        setIsExtracting(false);
      }
    },
    [],
  );

  const dismiss = useCallback(() => setCapture(null), []);

  return { capture, isExtracting, submit, dismiss };
}
