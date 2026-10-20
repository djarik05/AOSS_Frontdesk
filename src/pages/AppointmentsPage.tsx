import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Filter,
  Search,
  List,
  CalendarDays,
  User,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  ExternalLink,
} from 'lucide-react';

import { PageHeader } from '@/components/navigation/PageHeader';
import { TabBar } from '@/components/navigation/TabBar';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { Modal } from '@/components/dialogs/Modal';
import { Drawer } from '@/components/dialogs/Drawer';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { FormField } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { SearchInput } from '@/components/forms/SearchInput';
import { useToast } from '@/components/feedback/Toast';

import { appointmentsService } from '@/services/appointments.service';
import { patientsService } from '@/services/patients.service';
import type { Appointment, ArrivalStatus, BookingStatus, Patient } from '@/types';

export default function AppointmentsPage() {
  const toast = useToast();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDentist, setSelectedDentist] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState('2026-10-20');

  // Modal / Drawer states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Form states
  const [formPatientName, setFormPatientName] = useState('');
  const [formDentistId, setFormDentistId] = useState('d1');
  const [formTypeName, setFormTypeName] = useState('Consultation');
  const [formDate, setFormDate] = useState('2026-10-20');
  const [formStartTime, setFormStartTime] = useState('11:00');
  const [formDuration, setFormDuration] = useState(30);
  const [formNotes, setFormNotes] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [list, pList] = await Promise.all([
        appointmentsService.listAppointments(),
        patientsService.listPatients(),
      ]);
      setAppointments(list);
      setPatients(pList);
    } catch (e) {
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (selectedDentist !== 'all' && apt.dentistId !== selectedDentist) return false;
    if (selectedStatus !== 'all' && apt.bookingStatus !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchPatient = apt.patientName.toLowerCase().includes(q);
      const matchDentist = apt.dentistName.toLowerCase().includes(q);
      const matchType = apt.typeName.toLowerCase().includes(q);
      if (!matchPatient && !matchDentist && !matchType) return false;
    }
    return true;
  });

  // Conflict detection in form
  useEffect(() => {
    if (!isNewModalOpen) return;
    const check = async () => {
      const conflict = await appointmentsService.checkConflict(
        formDentistId,
        formDate,
        formStartTime,
        formDuration
      );
      if (conflict) {
        setConflictWarning(
          `Conflict: ${conflict.dentistName} has booking with ${conflict.patientName} at ${conflict.startTime}`
        );
      } else {
        setConflictWarning(null);
      }
    };
    check();
  }, [formDentistId, formDate, formStartTime, formDuration, isNewModalOpen]);

  // Form submit
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPatientName.trim()) {
      toast.error('Patient name required');
      return;
    }

    try {
      const dentistName = formDentistId === 'd1' ? 'Dr. Mehta' : 'Dr. Ananya Rao';
      const [h, m] = formStartTime.split(':').map(Number);
      const endM = h * 60 + m + formDuration;
      const endHStr = Math.floor(endM / 60).toString().padStart(2, '0');
      const endMStr = (endM % 60).toString().padStart(2, '0');
      const endTime = `${endHStr}:${endMStr}`;

      const created = await appointmentsService.createAppointment({
        patientId: `p-${Date.now()}`,
        patientName: formPatientName.trim(),
        dentistId: formDentistId,
        dentistName,
        typeId: 'type-std',
        typeName: formTypeName,
        typeColor: formTypeName === 'Consultation' ? '#7658E8' : '#34D399',
        date: formDate,
        startTime: formStartTime,
        endTime,
        duration: formDuration,
        roomId: 'r1',
        roomName: 'Operatory 1',
        bookingStatus: 'confirmed',
        arrivalStatus: 'not-arrived',
        source: 'walk-in',
        notes: formNotes,
        reminderSent: true,
      });

      toast.success('Appointment created (Demo)', `${created.patientName} at ${created.startTime}`);
      setIsNewModalOpen(false);
      setFormPatientName('');
      setFormNotes('');
      loadData();
    } catch (e) {
      toast.error('Failed to create appointment');
    }
  };

  const handleUpdateArrival = async (aptId: string, status: ArrivalStatus) => {
    try {
      await appointmentsService.updateArrivalStatus(aptId, status);
      toast.success('Status updated', `Patient arrival marked: ${status}`);
      loadData();
      if (selectedApt && selectedApt.id === aptId) {
        setSelectedApt((prev) => (prev ? { ...prev, arrivalStatus: status } : null));
      }
    } catch (e) {
      toast.error('Status update failed');
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelTargetId) return;
    try {
      await appointmentsService.cancelAppointment(cancelTargetId);
      toast.success('Appointment cancelled (Demo)');
      setCancelTargetId(null);
      setSelectedApt(null);
      loadData();
    } catch (e) {
      toast.error('Failed to cancel');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <PageHeader
        breadcrumb="Operations • Scheduling"
        title="Appointments"
        subtitle="Manage your clinic schedule, bookings, and patient arrivals."
        actions={
          <>
            <button
              onClick={() => {
                setSelectedDate('2026-10-20');
                toast.info('Viewing schedule for Oct 20, 2026');
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-border text-xs font-semibold text-text-primary hover:bg-bg-main"
            >
              Today
            </button>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-violet hover:bg-sidebar-highlight text-white text-xs sm:text-sm font-semibold shadow-md shadow-accent-violet/20"
            >
              <Plus className="h-4 w-4" />
              New Appointment
            </button>
          </>
        }
      />

      {/* Control bar: Views & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-border shadow-xs">
        {/* View switcher tabs */}
        <TabBar
          tabs={[
            { id: 'list', label: 'Table View', icon: <List className="h-4 w-4" /> },
            { id: 'calendar', label: 'Calendar View', icon: <CalendarDays className="h-4 w-4" /> },
          ]}
          activeTab={viewMode}
          onChange={(tab) => setViewMode(tab as any)}
        />

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            placeholder="Search patient, doctor, or procedure..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full sm:w-64"
          />

          <SelectField
            value={selectedDentist}
            onChange={(e) => setSelectedDentist(e.target.value)}
            className="w-40"
            options={[
              { value: 'all', label: 'All Dentists' },
              { value: 'd1', label: 'Dr. Mehta' },
              { value: 'd2', label: 'Dr. Ananya Rao' },
            ]}
          />

          <SelectField
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-40"
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'pending', label: 'Pending' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
        </div>
      </div>

      {/* View 1: List / Table View */}
      {viewMode === 'list' && (
        <div className="rounded-2xl border border-border bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-main/60 text-text-secondary font-bold uppercase tracking-wider text-[11px]">
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-5 py-3.5">Procedure</th>
                  <th className="px-5 py-3.5">Dentist</th>
                  <th className="px-5 py-3.5">Room</th>
                  <th className="px-5 py-3.5">Booking</th>
                  <th className="px-5 py-3.5">Arrival</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-text-muted">
                      No matching appointments found.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr
                      key={apt.id}
                      onClick={() => setSelectedApt(apt)}
                      className="hover:bg-bg-main/50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-text-primary">{apt.startTime}</span>
                        <span className="text-text-muted text-xs block">{apt.date}</span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-text-primary whitespace-nowrap">
                        {apt.patientName}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: apt.typeColor }}
                          />
                          {apt.typeName}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary whitespace-nowrap">
                        {apt.dentistName}
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary whitespace-nowrap">
                        {apt.roomName || 'Operatory 1'}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <StatusBadge status={apt.bookingStatus} />
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <StatusBadge status={apt.arrivalStatus} />
                      </td>
                      <td
                        className="px-5 py-3.5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {apt.arrivalStatus === 'not-arrived' && (
                            <button
                              onClick={() => handleUpdateArrival(apt.id, 'arrived')}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] transition-colors"
                            >
                              Arrived
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedApt(apt)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-black/5"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Calendar Schedule View */}
      {viewMode === 'calendar' && (
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <h3 className="text-base font-bold text-text-primary">
              Clinic Daily Schedule — {selectedDate}
            </h3>
            <span className="text-xs text-text-muted">
              Click any slot or card to view appointment details
            </span>
          </div>

          <div className="space-y-3">
            {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map(
              (hour) => {
                const hourApts = filteredAppointments.filter(
                  (a) => a.date === selectedDate && a.startTime.startsWith(hour.slice(0, 2))
                );

                return (
                  <div
                    key={hour}
                    className="flex items-start gap-4 p-3 rounded-xl border border-border/60 hover:border-accent-violet/30 bg-bg-main/40 transition-all"
                  >
                    <div className="w-16 font-extrabold text-xs text-text-secondary pt-2">
                      {hour}
                    </div>
                    <div className="flex-1 flex flex-wrap gap-3">
                      {hourApts.length === 0 ? (
                        <div className="text-xs text-text-muted/60 py-2 italic">
                          Slot available for booking
                        </div>
                      ) : (
                        hourApts.map((apt) => (
                          <div
                            key={apt.id}
                            onClick={() => setSelectedApt(apt)}
                            className="p-3 rounded-xl bg-white border border-border shadow-xs hover:shadow-md hover:border-accent-violet transition-all cursor-pointer min-w-[220px]"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-xs text-text-primary">
                                {apt.patientName}
                              </span>
                              <span className="text-[10px] text-text-muted font-semibold">
                                {apt.startTime} ({apt.duration}m)
                              </span>
                            </div>
                            <p className="text-xs font-medium text-accent-violet">{apt.typeName}</p>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-[10px]">
                              <span className="text-text-secondary">{apt.dentistName}</span>
                              <StatusBadge status={apt.arrivalStatus} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Modal: New Appointment */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Schedule Appointment"
        subtitle="Create a new dental appointment in demo mode"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4">
          {conflictWarning && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{conflictWarning}</span>
            </div>
          )}

          <FormField label="Patient Name" required>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Verma"
              value={formPatientName}
              onChange={(e) => setFormPatientName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-border text-sm"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Dentist" required>
              <SelectField
                value={formDentistId}
                onChange={(e) => setFormDentistId(e.target.value)}
                options={[
                  { value: 'd1', label: 'Dr. Mehta' },
                  { value: 'd2', label: 'Dr. Ananya Rao' },
                ]}
              />
            </FormField>
            <FormField label="Procedure Type" required>
              <SelectField
                value={formTypeName}
                onChange={(e) => setFormTypeName(e.target.value)}
                options={[
                  { value: 'Consultation', label: 'Consultation (30m)' },
                  { value: 'Cleaning', label: 'Cleaning (45m)' },
                  { value: 'Root Canal', label: 'Root Canal (60m)' },
                  { value: 'Filling', label: 'Composite Filling (45m)' },
                  { value: 'Follow-up', label: 'Follow-up (20m)' },
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Date" required>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border text-xs"
              />
            </FormField>
            <FormField label="Start Time" required>
              <input
                type="time"
                required
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border text-xs"
              />
            </FormField>
            <FormField label="Duration (m)" required>
              <input
                type="number"
                value={formDuration}
                onChange={(e) => setFormDuration(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-border text-xs"
              />
            </FormField>
          </div>

          <FormField label="Administrative Notes">
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. Patient mentioned mild sensitivity"
              className="w-full p-3 rounded-xl border border-border text-xs"
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-black/5 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-accent-violet hover:bg-sidebar-highlight text-white text-xs font-semibold shadow-md shadow-accent-violet/20"
            >
              Create Booking
            </button>
          </div>
        </form>
      </Modal>

      {/* Drawer: Appointment Details */}
      <Drawer
        isOpen={Boolean(selectedApt)}
        onClose={() => setSelectedApt(null)}
        title="Appointment Information"
        subtitle={selectedApt ? `${selectedApt.patientName} • ${selectedApt.date}` : ''}
        footer={
          selectedApt && (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setCancelTargetId(selectedApt.id)}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
              >
                Cancel Booking
              </button>
              <button
                onClick={() => handleUpdateArrival(selectedApt.id, 'completed')}
                className="px-4 py-2 rounded-xl bg-accent-violet text-white text-xs font-semibold"
              >
                Complete Visit
              </button>
            </div>
          )
        }
      >
        {selectedApt && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-bg-main border border-border">
              <div>
                <p className="text-[11px] text-text-muted">Booking State</p>
                <div className="mt-1">
                  <StatusBadge status={selectedApt.bookingStatus} />
                </div>
              </div>
              <div>
                <p className="text-[11px] text-text-muted">Patient Arrival</p>
                <div className="mt-1">
                  <StatusBadge status={selectedApt.arrivalStatus} />
                </div>
              </div>
            </div>

            {/* Quick Status Buttons */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Change Arrival Status
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(['not-arrived', 'arrived', 'checked-in', 'with-dentist'] as ArrivalStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateArrival(selectedApt.id, st)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        selectedApt.arrivalStatus === st
                          ? 'border-accent-violet bg-accent-lavender/60 text-accent-violet font-bold'
                          : 'border-border bg-white text-text-secondary hover:bg-bg-main'
                      }`}
                    >
                      {st.replace('-', ' ').toUpperCase()}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between py-2 border-b border-border/70">
                <span className="text-text-secondary">Patient</span>
                <span className="font-bold text-text-primary">{selectedApt.patientName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/70">
                <span className="text-text-secondary">Dentist</span>
                <span className="font-semibold text-text-primary">{selectedApt.dentistName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/70">
                <span className="text-text-secondary">Time Slot</span>
                <span className="font-semibold text-text-primary">
                  {selectedApt.startTime} - {selectedApt.endTime} ({selectedApt.duration} mins)
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/70">
                <span className="text-text-secondary">Procedure</span>
                <span className="font-bold text-accent-violet">{selectedApt.typeName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/70">
                <span className="text-text-secondary">Assigned Room</span>
                <span className="font-semibold text-text-primary">{selectedApt.roomName || 'Operatory 1'}</span>
              </div>
            </div>

            {selectedApt.notes && (
              <div className="p-3.5 rounded-xl bg-bg-main border border-border">
                <p className="text-[11px] font-bold text-text-secondary uppercase mb-1">
                  Reception Notes
                </p>
                <p className="text-xs text-text-primary leading-relaxed">{selectedApt.notes}</p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Confirmation Dialog for Cancel */}
      <ConfirmDialog
        isOpen={Boolean(cancelTargetId)}
        onClose={() => setCancelTargetId(null)}
        onConfirm={handleCancelConfirm}
        title="Cancel Appointment (Demo)"
        message="Are you sure you want to cancel this appointment in the demonstration schedule? This will update the status locally."
        confirmText="Yes, Cancel Booking"
        variant="danger"
      />
    </div>
  );
}
