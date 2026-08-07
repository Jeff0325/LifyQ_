import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind class lists safely (later conflicting utilities win),
 * the standard shadcn/ui primitive used by every component in
 * /components/ui and /components/shared. See docs/11_Component_Library.md.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
