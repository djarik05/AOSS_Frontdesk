export interface Reminder {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  type: ReminderType;
  channel: ReminderChannel;
  scheduledAt: string;
  status: ReminderStatus;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export type ReminderType = 'appointment-confirmation' | 'pre-appointment' | 'follow-up' | 'recall' | 'custom';
export type ReminderChannel = 'whatsapp' | 'sms' | 'email';
export type ReminderStatus = 'scheduled' | 'simulated-sent' | 'failed' | 'cancelled' | 'awaiting-review';
