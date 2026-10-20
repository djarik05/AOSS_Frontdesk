export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastActivity?: string;
  createdAt: string;
}

export interface Dentist extends User {
  role: 'dentist';
  specialization?: string;
  registrationNumber?: string;
  availability: DentistAvailability[];
  color: string;
}

export interface DentistAvailability {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export type UserRole = 'owner' | 'receptionist' | 'dentist' | 'manager';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedToId: string;
  assignedToName: string;
  createdById: string;
  createdByName: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  relatedPatientId?: string;
  relatedPatientName?: string;
  relatedAppointmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'awaiting-response' | 'completed' | 'cancelled';

export interface ActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  actionType: ActivityActionType;
  relatedRecord?: string;
  relatedRecordType?: string;
  result: 'success' | 'failed' | 'pending';
  details: string;
}

export type ActivityActionType = 'appointment' | 'patient' | 'conversation' | 'reminder' | 'task' | 'ai-config' | 'team' | 'settings';

export interface AIConfiguration {
  assistantName: string;
  isEnabled: boolean;
  provider: string;
  configVersion: number;
  lastPublished?: string;
  tone: 'formal' | 'professional' | 'friendly';
  greeting: string;
  instructions: string;
  permissions: AIPermissions;
  knowledgeItems: KnowledgeItem[];
}

export interface AIPermissions {
  answerAdminQuestions: boolean;
  checkAvailability: boolean;
  initiateBooking: boolean;
  initiateRescheduling: boolean;
  initiateCancellation: boolean;
  scheduleReminders: boolean;
  escalateClinical: boolean;
}

export interface KnowledgeItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  status: 'draft' | 'approved';
  createdAt: string;
  updatedAt: string;
}
