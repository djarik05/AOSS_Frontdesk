import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  MessageSquare,
  PhoneForwarded,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  CalendarDays,
  FileText,
  User,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import { PageHeader } from '@/components/navigation/PageHeader';
import { StatCard } from '@/components/cards/StatCard';
import { InfoCard } from '@/components/cards/InfoCard';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { Modal } from '@/components/dialogs/Modal';
import { Drawer } from '@/components/dialogs/Drawer';
import { FormField } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { useToast } from '@/components/feedback/Toast';

import { appointmentsService } from '@/services/appointments.service';
import { reportsService } from '@/services/reports.service';
import { patientsService } from '@/services/patients.service';
import type { Appointment, ArrivalStatus, BookingStatus, Patient } from '@/types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [selectedDate, setSelectedDate] = useState('2026-10-20');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [enquiryCategories, setEnquiryCategories] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Drawers state
  const [isNewAptModalOpen, setIsNewAptModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // New appointment form state
  const [newPatientName, setNewPatientName] = useState('');
  const [newDentistId, setNewDentistId] = useState('d1');
  const [newTypeName, setNewTypeName] = useState('Consultation');
  const [newStartTime, setNewStartTime] = useState('11:00');
  const [newDuration, setNewDuration] = useState(30);
  const [newNotes, setNewNotes] = useState('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [aptList, stats, enquiries, logs] = await Promise.all([
        appointmentsService.listAppointments({ date: selectedDate }),
        reportsService.getWeeklyAppointmentStats(),
        reportsService.getEnquiryCategories(),
        reportsService.listActivityLogs(),
      ]);
      setAppointments(aptList);
      setWeeklyStats(stats);
      setEnquiryCategories(enquiries);
      setActivityLogs(logs.slice(0, 5));
    } catch (e) {
      console.error(e);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Check for appointment conflicts when form values change
  useEffect(() => {
    if (!isNewAptModalOpen) return;
    const check = async () => {
      const conflict = await appointmentsService.checkConflict(
        newDentistId,
        selectedDate,
        newStartTime,
        newDuration
      );
      if (conflict) {
        setConflictWarning(
          `Dr. ${conflict.dentistName} already has an appointment with ${conflict.patientName} at ${conflict.startTime}`
        );
      } else {
        setConflictWarning(null);
      }
    };
    check();
  }, [newDentistId, selectedDate, newStartTime, newDuration, isNewAptModalOpen]);

  // Handle appointment creation
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) {
      toast.error('Validation error', 'Please enter a patient name');
      return;
    }

    try {
      const dentistName = newDentistId === 'd1' ? 'Dr. Mehta' : 'Dr. Ananya Rao';
      const [h, m] = newStartTime.split(':').map(Number);
      const endMins = h * 60 + m + newDuration;
      const endH = Math.floor(endMins / 60).toString().padStart(2, '0');
      const endM = (endMins % 60).toString().padStart(2, '0');
      const endTime = `${endH}:${endM}`;

      const created = await appointmentsService.createAppointment({
        patientId: `p-${Date.now()}`,
        patientName: newPatientName.trim(),
        dentistId: newDentistId,
        dentistName,
        typeId: 'type-custom',
        typeName: newTypeName,
        typeColor: newTypeName === 'Consultation' ? '#7658E8' : '#34D399',
        date: selectedDate,
        startTime: newStartTime,
        endTime,
        duration: newDuration,
        roomId: 'r1',
        roomName: 'Operatory 1',
        bookingStatus: 'confirmed',
        arrivalStatus: 'not-arrived',
        source: 'online',
        notes: newNotes,
        reminderSent: true,
      });

      // Also log activity
      await reportsService.logActivity({
        actor: 'Dr. Mehta',
        actorRole: 'owner',
        action: `Booked demo appointment for ${created.patientName}`,
        actionType: 'appointment',
        relatedRecord: created.id,
        relatedRecordType: 'appointment',
        result: 'success',
        details: `${created.typeName} on ${created.date} at ${created.startTime}`,
      });

      toast.success('Appointment created (Demo)', `${created.patientName} at ${created.startTime}`);
      setIsNewAptModalOpen(false);
      setNewPatientName('');
      setNewNotes('');
      loadData();
    } catch (e) {
      toast.error('Error creating appointment');
    }
  };

  // Status quick update from table
  const handleUpdateArrivalStatus = async (
    aptId: string,
    status: ArrivalStatus
  ) => {
    try {
      await appointmentsService.updateArrivalStatus(aptId, status);
      toast.success('Status updated', `Patient status changed to: ${status}`);
      loadData();
      if (selectedAppointment && selectedAppointment.id === aptId) {
        setSelectedAppointment((prev) => (prev ? { ...prev, arrivalStatus: status } : null));
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleUpdateBookingStatus = async (
    aptId: string,
    status: BookingStatus
  ) => {
    try {
      await appointmentsService.updateBookingStatus(aptId, status);
      toast.success('Booking status updated', `Changed to: ${status}`);
      loadData();
      if (selectedAppointment && selectedAppointment.id === aptId) {
        setSelectedAppointment((prev) => (prev ? { ...prev, bookingStatus: status } : null));
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  // View patient profile drawer
  const handleOpenPatientProfile = async (patientName: string) => {
    const patients = await patientsService.listPatients();
    const found = patients.find((p) => p.fullName.toLowerCase() === patientName.toLowerCase());
    if (found) {
      setSelectedPatient(found);
    } else {
      // Mock patient detail on the fly
      setSelectedPatient({
        id: 'p-temp',
        firstName: patientName.split(' ')[0] || patientName,
        lastName: patientName.split(' ')[1] || '',
        fullName: patientName,
        email: `${patientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: '+91 98765 00000',
        status: 'active',
        source: 'online',
        communicationPreference: 'whatsapp',
        consentGiven: true,
        createdAt: '2026-10-01T10:00:00Z',
        updatedAt: '2026-10-20T10:00:00Z',
        totalVisits: 1,
      });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Top Header */}
      <PageHeader
        breadcrumb="Mehta Dental Studio • Bengaluru"
        title={`${getGreeting()}, Dr. Mehta`}
        subtitle="Here is your clinic's administrative overview and operations schedule."
        actions={
          <>
            {/* Date filter */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-border shadow-xs">
              <CalendarIcon className="h-4 w-4 text-accent-violet" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-semibold text-text-primary bg-transparent focus:outline-none cursor-pointer"
              />
            </div>

            {/* Refresh button */}
            <button
              onClick={() => {
                loadData();
                toast.info('Dashboard refreshed', 'Loaded latest local demo state');
              }}
              className="p-2 rounded-xl bg-white border border-border hover:bg-bg-main text-text-secondary transition-colors"
              title="Refresh demo data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            {/* New Appointment button */}
            <button
              onClick={() => setIsNewAptModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-violet hover:bg-sidebar-highlight text-white text-xs sm:text-sm font-semibold shadow-md shadow-accent-violet/20 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              New Appointment
            </button>
          </>
        }
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Appointments Today"
          value={appointments.length || 6}
          subtitle="Mehta Dental Studio"
          icon={CalendarDays}
          accentColor="#7658E8"
          trendText="+12% (demo)"
          trendType="positive"
          onClick={() => navigate('/appointments')}
        />
        <StatCard
          title="Awaiting Confirmation"
          value={appointments.filter((a) => a.bookingStatus === 'pending').length || 2}
          subtitle="Follow-up needed"
          icon={Clock}
          accentColor="#FBBF24"
          trendText="Action item"
          trendType="neutral"
          onClick={() => navigate('/appointments?filter=pending')}
        />
        <StatCard
          title="New Enquiries"
          value="3"
          subtitle="AI Assistant Handling"
          icon={MessageSquare}
          accentColor="#F472B6"
          trendText="Live chat active"
          trendType="neutral"
          onClick={() => navigate('/inbox')}
        />
        <StatCard
          title="Follow-ups Due"
          value="4"
          subtitle="Post-treatment recall"
          icon={PhoneForwarded}
          accentColor="#34D399"
          trendText="2 high priority"
          trendType="neutral"
          onClick={() => navigate('/tasks')}
        />
      </div>

      {/* Analytics Section: Two Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel A: Appointment Activity (Bar Chart) */}
        <InfoCard
          className="lg:col-span-2"
          title="Weekly Appointment Volume"
          subtitle="Distributed across days of the week (simulated clinic metrics)"
          action={
            <button
              onClick={() => navigate('/reports')}
              className="text-xs font-semibold text-accent-violet hover:text-sidebar-highlight flex items-center gap-1"
            >
              Full Report <ExternalLink className="h-3 w-3" />
            </button>
          }
        >
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE7F2" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#77748C', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#77748C', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(118, 88, 232, 0.05)' }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#EAE7F2',
                    boxShadow: '0 8px 24px rgba(33,22,79,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="appointments" fill="#7658E8" radius={[6, 6, 0, 0]} name="Appointments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </InfoCard>

        {/* Panel B: Enquiry Overview (Donut Chart) */}
        <InfoCard
          title="AI Reception Enquiries"
          subtitle="Incoming patient requests by intent"
          action={
            <button
              onClick={() => navigate('/inbox')}
              className="text-xs font-semibold text-accent-violet hover:text-sidebar-highlight flex items-center gap-1"
            >
              Open Inbox <ChevronRight className="h-3 w-3" />
            </button>
          }
        >
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={enquiryCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {enquiryCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#EAE7F2',
                    boxShadow: '0 8px 24px rgba(33,22,79,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </InfoCard>
      </div>

      {/* Main Grid: Today's Schedule & FrontDesk Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule (2 cols) */}
        <InfoCard
          className="lg:col-span-2"
          title={`Today's Schedule — ${selectedDate}`}
          subtitle={`${appointments.length} appointments scheduled`}
          action={
            <button
              onClick={() => navigate('/appointments')}
              className="text-xs font-semibold text-accent-violet hover:underline flex items-center gap-1"
            >
              View Full Schedule <ChevronRight className="h-3.5 w-3.5" />
            </button>
          }
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-main/60 text-text-secondary font-bold uppercase tracking-wider text-[11px]">
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Dentist</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Arrival</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-text-muted">
                      No appointments scheduled for this date.
                    </td>
                  </tr>
                ) : (
                  appointments.map((apt) => (
                    <tr
                      key={apt.id}
                      className="hover:bg-bg-main/50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedAppointment(apt)}
                    >
                      <td className="px-5 py-3.5 font-bold text-text-primary whitespace-nowrap">
                        {apt.startTime}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPatientProfile(apt.patientName);
                          }}
                          className="font-semibold text-text-primary hover:text-accent-violet transition-colors text-left"
                        >
                          {apt.patientName}
                        </button>
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
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <StatusBadge status={apt.bookingStatus} />
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <StatusBadge status={apt.arrivalStatus} />
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {apt.arrivalStatus === 'not-arrived' && (
                            <button
                              onClick={() => handleUpdateArrivalStatus(apt.id, 'arrived')}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] transition-colors"
                              title="Mark Arrived"
                            >
                              Arrived
                            </button>
                          )}
                          {apt.arrivalStatus === 'arrived' && (
                            <button
                              onClick={() => handleUpdateArrivalStatus(apt.id, 'with-dentist')}
                              className="px-2 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold text-[11px] transition-colors"
                              title="Mark With Dentist"
                            >
                              In Chair
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedAppointment(apt)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-black/5 transition-colors"
                            title="View Details"
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
        </InfoCard>

        {/* FrontDesk Recent Activity Feed */}
        <InfoCard
          title="FrontDesk Activity"
          subtitle="Automated & staff operations log"
          action={
            <button
              onClick={() => navigate('/activity')}
              className="text-xs font-semibold text-accent-violet hover:underline"
            >
              All Events
            </button>
          }
        >
          <div className="space-y-4">
            {activityLogs.map((log, idx) => (
              <motion.div
                key={log.id || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-lavender/60 text-accent-violet text-xs font-bold mt-0.5">
                  {log.actorRole === 'owner' ? 'DR' : 'AI'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary leading-tight">
                    {log.action}
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5 truncate">
                    {log.details}
                  </p>
                </div>
                <span className="text-[10px] text-text-muted shrink-0">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Demo'}
                </span>
              </motion.div>
            ))}
          </div>
        </InfoCard>
      </div>

      {/* Modal: New Appointment Creation */}
      <Modal
        isOpen={isNewAptModalOpen}
        onClose={() => setIsNewAptModalOpen(false)}
        title="Schedule New Appointment"
        subtitle="Book a clinic consultation, cleaning, or procedure (Demo Mode)"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4">
          {conflictWarning && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-semibold">Schedule Conflict Detected</p>
                <p className="mt-0.5">{conflictWarning}</p>
              </div>
            </div>
          )}

          <FormField label="Patient Full Name" required>
            <input
              type="text"
              required
              placeholder="e.g. Priya Sharma"
              value={newPatientName}
              onChange={(e) => setNewPatientName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-border bg-white text-sm focus:ring-2 focus:ring-accent-violet/30 focus:border-accent-violet"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Dentist" required>
              <SelectField
                value={newDentistId}
                onChange={(e) => setNewDentistId(e.target.value)}
                options={[
                  { value: 'd1', label: 'Dr. Mehta (Clinic Owner)' },
                  { value: 'd2', label: 'Dr. Ananya Rao (Associate)' },
                ]}
              />
            </FormField>

            <FormField label="Appointment Type" required>
              <SelectField
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                options={[
                  { value: 'Consultation', label: 'Initial Consultation (30m)' },
                  { value: 'Cleaning', label: 'Scaling & Polishing (45m)' },
                  { value: 'Root Canal', label: 'Root Canal Treatment (60m)' },
                  { value: 'Filling', label: 'Composite Filling (45m)' },
                  { value: 'Teeth Whitening', label: 'Teeth Whitening (60m)' },
                  { value: 'Follow-up', label: 'Follow-up Check (20m)' },
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Date" required>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border text-xs sm:text-sm bg-white"
              />
            </FormField>

            <FormField label="Start Time" required>
              <input
                type="time"
                required
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border text-xs sm:text-sm bg-white"
              />
            </FormField>

            <FormField label="Duration (minutes)" required>
              <input
                type="number"
                step="5"
                min="10"
                max="180"
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-border text-xs sm:text-sm bg-white"
              />
            </FormField>
          </div>

          <FormField label="Administrative Reception Notes" helpText="Visible to front desk staff and dentists">
            <textarea
              rows={2}
              placeholder="e.g. Patient mentioned mild sensitivity on lower right molar"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-border text-xs sm:text-sm focus:ring-2 focus:ring-accent-violet/30"
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsNewAptModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-accent-violet hover:bg-sidebar-highlight text-white text-xs sm:text-sm font-semibold shadow-md shadow-accent-violet/20"
            >
              Create Appointment
            </button>
          </div>
        </form>
      </Modal>

      {/* Drawer: Appointment Detail */}
      <Drawer
        isOpen={Boolean(selectedAppointment)}
        onClose={() => setSelectedAppointment(null)}
        title="Appointment Record"
        subtitle={selectedAppointment ? `${selectedAppointment.patientName} • Ref #${selectedAppointment.id}` : ''}
        footer={
          selectedAppointment && (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => {
                  handleUpdateBookingStatus(selectedAppointment.id, 'cancelled');
                  setSelectedAppointment(null);
                }}
                className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors"
              >
                Cancel Appointment
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleUpdateArrivalStatus(selectedAppointment.id, 'completed');
                    setSelectedAppointment(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-accent-violet text-white text-xs font-semibold hover:bg-sidebar-highlight shadow-sm"
                >
                  Mark Completed
                </button>
              </div>
            </div>
          )
        }
      >
        {selectedAppointment && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-bg-main border border-border">
              <div>
                <p className="text-xs text-text-secondary">Booking Status</p>
                <div className="mt-1">
                  <StatusBadge status={selectedAppointment.bookingStatus} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-secondary">Arrival State</p>
                <div className="mt-1">
                  <StatusBadge status={selectedAppointment.arrivalStatus} />
                </div>
              </div>
            </div>

            {/* Quick arrival status switcher */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                Update Patient Arrival
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['not-arrived', 'arrived', 'checked-in', 'with-dentist'] as ArrivalStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateArrivalStatus(selectedAppointment.id, st)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                        selectedAppointment.arrivalStatus === st
                          ? 'border-accent-violet bg-accent-lavender/50 text-accent-violet'
                          : 'border-border bg-white text-text-secondary hover:bg-bg-main'
                      }`}
                    >
                      {st.replace('-', ' ').toUpperCase()}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between py-2 border-b border-border/70 text-xs">
                <span className="text-text-secondary">Patient</span>
                <span className="font-bold text-text-primary">{selectedAppointment.patientName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/70 text-xs">
                <span className="text-text-secondary">Dentist</span>
                <span className="font-semibold text-text-primary">{selectedAppointment.dentistName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/70 text-xs">
                <span className="text-text-secondary">Date & Time</span>
                <span className="font-semibold text-text-primary">
                  {selectedAppointment.date} at {selectedAppointment.startTime} - {selectedAppointment.endTime} ({selectedAppointment.duration} mins)
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/70 text-xs">
                <span className="text-text-secondary">Room / Chair</span>
                <span className="font-semibold text-text-primary">{selectedAppointment.roomName || 'Operatory 1'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/70 text-xs">
                <span className="text-text-secondary">Booking Source</span>
                <span className="font-semibold text-text-primary uppercase">{selectedAppointment.source}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/70 text-xs">
                <span className="text-text-secondary">Automated Reminder</span>
                <span className="font-semibold text-emerald-600">Simulated Sent (WhatsApp)</span>
              </div>
            </div>

            {selectedAppointment.notes && (
              <div className="p-3.5 rounded-xl bg-bg-main border border-border">
                <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  Reception Notes
                </p>
                <p className="text-xs text-text-primary leading-relaxed">{selectedAppointment.notes}</p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Drawer: Patient Contact Profile */}
      <Drawer
        isOpen={Boolean(selectedPatient)}
        onClose={() => setSelectedPatient(null)}
        title="Patient Profile"
        subtitle={selectedPatient?.fullName || ''}
      >
        {selectedPatient && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-bg-main border border-border">
              <div className="h-14 w-14 rounded-2xl bg-accent-lavender text-accent-violet font-extrabold text-xl flex items-center justify-center">
                {selectedPatient.firstName[0]}
                {selectedPatient.lastName ? selectedPatient.lastName[0] : ''}
              </div>
              <div>
                <h4 className="text-base font-bold text-text-primary">{selectedPatient.fullName}</h4>
                <p className="text-xs text-text-secondary mt-0.5">{selectedPatient.phone}</p>
                <div className="mt-2">
                  <StatusBadge status={selectedPatient.status} label={selectedPatient.status.toUpperCase()} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border/70 text-xs">
                <span className="text-text-secondary">Email</span>
                <span className="font-medium text-text-primary">{selectedPatient.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/70 text-xs">
                <span className="text-text-secondary">Address</span>
                <span className="font-medium text-text-primary text-right max-w-xs">{selectedPatient.address || 'Bengaluru, India'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/70 text-xs">
                <span className="text-text-secondary">Preferred Channel</span>
                <span className="font-bold text-accent-violet uppercase">{selectedPatient.communicationPreference}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/70 text-xs">
                <span className="text-text-secondary">Total Visits</span>
                <span className="font-bold text-text-primary">{selectedPatient.totalVisits}</span>
              </div>
            </div>

            {selectedPatient.notes && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900">
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-1">Clinic Notice</p>
                <p className="text-xs leading-relaxed">{selectedPatient.notes}</p>
              </div>
            )}

            <button
              onClick={() => {
                navigate('/appointments');
              }}
              className="w-full py-2.5 rounded-xl bg-bg-main border border-border hover:bg-black/5 text-xs font-semibold text-text-primary transition-colors flex items-center justify-center gap-2"
            >
              <CalendarIcon className="h-4 w-4 text-accent-violet" />
              Schedule for this Patient
            </button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
