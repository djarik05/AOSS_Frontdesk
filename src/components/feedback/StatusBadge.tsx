import React from 'react';
import { cn } from '@/utils/cn';
import type { BookingStatus, ArrivalStatus, ReminderStatus, TaskPriority, TaskStatus, AIConversationStatus } from '@/types';

type BadgeType =
  | BookingStatus
  | ArrivalStatus
  | ReminderStatus
  | TaskPriority
  | TaskStatus
  | AIConversationStatus
  | string;

interface StatusBadgeProps {
  status: BadgeType;
  label?: string;
  className?: string;
  dot?: boolean;
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; dotColor: string }
> = {
  // Booking status
  confirmed: {
    label: 'Confirmed',
    bg: 'bg-emerald-50 border-emerald-200/60',
    text: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
  },
  pending: {
    label: 'Awaiting Confirmation',
    bg: 'bg-amber-50 border-amber-200/60',
    text: 'text-amber-700',
    dotColor: 'bg-amber-500',
  },
  cancelled: {
    label: 'Cancelled (Demo)',
    bg: 'bg-rose-50 border-rose-200/60',
    text: 'text-rose-700',
    dotColor: 'bg-rose-500',
  },
  rescheduled: {
    label: 'Rescheduled',
    bg: 'bg-indigo-50 border-indigo-200/60',
    text: 'text-indigo-700',
    dotColor: 'bg-indigo-500',
  },
  'no-show': {
    label: 'No Show',
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dotColor: 'bg-slate-400',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-purple-50 border-purple-200/60',
    text: 'text-purple-700',
    dotColor: 'bg-purple-500',
  },

  // Arrival status
  'not-arrived': {
    label: 'Not Arrived',
    bg: 'bg-slate-50 border-slate-200/80',
    text: 'text-slate-600',
    dotColor: 'bg-slate-400',
  },
  arrived: {
    label: 'In Waiting Area',
    bg: 'bg-blue-50 border-blue-200/60',
    text: 'text-blue-700',
    dotColor: 'bg-blue-500',
  },
  'checked-in': {
    label: 'Checked In',
    bg: 'bg-teal-50 border-teal-200/60',
    text: 'text-teal-700',
    dotColor: 'bg-teal-500',
  },
  'with-dentist': {
    label: 'With Dentist',
    bg: 'bg-violet-50 border-violet-200/60',
    text: 'text-violet-700',
    dotColor: 'bg-violet-500',
  },

  // Reminder status
  scheduled: {
    label: 'Scheduled',
    bg: 'bg-sky-50 border-sky-200/60',
    text: 'text-sky-700',
    dotColor: 'bg-sky-500',
  },
  'simulated-sent': {
    label: 'Sent in Demo',
    bg: 'bg-emerald-50 border-emerald-200/60',
    text: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
  },
  failed: {
    label: 'Failed in Demo',
    bg: 'bg-rose-50 border-rose-200/60',
    text: 'text-rose-700',
    dotColor: 'bg-rose-500',
  },
  'awaiting-review': {
    label: 'Awaiting Review',
    bg: 'bg-amber-50 border-amber-200/60',
    text: 'text-amber-700',
    dotColor: 'bg-amber-500',
  },

  // Task Priority
  urgent: {
    label: 'Urgent',
    bg: 'bg-red-50 border-red-200/70',
    text: 'text-red-700 font-semibold',
    dotColor: 'bg-red-600',
  },
  high: {
    label: 'High Priority',
    bg: 'bg-orange-50 border-orange-200/70',
    text: 'text-orange-700 font-medium',
    dotColor: 'bg-orange-500',
  },
  normal: {
    label: 'Normal',
    bg: 'bg-blue-50 border-blue-200/60',
    text: 'text-blue-700',
    dotColor: 'bg-blue-500',
  },
  low: {
    label: 'Low',
    bg: 'bg-slate-50 border-slate-200',
    text: 'text-slate-600',
    dotColor: 'bg-slate-400',
  },

  // Task Status
  todo: {
    label: 'To Do',
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dotColor: 'bg-slate-500',
  },
  'in-progress': {
    label: 'In Progress',
    bg: 'bg-blue-50 border-blue-200/70',
    text: 'text-blue-700',
    dotColor: 'bg-blue-500',
  },
  'awaiting-response': {
    label: 'Awaiting Reply',
    bg: 'bg-amber-50 border-amber-200/70',
    text: 'text-amber-700',
    dotColor: 'bg-amber-500',
  },

  // AI Conversation Status
  answered: {
    label: 'AI Answered',
    bg: 'bg-emerald-50 border-emerald-200/60',
    text: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
  },
  'awaiting-patient': {
    label: 'Awaiting Patient',
    bg: 'bg-amber-50 border-amber-200/60',
    text: 'text-amber-700',
    dotColor: 'bg-amber-500',
  },
  'action-in-progress': {
    label: 'Action in Progress',
    bg: 'bg-indigo-50 border-indigo-200/60',
    text: 'text-indigo-700',
    dotColor: 'bg-indigo-500',
  },
  'needs-staff': {
    label: 'Needs Staff Hand-off',
    bg: 'bg-amber-100/70 border-amber-300',
    text: 'text-amber-900 font-semibold',
    dotColor: 'bg-amber-600',
  },
  escalated: {
    label: 'Escalated to Staff',
    bg: 'bg-rose-100/70 border-rose-300',
    text: 'text-rose-900 font-semibold',
    dotColor: 'bg-rose-600',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className,
  dot = true,
}) => {
  const config = statusConfig[status] || {
    label: label || status,
    bg: 'bg-slate-50 border-slate-200',
    text: 'text-slate-700',
    dotColor: 'bg-slate-400',
  };

  const displayLabel = label || config.label;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
        config.bg,
        config.text,
        className
      )}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dotColor)}
        />
      )}
      <span className="truncate">{displayLabel}</span>
    </span>
  );
};
