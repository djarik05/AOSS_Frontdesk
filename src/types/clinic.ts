export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  tagline?: string;
  timezone: string;
  currency: string;
  businessHours: BusinessHours[];
  rooms: Room[];
  appointmentTypes: AppointmentType[];
}

export interface BusinessHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface Room {
  id: string;
  name: string;
  type: 'operatory' | 'consultation' | 'xray' | 'hygiene';
  isActive: boolean;
}

export interface AppointmentType {
  id: string;
  name: string;
  duration: number; // minutes
  color: string;
  description?: string;
  fee?: number;
  isActive: boolean;
}
