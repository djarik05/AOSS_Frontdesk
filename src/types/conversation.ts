export interface Conversation {
  id: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  channel: ConversationChannel;
  status: ConversationStatus;
  aiStatus: AIConversationStatus;
  assignedTo?: string;
  assignedToName?: string;
  category: ConversationCategory;
  subject: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  senderName: string;
  content: string;
  timestamp: string;
  isAI: boolean;
  isRead: boolean;
  metadata?: {
    intent?: string;
    action?: string;
    confidence?: number;
  };
}

export type ConversationChannel = 'whatsapp' | 'sms' | 'web-chat' | 'phone';
export type ConversationStatus = 'open' | 'resolved' | 'pending' | 'escalated';
export type AIConversationStatus = 'answered' | 'awaiting-patient' | 'action-in-progress' | 'completed' | 'needs-staff' | 'failed' | 'escalated';
export type ConversationCategory = 'appointment-booking' | 'fees-services' | 'opening-hours' | 'general-enquiry' | 'rescheduling' | 'cancellation' | 'follow-up' | 'clinical-question';
export type MessageSender = 'patient' | 'ai' | 'staff';
