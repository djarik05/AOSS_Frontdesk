export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  dentistId: string;
  dentistName: string;
  typeId: string;
  typeName: string;
  typeColor: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  roomId?: string;
  roomName?: string;
  bookingStatus: BookingStatus;
  arrivalStatus: ArrivalStatus;
  source: AppointmentSource;
  notes?: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'rescheduled' | 'no-show' | 'completed';
export type ArrivalStatus = 'not-arrived' | 'arrived' | 'checked-in' | 'with-dentist' | 'completed';
export type AppointmentSource = 'phone' | 'walk-in' | 'online' | 'whatsapp' | 'ai-receptionist';
