import type { Patient } from '../types';
import { mockPatients } from '../mocks';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'frontdesk_patients';

function getStoredPatients(): Patient[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed reading patients from localStorage', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockPatients));
  return mockPatients;
}

function savePatients(patients: Patient[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  } catch (e) {
    console.error('Failed saving patients to localStorage', e);
  }
}

export interface PatientFilterParams {
  searchQuery?: string;
  status?: string;
  source?: string;
}

export class PatientsService {
  public async listPatients(filters?: PatientFilterParams): Promise<Patient[]> {
    await apiClient.simulateLatency(100, 200);
    let items = getStoredPatients();

    if (filters?.status && filters.status !== 'all') {
      items = items.filter((p) => p.status === filters.status);
    }
    if (filters?.source && filters.source !== 'all') {
      items = items.filter((p) => p.source === filters.source);
    }
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      items = items.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.phone.includes(q)
      );
    }

    return items.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }

  public async getPatientById(id: string): Promise<Patient | null> {
    await apiClient.simulateLatency(80, 150);
    const items = getStoredPatients();
    return items.find((p) => p.id === id) || null;
  }

  public async checkDuplicate(
    phone: string,
    email: string,
    excludeId?: string
  ): Promise<Patient | null> {
    const items = getStoredPatients();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanEmail = email.trim().toLowerCase();

    for (const p of items) {
      if (p.id === excludeId) continue;
      const curPhone = p.phone.replace(/[^0-9]/g, '');
      const curEmail = p.email.trim().toLowerCase();

      if (cleanPhone && curPhone && cleanPhone === curPhone) return p;
      if (cleanEmail && curEmail && cleanEmail === curEmail) return p;
    }
    return null;
  }

  public async createPatient(
    data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'totalVisits' | 'fullName'>
  ): Promise<Patient> {
    await apiClient.simulateLatency(150, 300);
    const items = getStoredPatients();

    const now = new Date().toISOString();
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const newPatient: Patient = {
      ...data,
      fullName,
      id: `p-${Date.now()}`,
      totalVisits: 0,
      createdAt: now,
      updatedAt: now,
    };

    items.unshift(newPatient);
    savePatients(items);
    return newPatient;
  }

  public async updatePatient(
    id: string,
    updates: Partial<Patient>
  ): Promise<Patient> {
    await apiClient.simulateLatency(100, 250);
    const items = getStoredPatients();
    const index = items.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Patient not found');

    const updated = {
      ...items[index],
      ...updates,
      fullName:
        updates.firstName || updates.lastName
          ? `${updates.firstName ?? items[index].firstName} ${
              updates.lastName ?? items[index].lastName
            }`.trim()
          : items[index].fullName,
      updatedAt: new Date().toISOString(),
    };

    items[index] = updated;
    savePatients(items);
    return updated;
  }

  public resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEY);
    savePatients(mockPatients);
  }
}

export const patientsService = new PatientsService();
