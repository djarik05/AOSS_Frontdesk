import React, { useState, useEffect } from 'react';
import {
  Building2,
  Clock,
  Calendar,
  Layers,
  Bell,
  Sparkles,
  Radio,
  Users,
  Database,
  Save,
  Trash2,
  Plus,
  RotateCcw,
  AlertTriangle,
  Info,
} from 'lucide-react';

import { PageHeader } from '@/components/navigation/PageHeader';
import { InfoCard } from '@/components/cards/InfoCard';
import { FormField } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { useToast } from '@/components/feedback/Toast';

import { clinicService } from '@/services/clinic.service';
import type { Clinic } from '@/types';

export default function SettingsPage() {
  const toast = useToast();

  const [activeSection, setActiveSection] = useState('profile');
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');

  const loadClinic = async () => {
    try {
      const data = await clinicService.getClinic();
      setClinic(data);
      setName(data.name);
      setAddress(data.address);
      setPhone(data.phone);
      setEmail(data.email);
      setWebsite(data.website || 'https://mehtadental.com');
    } catch (e) {
      toast.error('Failed to load clinic settings');
    }
  };

  useEffect(() => {
    loadClinic();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await clinicService.updateClinic({
        name,
        address,
        phone,
        email,
        website,
      });
      toast.success('Clinic profile saved locally');
      loadClinic();
    } catch (e) {
      toast.error('Failed to save settings');
    }
  };

  const handleResetAllData = () => {
    // Clear localStorage for frontdesk
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('frontdesk_') || k.startsWith('aoss_'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    toast.success('Demo data reset to factory defaults');
    setIsResetDialogOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (!clinic) return null;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      <PageHeader
        breadcrumb="Clinic Configuration • Portal"
        title="Clinic Settings"
        subtitle="Manage clinic identity, hours, chair schedules, communication providers, and system storage."
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar (Vertical tabs) */}
        <div className="md:col-span-1 bg-white rounded-2xl border border-border p-2 space-y-1 shadow-xs">
          {[
            { id: 'profile', label: 'Clinic Profile', icon: Building2 },
            { id: 'hours', label: 'Business Hours', icon: Clock },
            { id: 'types', label: 'Appointment Types', icon: Calendar },
            { id: 'rooms', label: 'Rooms & Chairs', icon: Layers },
            { id: 'channels', label: 'Communication Channels', icon: Radio },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'data', label: 'Data & Storage', icon: Database },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-accent-violet text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-main'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Setting Content Section */}
        <div className="md:col-span-3">
          {activeSection === 'profile' && (
            <InfoCard
              title="Clinic Profile & Public Identity"
              subtitle="Official information shown on appointment confirmations and receptionist responses"
            >
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <FormField label="Practice Name" required>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-border text-sm"
                  />
                </FormField>

                <FormField label="Official Address" required>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-border text-sm"
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Direct Phone" required>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-border text-sm"
                    />
                  </FormField>
                  <FormField label="Reception Email" required>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-border text-sm"
                    />
                  </FormField>
                </div>

                <FormField label="Clinic Website">
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-border text-sm"
                  />
                </FormField>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-accent-violet hover:bg-sidebar-highlight text-white text-xs sm:text-sm font-semibold shadow-md shadow-accent-violet/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </InfoCard>
          )}

          {activeSection === 'hours' && (
            <InfoCard
              title="Operating Schedule"
              subtitle="Weekly schedule used for booking slot validation"
            >
              <div className="divide-y divide-border/60 text-xs">
                {clinic.businessHours.map((h) => (
                  <div key={h.day} className="py-3 flex items-center justify-between">
                    <span className="font-bold text-text-primary capitalize w-28">
                      {h.day}
                    </span>
                    <span className={`font-semibold ${h.isOpen ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {h.isOpen ? `${h.openTime} – ${h.closeTime}` : 'Closed'}
                    </span>
                    <span className="text-text-muted">
                      {h.isOpen ? 'Standard slots active' : 'No bookings'}
                    </span>
                  </div>
                ))}
              </div>
            </InfoCard>
          )}

          {activeSection === 'types' && (
            <InfoCard
              title="Appointment Catalog"
              subtitle="Manage standard consultation procedures, fee structures, and slot lengths"
            >
              <div className="space-y-3">
                {clinic.appointmentTypes.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-border bg-bg-main/40 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: t.color }} />
                      <div>
                        <p className="font-bold text-text-primary">{t.name}</p>
                        <p className="text-text-secondary text-[11px]">{t.duration} minutes</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-accent-violet">₹{t.fee || 500}</span>
                  </div>
                ))}
              </div>
            </InfoCard>
          )}

          {activeSection === 'rooms' && (
            <InfoCard
              title="Rooms & Operatories"
              subtitle="Dental chairs and treatment suites configured at Mehta Dental Studio"
            >
              <div className="space-y-3">
                {clinic.rooms.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl border border-border bg-bg-main/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-text-primary">{r.name}</p>
                      <p className="text-text-secondary capitalize">{r.type} room</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                      Active Chair
                    </span>
                  </div>
                ))}
              </div>
            </InfoCard>
          )}

          {activeSection === 'channels' && (
            <InfoCard
              title="External Communication Integrations"
              subtitle="Connect WhatsApp Business API, SMS Gateways, and transactional email"
            >
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl border border-border bg-white flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-text-primary">WhatsApp Business Cloud API</h4>
                    <p className="text-text-secondary text-[11px] mt-0.5">
                      Status: <span className="font-semibold text-text-muted">Not Connected (Demo Simulation Active)</span>
                    </p>
                  </div>
                  <button
                    disabled
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 font-semibold cursor-not-allowed"
                    title="Available when backend is ready"
                  >
                    Connect Provider
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-border bg-white flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-text-primary">Transactional SMS Gateway</h4>
                    <p className="text-text-secondary text-[11px] mt-0.5">
                      Status: <span className="font-semibold text-text-muted">Not Connected (Demo Simulation Active)</span>
                    </p>
                  </div>
                  <button
                    disabled
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 font-semibold cursor-not-allowed"
                    title="Available when backend is ready"
                  >
                    Connect Provider
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-border bg-white flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-text-primary">Clinic Email SMTP</h4>
                    <p className="text-text-secondary text-[11px] mt-0.5">
                      Status: <span className="font-bold text-accent-violet">Demo Simulation Mode</span>
                    </p>
                  </div>
                  <button
                    disabled
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 font-semibold cursor-not-allowed"
                  >
                    Configured in Demo
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-bg-main border border-border text-[11px] text-text-secondary leading-relaxed">
                  <strong>Notice:</strong> To ensure high security and compliance with the Phase 1 specifications, external API credentials and live communication services are intentionally excluded until the backend deployment phase.
                </div>
              </div>
            </InfoCard>
          )}

          {activeSection === 'notifications' && (
            <InfoCard
              title="Notification Alert Preferences"
              subtitle="Configure automated staff alerts when new enquiries or high-priority tasks arise"
            >
              <div className="space-y-4 text-xs">
                {[
                  { title: 'New AI Enquiry Notification', desc: 'Alert reception desk when an incoming message is received.' },
                  { title: 'Emergency Escalation Alert', desc: 'Notify duty dentist immediately if clinical keywords are identified.' },
                  { title: 'Daily Schedule Digest', desc: 'Send daily summary of booked appointments at 8:00 AM.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/60 last:border-0">
                    <div>
                      <p className="font-bold text-text-primary">{item.title}</p>
                      <p className="text-text-secondary text-[11px]">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded text-accent-violet"
                    />
                  </div>
                ))}
              </div>
            </InfoCard>
          )}

          {activeSection === 'data' && (
            <InfoCard
              title="Demonstration Data & Reset"
              subtitle="Manage browser storage state and reset local demo modifications"
            >
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-bg-main border border-border space-y-2">
                  <p className="font-bold text-text-primary">Local Storage Status</p>
                  <p className="text-text-secondary leading-relaxed">
                    AOSS FrontDesk saves all appointment creations, patient records, staff changes, and AI settings directly to your browser's local storage so changes persist across page reloads.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setIsResetDialogOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold transition-colors"
                  >
                    <RotateCcw className="h-4 w-4 text-rose-600" />
                    Reset All Demo Data to Factory Defaults
                  </button>
                </div>
              </div>
            </InfoCard>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleResetAllData}
        title="Reset Demo Data"
        message="This will clear all locally stored appointments, patient records, and configurations, restoring the original demonstration dataset."
        confirmText="Yes, Reset Everything"
        variant="danger"
      />
    </div>
  );
}
