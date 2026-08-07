export interface LowConfidenceNoticeProps {
  fields?: Set<string>;
  /** Human-readable label per raw field key, e.g. `{ dueDate: 'due date' }`. */
  labels: Record<string, string>;
}

/**
 * A single summary line rather than per-field badges — simpler to place
 * consistently across every domain's FormDialog while still meeting
 * docs/35_Intelligent_Capture_Engine_Spec.md §7's "visually flagged, not
 * hidden" requirement for fields ICE filled in with a default rather than
 * something recognized in the text.
 */
export function LowConfidenceNotice({
  fields,
  labels,
}: LowConfidenceNoticeProps) {
  if (!fields || fields.size === 0) return null;

  const names = [...fields].map((key) => labels[key] ?? key).join(', ');

  return (
    <p className="px-3 py-2 rounded-md border border-warning/30 bg-warning-subtle text-caption text-warning">
      Worth double-checking: {names}
    </p>
  );
}
