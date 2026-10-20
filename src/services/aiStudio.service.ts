import type { AIConfiguration, KnowledgeItem } from '../types';
import { mockAIConfiguration } from '../mocks';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'frontdesk_ai_config';

function getStoredAIConfig(): AIConfiguration {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed reading AI config from storage', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAIConfiguration));
  return mockAIConfiguration;
}

function saveAIConfig(config: AIConfiguration) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed saving AI config', e);
  }
}

export class AIStudioService {
  public async getConfig(): Promise<AIConfiguration> {
    await apiClient.simulateLatency(80, 150);
    return getStoredAIConfig();
  }

  public async updateConfig(
    updates: Partial<AIConfiguration>
  ): Promise<AIConfiguration> {
    await apiClient.simulateLatency(120, 250);
    const config = getStoredAIConfig();
    const updated: AIConfiguration = {
      ...config,
      ...updates,
      configVersion: config.configVersion + 1,
      lastPublished: new Date().toISOString(),
    };
    saveAIConfig(updated);
    return updated;
  }

  public async addKnowledgeItem(
    item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<KnowledgeItem> {
    await apiClient.simulateLatency(100, 200);
    const config = getStoredAIConfig();
    const now = new Date().toISOString();
    const newItem: KnowledgeItem = {
      ...item,
      id: `kb-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    config.knowledgeItems.unshift(newItem);
    saveAIConfig(config);
    return newItem;
  }

  public async updateKnowledgeItem(
    id: string,
    updates: Partial<KnowledgeItem>
  ): Promise<KnowledgeItem> {
    const config = getStoredAIConfig();
    const index = config.knowledgeItems.findIndex((k) => k.id === id);
    if (index === -1) throw new Error('Knowledge item not found');
    const updated = {
      ...config.knowledgeItems[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    config.knowledgeItems[index] = updated;
    saveAIConfig(config);
    return updated;
  }

  public async deleteKnowledgeItem(id: string): Promise<void> {
    const config = getStoredAIConfig();
    config.knowledgeItems = config.knowledgeItems.filter((k) => k.id !== id);
    saveAIConfig(config);
  }

  public async runTestPlayground(
    prompt: string
  ): Promise<{
    response: string;
    detectedIntent: string;
    requiredInformation: string[];
    proposedAction: string;
    escalationStatus: 'none' | 'warning' | 'escalated';
  }> {
    await apiClient.simulateLatency(350, 600);
    const p = prompt.toLowerCase();

    if (p.includes('pain') || p.includes('toothache') || p.includes('swelling') || p.includes('bleed')) {
      return {
        response:
          'I understand you are experiencing discomfort. As an AI receptionist, I cannot diagnose medical conditions. I have flagged your enquiry for immediate review by Dr. Mehta or our duty dentist.',
        detectedIntent: 'clinical_emergency_escalation',
        requiredInformation: ['Patient contact', 'Severity rating', 'Pain duration'],
        proposedAction: 'Escalate immediately to clinic staff on-call phone',
        escalationStatus: 'escalated',
      };
    }

    if (p.includes('price') || p.includes('fee') || p.includes('cost')) {
      return {
        response:
          'Mehta Dental Studio consultation fee is ₹500. Comprehensive examination with intraoral camera is ₹800. Cleaning and polishing packages start at ₹1,200.',
        detectedIntent: 'fee_enquiry',
        requiredInformation: ['Treatment category preference'],
        proposedAction: 'Provide published fee sheet and offer scheduling',
        escalationStatus: 'none',
      };
    }

    if (p.includes('book') || p.includes('appointment') || p.includes('tomorrow') || p.includes('time')) {
      return {
        response:
          'We have an opening with Dr. Mehta tomorrow at 10:00 AM or with Dr. Ananya Rao at 2:30 PM. Would you like me to reserve one of these demonstration slots for you?',
        detectedIntent: 'appointment_booking_request',
        requiredInformation: ['Preferred dentist', 'Patient name & mobile number'],
        proposedAction: 'Present available slots and draft provisional reservation',
        escalationStatus: 'none',
      };
    }

    return {
      response:
        'Thank you for contacting Mehta Dental Studio! We are located at 42 MG Road, Indiranagar. Open Mon-Fri 9:00 AM - 7:00 PM and Sat 9:00 AM - 2:00 PM. How may I assist you today?',
      detectedIntent: 'general_inquiry',
      requiredInformation: [],
      proposedAction: 'Answer with approved clinic directory details',
      escalationStatus: 'none',
    };
  }

  public resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEY);
    saveAIConfig(mockAIConfiguration);
  }
}

export const aiStudioService = new AIStudioService();
