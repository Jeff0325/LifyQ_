/**
 * Finds the best name-field match for `query` among `items`, or
 * `undefined` if nothing scores above a minimal bar. Backs ICE's
 * "update-by-fuzzy-match" pattern (docs/35 §5 — e.g. "took my vitamin D"
 * matching an existing Medicine named "Vitamin D3"). No new dependency:
 * case-insensitive token overlap, not a real fuzzy-string library — good
 * enough for a handful of records per domain in the mock phase.
 */
export function fuzzyFindByName<T extends { id: string }>(
  items: T[],
  nameField: keyof T,
  query: string,
): T | undefined {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0 || items.length === 0) return undefined;

  let best: T | undefined;
  let bestScore = 0;

  for (const item of items) {
    const value = item[nameField];
    if (typeof value !== 'string') continue;
    const itemTokens = tokenize(value);
    const overlap = itemTokens.filter((t) => queryTokens.includes(t)).length;
    if (overlap === 0) continue;
    const score = overlap / Math.max(itemTokens.length, queryTokens.length);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  return bestScore >= 0.34 ? best : undefined;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);
}
