import { clsx, type ClassValue } from 'clsx';

/**
 * Combines class names using clsx for conditional and merged class handling.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
