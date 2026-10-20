import type { Reminder, ReminderStatus } from '../types';
import { mockReminders } from '../mocks';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'frontdesk_reminders';

function getStoredReminders(): Reminder[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed reading reminders from storage', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockReminders));
  return mockReminders;
}

function saveReminders(reminders: Reminder[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.error('Failed saving reminders to storage', e);
  }
}

export class RemindersService {
  public async listReminders(statusFilter?: string): Promise<Reminder[]> {
    await apiClient.simulateLatency(80, 180);
    let items = getStoredReminders();
    if (statusFilter && statusFilter !== 'all') {
      items = items.filter((r) => r.status === statusFilter);
    }
    return items.sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );
  }

  public async createReminder(
    data: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<Reminder> {
    await apiClient.simulateLatency(120, 250);
    const items = getStoredReminders();
    const now = new Date().toISOString();
    const newReminder: Reminder = {
      ...data,
      id: `rem-${Date.now()}`,
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
    };
    items.unshift(newReminder);
    saveReminders(items);
    return newReminder;
  }

  public async updateStatus(
    id: string,
    status: ReminderStatus
  ): Promise<Reminder> {
    await apiClient.simulateLatency(80, 150);
    const items = getStoredReminders();
    const rem = items.find((r) => r.id === id);
    if (!rem) throw new Error('Reminder not found');
    rem.status = status;
    rem.updatedAt = new Date().toISOString();
    saveReminders(items);
    return rem;
  }

  public async retrySimulation(id: string): Promise<Reminder> {
    await apiClient.simulateLatency(250, 400);
    return this.updateStatus(id, 'simulated-sent');
  }

  public resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEY);
    saveReminders(mockReminders);
  }
}

export const remindersService = new RemindersService();
