import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  Send,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Plus,
  Filter,
  Calendar,
  Phone,
  MessageSquare,
  ShieldCheck,
  X,
} from 'lucide-react';

import { PageHeader } from '@/components/navigation/PageHeader';
import { StatCard } from '@/components/cards/StatCard';
import { InfoCard } from '@/components/cards/InfoCard';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { Modal } from '@/components/dialogs/Modal';
import { FormField } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { useToast } from '@/components/feedback/Toast';

import { remindersService } from '@/services/reminders.service';
import type { Reminder, ReminderStatus } from '@/types';

export default function RemindersPage() {
  const toast = useToast();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [type, setType] = useState<any>('pre-appointment');
  const [channel, setChannel] = useState<any>('whatsapp');
  const [scheduledAt, setScheduledAt] = useState('2026-10-21T09:00');
  const [message, setMessage] = useState('');

  // Configuration toggles
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [autoConfirmEnabled, setAutoConfirmEnabled] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await remindersService.listReminders(activeFilter);
      setReminders(list);
    } catch (e) {
      toast.error('Failed to load reminders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFilter]);

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    try {
      await remindersService.createReminder({
        patientId: `p-${Date.now()}`,
        patientName: patientName.trim(),
        type,
        channel,
        scheduledAt: new Date(scheduledAt).toISOString(),
        message: message.trim() || `Reminder: Your appointment at Mehta Dental Studio is confirmed.`,
      });

      toast.success('Reminder scheduled (Demo)');
      setIsNewModalOpen(false);
      setPatientName('');
      setMessage('');
      loadData();
    } catch (e) {
      toast.error('Failed to schedule reminder');
    }
  };

  const handleRetry = async (id: string) => {
    try {
      await remindersService.retrySimulation(id);
      toast.info('Simulated delivery retry successful');
      loadData();
    } catch (e) {
      toast.error('Retry failed');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await remindersService.updateStatus(id, 'cancelled');
      toast.info('Reminder cancelled (Demo)');
      loadData();
    } catch (e) {
      toast.error('Cancel failed');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      <PageHeader
        breadcrumb="Operations • Outreach"
        title="Reminders & Recall"
        subtitle="Automated appointment confirmations, 24-hour pre-visit alerts, and recall follow-ups."
        actions={
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-violet hover:bg-sidebar-highlight text-white text-xs sm:text-sm font-semibold shadow-md shadow-accent-violet/20"
          >
            <Plus className="h-4 w-4" />
            Create Reminder
          </button>
        }
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Scheduled"
          value={reminders.filter((r) => r.status === 'scheduled').length || 12}
          subtitle="Queue for upcoming 48 hours"
          icon={Clock}
          accentColor="#60A5FA"
        />
        <StatCard
          title="Sent in Demo"
          value="45"
          subtitle="Simulated deliveries"
          icon={Send}
          accentColor="#34D399"
        />
        <StatCard
          title="Awaiting Review"
          value="3"
          subtitle="No phone number or opt-out"
          icon={AlertTriangle}
          accentColor="#FBBF24"
        />
        <StatCard
          title="Failed in Demo"
          value="1"
          subtitle="Simulated network failure"
          icon={RotateCcw}
          accentColor="#F87171"
        />
      </div>

      {/* Configuration Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-border flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-text-primary">Clinic Quiet Hours (10:00 PM – 8:00 AM)</p>
            <p className="text-[11px] text-text-secondary">
              Hold automated outbound reminder notices until morning clinic opening.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
              quietHoursEnabled ? 'bg-accent-violet' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${
                quietHoursEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-border flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-text-primary">Instant Booking Confirmations</p>
            <p className="text-[11px] text-text-secondary">
              Queue WhatsApp message immediately upon booking creation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAutoConfirmEnabled(!autoConfirmEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
              autoConfirmEnabled ? 'bg-accent-violet' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${
                autoConfirmEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Records' },
          { id: 'scheduled', label: 'Scheduled' },
          { id: 'simulated-sent', label: 'Sent in Demo' },
          { id: 'failed', label: 'Failed' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveFilter(t.id)}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-colors ${
              activeFilter === t.id
                ? 'bg-accent-violet text-white shadow-xs'
                : 'bg-white border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Reminders Table */}
      <div className="rounded-2xl border border-border bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-main/60 text-text-secondary font-bold uppercase tracking-wider text-[11px]">
                <th className="px-5 py-3.5">Patient</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Scheduled Delivery</th>
                <th className="px-5 py-3.5">Channel</th>
                <th className="px-5 py-3.5">Simulation Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {reminders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    No reminder records found.
                  </td>
                </tr>
              ) : (
                reminders.map((rem) => (
                  <tr key={rem.id} className="hover:bg-bg-main/50 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="font-bold text-text-primary">{rem.patientName}</p>
                      <p className="text-[11px] text-text-muted line-clamp-1 max-w-xs">{rem.message}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-medium text-text-primary capitalize">
                      {rem.type.replace('-', ' ')}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-text-secondary">
                      {new Date(rem.scheduledAt).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-bold text-accent-violet uppercase text-xs">
                      {rem.channel}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={rem.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {rem.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(rem.id)}
                            className="px-2.5 py-1 rounded-lg bg-accent-lavender text-accent-violet font-semibold text-xs hover:bg-accent-lavender/70"
                          >
                            Retry
                          </button>
                        )}
                        {rem.status === 'scheduled' && (
                          <button
                            onClick={() => handleCancel(rem.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 font-semibold text-xs hover:bg-rose-100"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Reminder */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Schedule Reminder"
        subtitle="Queue an automated WhatsApp, SMS, or email notification (Demo)"
      >
        <form onSubmit={handleCreateReminder} className="space-y-4">
          <FormField label="Patient Name" required>
            <input
              type="text"
              required
              placeholder="e.g. Priya Sharma"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-border text-sm"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Reminder Type">
              <SelectField
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={[
                  { value: 'pre-appointment', label: '24h Pre-Appointment Notice' },
                  { value: 'appointment-confirmation', label: 'Booking Confirmation' },
                  { value: 'follow-up', label: 'Post-Treatment Follow-up' },
                  { value: 'recall', label: '6-Month Routine Recall' },
                ]}
              />
            </FormField>
            <FormField label="Delivery Channel">
              <SelectField
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                options={[
                  { value: 'whatsapp', label: 'WhatsApp (Simulated)' },
                  { value: 'sms', label: 'SMS (Simulated)' },
                  { value: 'email', label: 'Email (Simulated)' },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Scheduled Date & Time" required>
            <input
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border text-xs"
            />
          </FormField>

          <FormField label="Notification Content Template">
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Friendly reminder: Your dental cleaning appointment with Dr. Mehta is tomorrow at 10:00 AM."
              className="w-full p-3 rounded-xl border border-border text-xs leading-relaxed"
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
              Queue Reminder
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
