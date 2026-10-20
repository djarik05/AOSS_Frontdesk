import type { Appointment, ArrivalStatus, BookingStatus } from '../types';
import { mockAppointments } from '../mocks';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'frontdesk_appointments';

function getStoredAppointments(): Appointment[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed reading appointments from localStorage', e);
  }
  // Initial fallback to mock data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAppointments));
  return mockAppointments;
}

function saveAppointments(appointments: Appointment[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  } catch (e) {
    console.error('Failed saving appointments to localStorage', e);
  }
}

export interface AppointmentFilterParams {
  date?: string;
  dentistId?: string;
  bookingStatus?: BookingStatus;
  arrivalStatus?: ArrivalStatus;
  searchQuery?: string;
}

export class AppointmentsService {
  public async listAppointments(filters?: AppointmentFilterParams): Promise<Appointment[]> {
    await apiClient.simulateLatency(100, 250);
    let items = getStoredAppointments();

    if (filters?.date) {
      items = items.filter((a) => a.date === filters.date);
    }
    if (filters?.dentistId && filters.dentistId !== 'all') {
      items = items.filter((a) => a.dentistId === filters.dentistId);
    }
    if (filters?.bookingStatus) {
      items = items.filter((a) => a.bookingStatus === filters.bookingStatus);
    }
    if (filters?.arrivalStatus) {
      items = items.filter((a) => a.arrivalStatus === filters.arrivalStatus);
    }
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      items = items.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          a.typeName.toLowerCase().includes(q) ||
          a.dentistName.toLowerCase().includes(q)
      );
    }

    // Default sort by date, then startTime
    return items.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
  }

  public async getAppointmentById(id: string): Promise<Appointment | null> {
    await apiClient.simulateLatency(80, 180);
    const items = getStoredAppointments();
    return items.find((a) => a.id === id) || null;
  }

  public async checkConflict(
    dentistId: string,
    date: string,
    startTime: string,
    durationMinutes: number,
    excludeAppointmentId?: string
  ): Promise<Appointment | null> {
    await apiClient.simulateLatency(50, 100);
    const items = getStoredAppointments();

    // Calculate end time in minutes from midnight
    const [startH, startM] = startTime.split(':').map(Number);
    const newStart = startH * 60 + startM;
    const newEnd = newStart + durationMinutes;

    for (const apt of items) {
      if (apt.id === excludeAppointmentId) continue;
      if (apt.dentistId !== dentistId || apt.date !== date) continue;
      if (apt.bookingStatus === 'cancelled') continue;

      const [aptH, aptM] = apt.startTime.split(':').map(Number);
      const aptStart = aptH * 60 + aptM;
      const aptEnd = aptStart + apt.duration;

      // Overlap condition
      if (newStart < aptEnd && newEnd > aptStart) {
        return apt;
      }
    }
    return null;
  }

  public async createAppointment(
    data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Appointment> {
    await apiClient.simulateLatency(150, 300);
    const items = getStoredAppointments();

    const now = new Date().toISOString();
    const newApt: Appointment = {
      ...data,
      id: `apt-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    items.unshift(newApt);
    saveAppointments(items);
    return newApt;
  }

  public async updateAppointment(
    id: string,
    updates: Partial<Appointment>
  ): Promise<Appointment> {
    await apiClient.simulateLatency(120, 250);
    const items = getStoredAppointments();
    const index = items.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Appointment not found');

    const updated = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    items[index] = updated;
    saveAppointments(items);
    return updated;
  }

  public async rescheduleAppointment(
    id: string,
    date: string,
    startTime: string,
    duration?: number
  ): Promise<Appointment> {
    const items = getStoredAppointments();
    const apt = items.find((a) => a.id === id);
    if (!apt) throw new Error('Appointment not found');

    const dur = duration ?? apt.duration;
    const [h, m] = startTime.split(':').map(Number);
    const endMinutes = h * 60 + m + dur;
    const endH = Math.floor(endMinutes / 60)
      .toString()
      .padStart(2, '0');
    const endM = (endMinutes % 60).toString().padStart(2, '0');
    const endTime = `${endH}:${endM}`;

    return this.updateAppointment(id, {
      date,
      startTime,
      endTime,
      duration: dur,
      bookingStatus: 'rescheduled',
    });
  }

  public async cancelAppointment(id: string, notes?: string): Promise<Appointment> {
    return this.updateAppointment(id, {
      bookingStatus: 'cancelled',
      notes: notes ? `Cancelled: ${notes}` : 'Cancelled by staff',
    });
  }

  public async updateArrivalStatus(
    id: string,
    arrivalStatus: ArrivalStatus
  ): Promise<Appointment> {
    return this.updateAppointment(id, { arrivalStatus });
  }

  public async updateBookingStatus(
    id: string,
    bookingStatus: BookingStatus
  ): Promise<Appointment> {
    return this.updateAppointment(id, { bookingStatus });
  }

  public resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEY);
    saveAppointments(mockAppointments);
  }
}

export const appointmentsService = new AppointmentsService();
