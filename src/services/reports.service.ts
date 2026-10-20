import type { ActivityLog } from '../types';
import {
  mockDashboardKPIs,
  mockWeeklyAppointments,
  mockEnquiryCategories,
  mockActivityLogs,
} from '../mocks';
import { apiClient } from './apiClient';

const ACTIVITY_STORAGE_KEY = 'frontdesk_activity_log';

function getStoredActivity(): ActivityLog[] {
  try {
    const data = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed reading activity log', e);
  }
  localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(mockActivityLogs));
  return mockActivityLogs;
}

export class ReportsService {
  public async getDashboardKPIs() {
    await apiClient.simulateLatency(80, 150);
    return mockDashboardKPIs;
  }

  public async getWeeklyAppointmentStats() {
    await apiClient.simulateLatency(100, 200);
    return mockWeeklyAppointments;
  }

  public async getEnquiryCategories() {
    await apiClient.simulateLatency(100, 200);
    return mockEnquiryCategories;
  }

  public async listActivityLogs(filter?: {
    actionType?: string;
    actorRole?: string;
    result?: string;
  }): Promise<ActivityLog[]> {
    await apiClient.simulateLatency(100, 200);
    let logs = getStoredActivity();

    if (filter?.actionType && filter.actionType !== 'all') {
      logs = logs.filter((l) => l.actionType === filter.actionType);
    }
    if (filter?.actorRole && filter.actorRole !== 'all') {
      logs = logs.filter((l) => l.actorRole === filter.actorRole);
    }
    if (filter?.result && filter.result !== 'all') {
      logs = logs.filter((l) => l.result === filter.result);
    }

    return logs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public async logActivity(
    entry: Omit<ActivityLog, 'id' | 'timestamp'>
  ): Promise<ActivityLog> {
    const logs = getStoredActivity();
    const newEntry: ActivityLog = {
      ...entry,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newEntry);
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(logs));
    return newEntry;
  }

  public exportCSV(filename: string, rows: Record<string, any>[]): void {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const val = row[h] ?? '';
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const reportsService = new ReportsService();
