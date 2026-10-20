import type { Conversation, Message, AIConversationStatus } from '../types';
import { mockConversations } from '../mocks';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'frontdesk_conversations';

function getStoredConversations(): Conversation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed reading conversations from storage', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockConversations));
  return mockConversations;
}

function saveConversations(convs: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
  } catch (e) {
    console.error('Failed saving conversations to storage', e);
  }
}

export class ConversationsService {
  public async listConversations(filter?: string): Promise<Conversation[]> {
    await apiClient.simulateLatency(100, 200);
    let items = getStoredConversations();

    if (filter === 'unread') {
      items = items.filter((c) => c.unreadCount > 0);
    } else if (filter === 'ai-handling') {
      items = items.filter(
        (c) =>
          c.aiStatus === 'answered' ||
          c.aiStatus === 'awaiting-patient' ||
          c.aiStatus === 'action-in-progress'
      );
    } else if (filter === 'needs-staff') {
      items = items.filter(
        (c) => c.aiStatus === 'needs-staff' || c.aiStatus === 'escalated'
      );
    }

    return items.sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }

  public async getConversationById(id: string): Promise<Conversation | null> {
    await apiClient.simulateLatency(60, 150);
    const items = getStoredConversations();
    return items.find((c) => c.id === id) || null;
  }

  public async sendMessage(
    conversationId: string,
    content: string,
    sender: 'staff' | 'patient',
    senderName: string
  ): Promise<Message> {
    await apiClient.simulateLatency(100, 200);
    const items = getStoredConversations();
    const conv = items.find((c) => c.id === conversationId);
    if (!conv) throw new Error('Conversation not found');

    const now = new Date().toISOString();
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      sender,
      senderName,
      content,
      timestamp: now,
      isAI: false,
      isRead: true,
    };

    conv.messages.push(newMessage);
    conv.lastMessage = content;
    conv.lastMessageAt = now;
    if (sender === 'patient') {
      conv.unreadCount += 1;
    } else {
      conv.unreadCount = 0;
    }

    saveConversations(items);
    return newMessage;
  }

  public async takeOverConversation(
    conversationId: string,
    staffName: string
  ): Promise<Conversation> {
    await apiClient.simulateLatency(100, 200);
    const items = getStoredConversations();
    const conv = items.find((c) => c.id === conversationId);
    if (!conv) throw new Error('Conversation not found');

    conv.aiStatus = 'needs-staff';
    conv.assignedTo = 'staff-current';
    conv.assignedToName = staffName;

    // Insert system / audit message
    conv.messages.push({
      id: `sys-${Date.now()}`,
      conversationId,
      sender: 'staff',
      senderName: 'System',
      content: `[Staff Takeover] ${staffName} took over the conversation. AI auto-reply is paused for this session.`,
      timestamp: new Date().toISOString(),
      isAI: false,
      isRead: true,
    });

    saveConversations(items);
    return conv;
  }

  public async resumeAI(conversationId: string): Promise<Conversation> {
    await apiClient.simulateLatency(80, 180);
    const items = getStoredConversations();
    const conv = items.find((c) => c.id === conversationId);
    if (!conv) throw new Error('Conversation not found');

    conv.aiStatus = 'answered';
    conv.messages.push({
      id: `sys-${Date.now()}`,
      conversationId,
      sender: 'ai',
      senderName: 'AOSS FrontDesk Assistant',
      content: `[AI Resumed] Automated receptionist has re-engaged.`,
      timestamp: new Date().toISOString(),
      isAI: true,
      isRead: true,
    });

    saveConversations(items);
    return conv;
  }

  public async markResolved(conversationId: string): Promise<Conversation> {
    const items = getStoredConversations();
    const conv = items.find((c) => c.id === conversationId);
    if (!conv) throw new Error('Conversation not found');

    conv.status = 'resolved';
    conv.aiStatus = 'completed';
    conv.unreadCount = 0;
    saveConversations(items);
    return conv;
  }

  public async generateDeterministicAIReply(
    conversationId: string,
    patientQuery: string
  ): Promise<Message> {
    await apiClient.simulateLatency(400, 700);
    const items = getStoredConversations();
    const conv = items.find((c) => c.id === conversationId);
    if (!conv) throw new Error('Conversation not found');

    const q = patientQuery.toLowerCase();
    let reply = '';
    let newAiStatus: AIConversationStatus = 'answered';

    if (q.includes('hour') || q.includes('open') || q.includes('time')) {
      reply =
        'Hello! Mehta Dental Studio is open Monday to Friday from 9:00 AM to 7:00 PM, and Saturdays from 9:00 AM to 2:00 PM. We are closed on Sundays.';
    } else if (q.includes('fee') || q.includes('cost') || q.includes('price') || q.includes('charge')) {
      reply =
        'Our standard dental consultation fee is ₹500. Routine scaling/cleaning starts at ₹1,200. We can discuss detailed treatment plans after the examination!';
    } else if (q.includes('pain') || q.includes('bleed') || q.includes('emergency') || q.includes('swelling')) {
      reply =
        'I am an AI administrative receptionist and cannot provide clinical diagnosis. For acute pain or emergency dental care, I have flagged this conversation for immediate staff attention!';
      newAiStatus = 'escalated';
    } else if (q.includes('book') || q.includes('appointment') || q.includes('slot')) {
      reply =
        'Certainly! We have openings available with Dr. Mehta and Dr. Ananya Rao tomorrow at 11:00 AM and 3:30 PM. Would you like me to reserve one of these demo slots?';
      newAiStatus = 'awaiting-patient';
    } else {
      reply =
        'Thank you for reaching out to Mehta Dental Studio. I have recorded your message and our reception team will follow up shortly.';
    }

    const now = new Date().toISOString();
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      conversationId,
      sender: 'ai',
      senderName: 'AOSS FrontDesk Assistant',
      content: reply,
      timestamp: now,
      isAI: true,
      isRead: true,
      metadata: {
        intent: 'administrative_query',
        confidence: 0.96,
      },
    };

    conv.messages.push(aiMessage);
    conv.lastMessage = reply;
    conv.lastMessageAt = now;
    conv.aiStatus = newAiStatus;

    saveConversations(items);
    return aiMessage;
  }

  public resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEY);
    saveConversations(mockConversations);
  }
}

export const conversationsService = new ConversationsService();
