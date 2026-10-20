import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  isTomorrow,
  parseISO,
} from 'date-fns';

/**
 * Format a date string or Date object to a human-readable date.
 * Examples: "Oct 20, 2026", "Today", "Yesterday", "Tomorrow"
 */
export function formatDate(
  date: string | Date,
  options?: { relative?: boolean }
): string {
  const d = typeof date === 'string' ? parseISO(date) : date;

  if (options?.relative) {
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    if (isTomorrow(d)) return 'Tomorrow';
  }

  return format(d, 'MMM d, yyyy');
}

/**
 * Format a date/time to just the time portion.
 * Example: "2:30 PM"
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'h:mm a');
}

/**
 * Format a number as USD currency.
 * Example: 1234.5 → "$1,234.50"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a phone number string to (XXX) XXX-XXXX format.
 * Strips non-digit chars first. Handles 10 or 11 digit (leading 1) numbers.
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const normalized = digits.length === 11 && digits.startsWith('1')
    ? digits.slice(1)
    : digits;

  if (normalized.length !== 10) return phone;

  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
}

/**
 * Get initials from a full name.
 * "Jane Doe" → "JD", "Alice Bob Charles" → "AC"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Get a relative time string from a date.
 * Example: "3 minutes ago", "in 2 hours"
 */
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}
