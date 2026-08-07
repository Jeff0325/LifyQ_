import type { LucideIcon } from 'lucide-react';

/**
 * A single destination in the primary navigation shell (sidebar / bottom
 * tabs). Mirrors the domain list in docs/06_Information_Architecture.md.
 *
 * `enabled: false` renders the item as a visible-but-inert "Soon" entry —
 * used for every pillar that doesn't have a real route yet in this phase.
 * See docs/22_MVP_Definition.md for what's currently in scope.
 */
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
}
