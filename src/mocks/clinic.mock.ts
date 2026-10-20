import type { Clinic } from '../types';

export const mockClinic: Clinic = {
  id: 'clinic1',
  name: 'Mehta Dental Studio',
  address: '23 Brigade Road, 2nd Floor, Ashok Nagar, Bangalore 560025',
  phone: '+91 080-4567-8901',
  email: 'hello@mehtadental.in',
  website: 'https://mehtadental.in',
  tagline: 'Gentle care, brilliant smiles.',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  businessHours: [
    { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '15:00' },
    { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '14:00' },
    { day: 'sunday', isOpen: false, openTime: '09:00', closeTime: '18:00' },
  ],
  rooms: [
    { id: 'r1', name: 'Operatory 1', type: 'operatory', isActive: true },
    { id: 'r2', name: 'Hygiene Room', type: 'hygiene', isActive: true },
    { id: 'r3', name: 'Consultation Room', type: 'consultation', isActive: true },
    { id: 'r4', name: 'X-Ray Room', type: 'xray', isActive: true },
  ],
  appointmentTypes: [
    { id: 'at1', name: 'Consultation', duration: 30, color: '#7658E8', description: 'General dental check-up and consultation', fee: 500, isActive: true },
    { id: 'at2', name: 'Cleaning', duration: 45, color: '#34D399', description: 'Professional teeth cleaning and scaling', fee: 1500, isActive: true },
    { id: 'at3', name: 'Root Canal', duration: 60, color: '#F87171', description: 'Root canal treatment per tooth', fee: 8000, isActive: true },
    { id: 'at4', name: 'Follow-up', duration: 20, color: '#FBBF24', description: 'Post-treatment follow-up visit', fee: 300, isActive: true },
    { id: 'at5', name: 'Teeth Whitening', duration: 60, color: '#60A5FA', description: 'In-office professional teeth whitening', fee: 6000, isActive: true },
    { id: 'at6', name: 'Filling', duration: 45, color: '#A78BFA', description: 'Composite or amalgam dental filling', fee: 2000, isActive: true },
    { id: 'at7', name: 'Extraction', duration: 30, color: '#F472B6', description: 'Simple tooth extraction', fee: 1500, isActive: true },
    { id: 'at8', name: 'Crown & Bridge', duration: 60, color: '#FB923C', description: 'Crown preparation and fitting', fee: 12000, isActive: true },
  ],
};
