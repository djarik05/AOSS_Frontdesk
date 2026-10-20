import type { Clinic } from '../types';
import { mockClinic } from '../mocks';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'frontdesk_clinic_settings';

function getStoredClinic(): Clinic {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed reading clinic settings', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockClinic));
  return mockClinic;
}

function saveClinic(clinic: Clinic) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clinic));
  } catch (e) {
    console.error('Failed saving clinic settings', e);
  }
}

export class ClinicService {
  public async getClinic(): Promise<Clinic> {
    await apiClient.simulateLatency(80, 150);
    return getStoredClinic();
  }

  public async updateClinic(updates: Partial<Clinic>): Promise<Clinic> {
    await apiClient.simulateLatency(120, 250);
    const clinic = getStoredClinic();
    const updated = {
      ...clinic,
      ...updates,
    };
    saveClinic(updated);
    return updated;
  }

  public resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEY);
    saveClinic(mockClinic);
  }
}

export const clinicService = new ClinicService();
