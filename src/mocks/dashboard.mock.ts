import type { ActivityLog } from '../types';

export interface DashboardKPI {
  todayAppointments: number;
  pendingConfirmations: number;
  aiHandledPercentage: number;
  activeConversations: number;
  newPatientsThisMonth: number;
  upcomingReminders: number;
  monthlyRevenue: number;
  previousMonthRevenue: number;
}

export interface WeeklyAppointmentData {
  day: string;
  confirmed: number;
  pending: number;
  cancelled: number;
}

export interface EnquiryCategoryData {
  category: string;
  count: number;
  color: string;
}

export const mockDashboardKPIs: DashboardKPI = {
  todayAppointments: 6,
  pendingConfirmations: 3,
  aiHandledPercentage: 72,
  activeConversations: 4,
  newPatientsThisMonth: 12,
  upcomingReminders: 5,
  monthlyRevenue: 287500,
  previousMonthRevenue: 265000,
};

export const mockWeeklyAppointments: WeeklyAppointmentData[] = [
  { day: 'Mon', confirmed: 8, pending: 2, cancelled: 1 },
  { day: 'Tue', confirmed: 6, pending: 3, cancelled: 0 },
  { day: 'Wed', confirmed: 5, pending: 1, cancelled: 2 },
  { day: 'Thu', confirmed: 9, pending: 2, cancelled: 1 },
  { day: 'Fri', confirmed: 7, pending: 4, cancelled: 0 },
  { day: 'Sat', confirmed: 4, pending: 1, cancelled: 0 },
  { day: 'Sun', confirmed: 0, pending: 0, cancelled: 0 },
];

export const mockEnquiryCategories: EnquiryCategoryData[] = [
  { category: 'Appointment Booking', count: 34, color: '#7658E8' },
  { category: 'Fees & Services', count: 18, color: '#34D399' },
  { category: 'Opening Hours', count: 12, color: '#FBBF24' },
  { category: 'Rescheduling', count: 9, color: '#60A5FA' },
  { category: 'Clinical Questions', count: 7, color: '#F87171' },
  { category: 'General Enquiry', count: 15, color: '#A78BFA' },
];

export const mockActivityLog: ActivityLog[] = [
  {
    id: 'act1',
    timestamp: '2026-10-20T12:10:00Z',
    actor: 'Dr. Rohan Mehta',
    actorRole: 'dentist',
    action: 'Responded to escalated clinical question',
    actionType: 'conversation',
    relatedRecord: 'conv6',
    relatedRecordType: 'conversation',
    result: 'success',
    details: 'Provided guidance for unknown caller with tooth pain complaint.',
  },
  {
    id: 'act2',
    timestamp: '2026-10-20T11:25:00Z',
    actor: 'Kavitha Sundaram',
    actorRole: 'receptionist',
    action: 'Handling rescheduling request',
    actionType: 'conversation',
    relatedRecord: 'conv4',
    relatedRecordType: 'conversation',
    result: 'pending',
    details: 'Sneha Gupta requested reschedule of teeth whitening from today to next Tue/Wed evening.',
  },
  {
    id: 'act3',
    timestamp: '2026-10-20T10:05:10Z',
    actor: 'AOSS AI',
    actorRole: 'receptionist',
    action: 'Initiated appointment booking',
    actionType: 'appointment',
    relatedRecord: 'conv3',
    relatedRecordType: 'conversation',
    result: 'pending',
    details: 'Ananya Das requested filling appointment for Friday 3:30 PM with Dr. Rao.',
  },
  {
    id: 'act4',
    timestamp: '2026-10-20T09:15:05Z',
    actor: 'AOSS AI',
    actorRole: 'receptionist',
    action: 'Answered fee enquiry',
    actionType: 'conversation',
    relatedRecord: 'conv2',
    relatedRecordType: 'conversation',
    result: 'success',
    details: 'Provided consultation and cleaning fee information to Rahul Verma.',
  },
  {
    id: 'act5',
    timestamp: '2026-10-20T08:30:00Z',
    actor: 'Kavitha Sundaram',
    actorRole: 'receptionist',
    action: 'Started restocking dental supplies',
    actionType: 'task',
    relatedRecord: 'task2',
    relatedRecordType: 'task',
    result: 'pending',
    details: 'Began processing order for composite filling material and disposable gloves.',
  },
  {
    id: 'act6',
    timestamp: '2026-10-19T20:00:03Z',
    actor: 'AOSS AI',
    actorRole: 'receptionist',
    action: 'Sent appointment reminder',
    actionType: 'reminder',
    relatedRecord: 'rem3',
    relatedRecordType: 'reminder',
    result: 'success',
    details: 'Pre-appointment reminder sent to Deepak Reddy for root canal appointment.',
  },
  {
    id: 'act7',
    timestamp: '2026-10-19T18:35:00Z',
    actor: 'AOSS AI',
    actorRole: 'receptionist',
    action: 'Resolved opening hours enquiry',
    actionType: 'conversation',
    relatedRecord: 'conv1',
    relatedRecordType: 'conversation',
    result: 'success',
    details: 'Answered Priya Sharma\'s question about Saturday clinic hours.',
  },
  {
    id: 'act8',
    timestamp: '2026-10-19T16:50:00Z',
    actor: 'AOSS AI',
    actorRole: 'receptionist',
    action: 'Confirmed appointment details',
    actionType: 'conversation',
    relatedRecord: 'conv5',
    relatedRecordType: 'conversation',
    result: 'success',
    details: 'Confirmed Deepak Reddy\'s root canal appointment and answered procedure questions.',
  },
  {
    id: 'act9',
    timestamp: '2026-10-19T15:00:00Z',
    actor: 'Kavitha Sundaram',
    actorRole: 'receptionist',
    action: 'Created new appointment',
    actionType: 'appointment',
    relatedRecord: 'apt6',
    relatedRecordType: 'appointment',
    result: 'success',
    details: 'Booked teeth whitening for Sneha Gupta on 20 Oct at 4:00 PM with Dr. Rao.',
  },
  {
    id: 'act10',
    timestamp: '2026-10-19T10:00:00Z',
    actor: 'Kavitha Sundaram',
    actorRole: 'receptionist',
    action: 'Completed task',
    actionType: 'task',
    relatedRecord: 'task7',
    relatedRecordType: 'task',
    result: 'success',
    details: 'Sent post-treatment care instructions to Priya Sharma via WhatsApp.',
  },
];
