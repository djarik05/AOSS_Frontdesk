export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
  status: PatientStatus;
  source: PatientSource;
  communicationPreference: CommunicationPreference;
  consentGiven: boolean;
  createdAt: string;
  updatedAt: string;
  lastVisit?: string;
  nextAppointment?: string;
  totalVisits: number;
  avatar?: string;
}

export type PatientStatus = 'active' | 'inactive' | 'new';
export type PatientSource = 'walk-in' | 'referral' | 'online' | 'phone' | 'whatsapp' | 'ai-receptionist';
export type CommunicationPreference = 'whatsapp' | 'sms' | 'email' | 'phone' | 'any';
