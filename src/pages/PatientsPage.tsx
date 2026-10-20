import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  Clock,
  AlertTriangle,
  UserCheck,
  Edit2,
  ExternalLink,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

import { PageHeader } from '@/components/navigation/PageHeader';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { Modal } from '@/components/dialogs/Modal';
import { Drawer } from '@/components/dialogs/Drawer';
import { FormField } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { SearchInput } from '@/components/forms/SearchInput';
import { useToast } from '@/components/feedback/Toast';

import { patientsService } from '@/services/patients.service';
import { appointmentsService } from '@/services/appointments.service';
import type { Patient, Appointment } from '@/types';

export default function PatientsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [commPref, setCommPref] = useState<'whatsapp' | 'sms' | 'email' | 'phone'>('whatsapp');
  const [consentGiven, setConsentGiven] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pList, aList] = await Promise.all([
        patientsService.listPatients(),
        appointmentsService.listAppointments(),
      ]);
      setPatients(pList);
      setAppointments(aList);
    } catch (e) {
      toast.error('Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered patients
  const filteredPatients = patients.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.fullName.toLowerCase().includes(q);
      const matchEmail = p.email.toLowerCase().includes(q);
      const matchPhone = p.phone.includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  // Check for duplicate contact details
  useEffect(() => {
    if (!isAddModalOpen) return;
    const check = async () => {
      if (phone.length > 5 || email.length > 5) {
        const dup = await patientsService.checkDuplicate(phone, email);
        if (dup) {
          setDuplicateWarning(
            `A patient record already exists with matching contact details: "${dup.fullName}" (${dup.phone})`
          );
        } else {
          setDuplicateWarning(null);
        }
      }
    };
    check();
  }, [phone, email, isAddModalOpen]);

  // Handle Add Patient
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error('Validation error', 'First name is required');
      return;
    }

    try {
      const created = await patientsService.createPatient({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || `${firstName.toLowerCase()}@example.com`,
        phone: phone.trim() || '+91 98765 00000',
        gender,
        address: address.trim() || 'Bengaluru, India',
        notes: notes.trim(),
        status: 'new',
        source: 'walk-in',
        communicationPreference: commPref,
        consentGiven,
      });

      toast.success('Patient record created (Demo)', created.fullName);
      setIsAddModalOpen(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setNotes('');
      loadData();
    } catch (e) {
      toast.error('Failed to create patient');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      <PageHeader
        breadcrumb="Directory • Records"
        title="Patient Directory"
        subtitle="Manage clinic contact records, visit histories, and communication preferences."
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-violet hover:bg-sidebar-highlight text-white text-xs sm:text-sm font-semibold shadow-md shadow-accent-violet/20"
          >
            <Plus className="h-4 w-4" />
            Add Patient
          </button>
        }
      />

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-border shadow-xs">
        <SearchInput
          placeholder="Search by patient name, phone, or email..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <SelectField
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44"
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active Patients' },
              { value: 'new', label: 'New Patients' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </div>
      </div>

      {/* Patient Table */}
      <div className="rounded-2xl border border-border bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-main/60 text-text-secondary font-bold uppercase tracking-wider text-[11px]">
                <th className="px-5 py-3.5">Patient</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5">Last Visit</th>
                <th className="px-5 py-3.5">Next Appointment</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    No matching patients found.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className="hover:bg-bg-main/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-accent-lavender text-accent-violet font-bold text-xs flex items-center justify-center shrink-0">
                          {patient.firstName[0]}
                          {patient.lastName ? patient.lastName[0] : ''}
                        </div>
                        <div>
                          <p className="font-bold text-text-primary group-hover:text-accent-violet transition-colors">
                            {patient.fullName}
                          </p>
                          <p className="text-[11px] text-text-muted">
                            {patient.gender ? `${patient.gender} • ` : ''}
                            {patient.totalVisits} visits recorded
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="font-medium text-text-primary">{patient.phone}</p>
                      <p className="text-xs text-text-muted">{patient.email}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-text-secondary">
                      {patient.lastVisit || 'No prior visits'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {patient.nextAppointment ? (
                        <span className="font-semibold text-accent-violet">
                          {patient.nextAppointment}
                        </span>
                      ) : (
                        <span className="text-text-muted italic">None scheduled</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={patient.status} label={patient.status.toUpperCase()} />
                    </td>
                    <td
                      className="px-5 py-3.5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-main transition-colors"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Patient */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Patient"
        subtitle="Register administrative patient details for Mehta Dental Studio"
        maxWidth="lg"
      >
        <form onSubmit={handleAddPatient} className="space-y-4">
          {duplicateWarning && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Priya"
                className="w-full h-10 px-3.5 rounded-xl border border-border text-sm"
              />
            </FormField>
            <FormField label="Last Name">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Sharma"
                className="w-full h-10 px-3.5 rounded-xl border border-border text-sm"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone Number" required>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-10 px-3.5 rounded-xl border border-border text-sm"
              />
            </FormField>
            <FormField label="Email Address">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                className="w-full h-10 px-3.5 rounded-xl border border-border text-sm"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Gender">
              <SelectField
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                options={[
                  { value: 'female', label: 'Female' },
                  { value: 'male', label: 'Male' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </FormField>
            <FormField label="Preferred Communication">
              <SelectField
                value={commPref}
                onChange={(e) => setCommPref(e.target.value as any)}
                options={[
                  { value: 'whatsapp', label: 'WhatsApp (Recommended)' },
                  { value: 'sms', label: 'SMS' },
                  { value: 'phone', label: 'Phone Call' },
                  { value: 'email', label: 'Email' },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Residential Address">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Indiranagar, Bengaluru"
              className="w-full h-10 px-3.5 rounded-xl border border-border text-sm"
            />
          </FormField>

          <FormField label="Reception Notes (Non-clinical)">
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Anxious patient, requested morning appointments only"
              className="w-full p-3 rounded-xl border border-border text-xs"
            />
          </FormField>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="consent"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="h-4 w-4 rounded text-accent-violet"
            />
            <label htmlFor="consent" className="text-xs text-text-secondary cursor-pointer">
              Patient consented to administrative SMS & WhatsApp reminders (Demo)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-black/5 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-accent-violet hover:bg-sidebar-highlight text-white text-xs font-semibold shadow-md shadow-accent-violet/20"
            >
              Save Patient Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Drawer: Full Patient Profile */}
      <Drawer
        isOpen={Boolean(selectedPatient)}
        onClose={() => setSelectedPatient(null)}
        title="Patient Details"
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
                <p className="text-xs text-text-secondary">{selectedPatient.phone}</p>
                <div className="mt-2">
                  <StatusBadge status={selectedPatient.status} label={selectedPatient.status.toUpperCase()} />
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-border/70">
                <span className="text-text-secondary">Email</span>
                <span className="font-semibold text-text-primary">{selectedPatient.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/70">
                <span className="text-text-secondary">Address</span>
                <span className="font-semibold text-text-primary text-right max-w-xs">{selectedPatient.address || 'Bengaluru, India'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/70">
                <span className="text-text-secondary">Communication Channel</span>
                <span className="font-bold text-accent-violet uppercase">{selectedPatient.communicationPreference}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/70">
                <span className="text-text-secondary">Total Completed Visits</span>
                <span className="font-bold text-text-primary">{selectedPatient.totalVisits}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/70">
                <span className="text-text-secondary">Consent on Record</span>
                <span className="font-semibold text-emerald-600">Active</span>
              </div>
            </div>

            {selectedPatient.notes && (
              <div className="p-3.5 rounded-xl bg-bg-main border border-border">
                <p className="text-[11px] font-bold text-text-secondary uppercase mb-1">
                  Reception Notes
                </p>
                <p className="text-xs text-text-primary leading-relaxed">{selectedPatient.notes}</p>
              </div>
            )}

            {/* Past/Upcoming appointments for this patient */}
            <div className="space-y-3 pt-2">
              <h5 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Appointment History
              </h5>
              {appointments
                .filter((a) => a.patientName === selectedPatient.fullName)
                .map((a) => (
                  <div key={a.id} className="p-3 rounded-xl border border-border bg-white text-xs space-y-1">
                    <div className="flex justify-between font-bold text-text-primary">
                      <span>{a.typeName}</span>
                      <span className="text-accent-violet">{a.date}</span>
                    </div>
                    <div className="flex justify-between text-text-secondary text-[11px]">
                      <span>{a.dentistName} • {a.startTime}</span>
                      <StatusBadge status={a.bookingStatus} />
                    </div>
                  </div>
                ))}
            </div>

            <button
              onClick={() => {
                setSelectedPatient(null);
                navigate('/appointments');
              }}
              className="w-full py-2.5 rounded-xl bg-accent-violet hover:bg-sidebar-highlight text-white text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Book Appointment for this Patient
            </button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
