import { useEffect, useState } from 'react';

import { GroceryCaptureCard } from '@/features/assistant/components/GroceryCaptureCard';
import {
  ICE_DOMAIN_CONFIG,
  validateProposal,
} from '@/features/assistant/ice/domainRouting';
import type {
  CaptureProposal,
  StructuredCapture,
} from '@/features/assistant/types';
import { BillFormDialog } from '@/features/bills';
import { EventFormDialog, useEvents } from '@/features/calendar';
import { TransactionFormDialog } from '@/features/finance';
import { MedicineFormDialog } from '@/features/health';
import { useMedicines } from '@/features/health/hooks/useHealth';
import { ReminderFormDialog } from '@/features/reminders';
import { TaskFormDialog } from '@/features/tasks';

export interface CaptureConfirmSheetProps {
  capture: StructuredCapture | null;
  onClose: () => void;
  /** Called with a short label after a successful save, and with the
   * domain + saved entity's id for session memory — lets the Conversation
   * Manager close the loop ("Done — I've added X") and resolve later
   * pronoun follow-ups ("move it to Friday"). */
  onSaved?: (label: string, domain: string, entityRef?: string) => void;
}

type ConfirmUnit =
  | { kind: 'grocery'; key: string; proposals: CaptureProposal[] }
  | { kind: 'domain'; key: string; proposal: CaptureProposal };

function NextStepEffect({ onAdvance }: { onAdvance: () => void }) {
  useEffect(() => {
    onAdvance();
    // Runs once per mount — this component only exists for one render pass.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function buildUnits(proposals: CaptureProposal[]): ConfirmUnit[] {
  const grocery = proposals.filter((p) => p.domain === 'grocery-list-item');
  const rest = proposals.filter((p) => p.domain !== 'grocery-list-item');
  const units: ConfirmUnit[] = rest.map((proposal, i) => ({
    kind: 'domain',
    key: `domain-${i}`,
    proposal,
  }));
  if (grocery.length > 0) {
    units.push({ kind: 'grocery', key: 'grocery', proposals: grocery });
  }
  return units;
}

/**
 * Steps through every proposal from one capture, one at a time —
 * independently confirmable or dismissible, never an all-or-nothing batch
 * (docs/35_Intelligent_Capture_Engine_Spec.md §7). Each domain proposal
 * opens that domain's OWN existing FormDialog, pre-filled — the only new
 * UI surface here is `GroceryCaptureCard` (no single-entity dialog exists
 * to delegate multi-item captures to). Whether a step ends in Save or
 * Cancel, it's still "handled" — either way the sheet just advances, since
 * both are legitimate per-item outcomes here (docs/34_AI_Architecture.md §2:
 * nothing was written until that step's own Save button fired).
 */
export function CaptureConfirmSheet({
  capture,
  onClose,
  onSaved,
}: CaptureConfirmSheetProps) {
  const [stepIndex, setStepIndex] = useState(0);
  // Resets the step index when a new capture arrives — the React-docs
  // "adjust state during render" pattern (not an effect, since setting
  // state synchronously inside an effect causes an extra render).
  const [trackedCapture, setTrackedCapture] = useState(capture);
  if (capture !== trackedCapture) {
    setTrackedCapture(capture);
    setStepIndex(0);
  }
  const { data: medicines } = useMedicines();
  const { data: events } = useEvents();

  if (!capture || capture.proposals.length === 0) return null;

  const units = buildUnits(capture.proposals);
  const current = units[stepIndex];
  if (!current) return null;

  const advance = () => {
    if (stepIndex + 1 < units.length) {
      setStepIndex((i) => i + 1);
    } else {
      onClose();
    }
  };
  const handleOpenChange = (open: boolean) => {
    if (!open) advance();
  };

  if (current.kind === 'grocery') {
    return (
      <GroceryCaptureCard
        proposals={current.proposals}
        onDone={advance}
        onSaved={(label) => onSaved?.(label, 'grocery-list-item')}
      />
    );
  }

  const { proposal } = current;
  const config = ICE_DOMAIN_CONFIG[proposal.domain];
  const { data, lowConfidenceFields } = validateProposal(proposal);
  const description = config
    ? `Jarvis understood this as a ${config.label}${proposal.action === 'update' ? ' — matched to one you already have.' : '.'}`
    : undefined;

  switch (proposal.domain) {
    case 'task':
      return (
        <TaskFormDialog
          open
          onOpenChange={handleOpenChange}
          initialValues={data}
          description={description}
          lowConfidenceFields={lowConfidenceFields}
          onSaved={(label) => onSaved?.(label, 'task')}
        />
      );
    case 'bill':
      return (
        <BillFormDialog
          open
          onOpenChange={handleOpenChange}
          initialValues={data}
          description={description}
          lowConfidenceFields={lowConfidenceFields}
          onSaved={(label) => onSaved?.(label, 'bill')}
        />
      );
    case 'reminder':
      return (
        <ReminderFormDialog
          open
          onOpenChange={handleOpenChange}
          initialValues={data}
          description={description}
          lowConfidenceFields={lowConfidenceFields}
          onSaved={(label) => onSaved?.(label, 'reminder')}
        />
      );
    case 'finance-transaction':
      return (
        <TransactionFormDialog
          open
          onOpenChange={handleOpenChange}
          initialValues={data}
          description={description}
          lowConfidenceFields={lowConfidenceFields}
          onSaved={(label) => onSaved?.(label, 'finance-transaction')}
        />
      );
    case 'health-medicine': {
      const existing = proposal.entityRef
        ? medicines?.find((m) => m.id === proposal.entityRef)
        : undefined;
      return (
        <MedicineFormDialog
          open
          onOpenChange={handleOpenChange}
          medicine={existing}
          initialValues={data}
          description={description}
          lowConfidenceFields={lowConfidenceFields}
          onSaved={(label) =>
            onSaved?.(label, 'health-medicine', proposal.entityRef)
          }
        />
      );
    }
    case 'calendar-event': {
      const existing = proposal.entityRef
        ? events?.find((e) => e.id === proposal.entityRef)
        : undefined;
      return (
        <EventFormDialog
          open
          onOpenChange={handleOpenChange}
          event={existing}
          initialValues={data}
          description={description}
          lowConfidenceFields={lowConfidenceFields}
          onSaved={(label) =>
            onSaved?.(label, 'calendar-event', proposal.entityRef)
          }
        />
      );
    }
    default:
      // Unreachable this pass — every domain EXTRACTION_RULES can produce
      // is wired above. Guards a future fast-follow domain (docs/35 §5)
      // being added to CaptureDomain/extraction before its FormDialog case
      // is added here; `NextStepEffect` advances past it in an effect
      // rather than during render, since calling `advance` directly here
      // would update state while this component is still rendering.
      return <NextStepEffect onAdvance={advance} />;
  }
}
