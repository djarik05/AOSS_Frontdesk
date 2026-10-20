import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Building2,
  Clock,
  Sparkles,
  Users,
  Calendar,
  UserCheck,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';
import { FormField } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { useToast } from '@/components/feedback/Toast';

const steps = [
  { id: 1, title: 'Clinic Information', icon: Building2 },
  { id: 2, title: 'Business Hours', icon: Clock },
  { id: 3, title: 'Appointment Types', icon: Calendar },
  { id: 4, title: 'Dentist Profiles', icon: Users },
  { id: 5, title: 'Staff Members', icon: UserCheck },
  { id: 6, title: 'AI Receptionist', icon: Sparkles },
  { id: 7, title: 'Review & Finish', icon: CheckCircle2 },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [clinicName, setClinicName] = useState('Mehta Dental Studio');
  const [clinicAddress, setClinicAddress] = useState('42 MG Road, Indiranagar, Bangalore 560038');
  const [clinicPhone, setClinicPhone] = useState('+91 80 2558 1234');
  const [clinicEmail, setClinicEmail] = useState('contact@mehtadental.com');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');

  // Business hours
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('19:00');
  const [saturdayHalfDay, setSaturdayHalfDay] = useState(true);

  // Appointment types
  const [appointmentTypes, setAppointmentTypes] = useState([
    { name: 'Initial Consultation', duration: 30, fee: 500 },
    { name: 'Routine Cleaning & Scaling', duration: 45, fee: 1200 },
    { name: 'Root Canal Therapy', duration: 60, fee: 4500 },
  ]);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDuration, setNewTypeDuration] = useState(30);
  const [newTypeFee, setNewTypeFee] = useState(1000);

  // Dentists
  const [dentists, setDentists] = useState([
    { name: 'Dr. Rohan Mehta', specialization: 'Prosthodontics & Implantology', regNo: 'KDC-18492' },
    { name: 'Dr. Ananya Rao', specialization: 'Endodontics & Restorative', regNo: 'KDC-22104' },
  ]);

  // Staff
  const [staff, setStaff] = useState([
    { name: 'Kavitha Sundaram', role: 'Head Receptionist', email: 'kavitha@mehtadental.com' },
    { name: 'Amit Joshi', role: 'Operations Manager', email: 'amit@mehtadental.com' },
  ]);

  // AI settings
  const [aiName, setAiName] = useState('AOSS FrontDesk Assistant');
  const [aiTone, setAiTone] = useState<'friendly' | 'professional' | 'formal'>('professional');
  const [aiGreeting, setAiGreeting] = useState(
    'Hello! Welcome to Mehta Dental Studio. I can assist you with clinic hours, consultation fees, or booking an appointment. How can I help today?'
  );

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Finish onboarding
      localStorage.setItem('aoss_onboarding_completed', 'true');
      toast.success('Onboarding complete!', 'Welcome to AOSS FrontDesk Dental Suite');
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleAddType = () => {
    if (!newTypeName.trim()) return;
    setAppointmentTypes((prev) => [
      ...prev,
      { name: newTypeName.trim(), duration: newTypeDuration, fee: newTypeFee },
    ]);
    setNewTypeName('');
  };

  const handleRemoveType = (index: number) => {
    setAppointmentTypes((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-bg-main py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
      {/* Container */}
      <div className="w-full max-w-3xl">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent-violet flex items-center justify-center text-white font-extrabold text-sm shadow-md">
              A
            </div>
            <span className="font-extrabold text-lg tracking-tight text-text-primary">
              AOSS <span className="text-accent-violet">FrontDesk</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Clinic Onboarding Wizard
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Configure your dental clinic portal and AI receptionist profile
          </p>
        </div>

        {/* Steps Progress Bar */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex items-center justify-between min-w-[550px]">
            {steps.map((st) => {
              const isDone = st.id < currentStep;
              const isCurrent = st.id === currentStep;
              return (
                <div key={st.id} className="flex flex-col items-center flex-1 relative">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 z-10 ${
                      isDone
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                        : isCurrent
                        ? 'bg-accent-violet text-white shadow-lg shadow-accent-violet/30 ring-4 ring-accent-violet/20'
                        : 'bg-white border border-border text-text-muted'
                    }`}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : st.id}
                  </div>
                  <span
                    className={`text-[10px] font-semibold mt-2 text-center whitespace-nowrap ${
                      isCurrent ? 'text-accent-violet' : isDone ? 'text-text-primary' : 'text-text-muted'
                    }`}
                  >
                    {st.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Card */}
        <div className="bg-white rounded-3xl border border-border shadow-[0_8px_30px_rgba(33,22,79,0.04)] p-6 sm:p-10 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: Clinic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-text-primary">1. Clinic Information</h3>
                  <p className="text-xs text-text-secondary mb-4">
                    Provide the official identity and public contact details of your practice.
                  </p>

                  <FormField label="Practice / Clinic Name" required>
                    <input
                      type="text"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-border text-sm"
                    />
                  </FormField>

                  <FormField label="Official Address" required>
                    <input
                      type="text"
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-border text-sm"
                    />
                  </FormField>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Primary Clinic Phone" required>
                      <input
                        type="text"
                        value={clinicPhone}
                        onChange={(e) => setClinicPhone(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-border text-sm"
                      />
                    </FormField>
                    <FormField label="Public Email Address" required>
                      <input
                        type="email"
                        value={clinicEmail}
                        onChange={(e) => setClinicEmail(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-border text-sm"
                      />
                    </FormField>
                  </div>
                </div>
              )}

              {/* Step 2: Business Hours */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-text-primary">2. Operating Hours</h3>
                  <p className="text-xs text-text-secondary">
                    These hours will be used by the AI Receptionist to answer patient schedule inquiries.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Monday - Friday Open Time">
                      <input
                        type="time"
                        value={openTime}
                        onChange={(e) => setOpenTime(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-border text-sm"
                      />
                    </FormField>
                    <FormField label="Monday - Friday Closing Time">
                      <input
                        type="time"
                        value={closeTime}
                        onChange={(e) => setCloseTime(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-border text-sm"
                      />
                    </FormField>
                  </div>

                  <div className="p-4 rounded-2xl bg-bg-main border border-border space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saturdayHalfDay}
                        onChange={(e) => setSaturdayHalfDay(e.target.checked)}
                        className="h-4 w-4 rounded text-accent-violet"
                      />
                      <span className="text-xs font-semibold text-text-primary">
                        Saturday half-day operating hours (9:00 AM - 2:00 PM)
                      </span>
                    </label>
                    <p className="text-[11px] text-text-secondary">
                      Sunday: Closed for routine appointments (emergencies escalated via on-call receptionist)
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Appointment Types */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-text-primary">3. Appointment Catalog</h3>
                  <p className="text-xs text-text-secondary">
                    Configure standard dental procedures and booking slot durations.
                  </p>

                  <div className="space-y-2">
                    {appointmentTypes.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-bg-main"
                      >
                        <div>
                          <p className="text-xs font-bold text-text-primary">{t.name}</p>
                          <p className="text-[11px] text-text-secondary">
                            Duration: {t.duration} mins • Fee: ₹{t.fee}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveType(idx)}
                          className="p-1.5 text-text-muted hover:text-rose-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add new type form */}
                  <div className="p-4 rounded-2xl border border-dashed border-border bg-white space-y-3">
                    <p className="text-xs font-bold text-text-primary">Add Appointment Type</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Procedure name"
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                        className="h-9 px-3 rounded-lg border border-border text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Minutes"
                        value={newTypeDuration}
                        onChange={(e) => setNewTypeDuration(Number(e.target.value))}
                        className="h-9 px-3 rounded-lg border border-border text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Fee (₹)"
                        value={newTypeFee}
                        onChange={(e) => setNewTypeFee(Number(e.target.value))}
                        className="h-9 px-3 rounded-lg border border-border text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddType}
                      className="px-3 py-1.5 rounded-lg bg-accent-lavender text-accent-violet text-xs font-semibold hover:bg-accent-lavender/80 flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Type
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Dentist Profiles */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-text-primary">4. Dentist Roster</h3>
                  <p className="text-xs text-text-secondary">
                    Registered clinical practitioners providing treatment at this clinic.
                  </p>

                  <div className="space-y-3">
                    {dentists.map((d, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl border border-border bg-bg-main flex items-center gap-3.5"
                      >
                        <div className="h-10 w-10 rounded-xl bg-accent-violet text-white font-bold text-sm flex items-center justify-center shrink-0">
                          {d.name.split(' ')[1]?.[0] || 'D'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text-primary">{d.name}</p>
                          <p className="text-[11px] text-accent-violet font-semibold">{d.specialization}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">Dental Council Reg: {d.regNo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Staff Members */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-text-primary">5. Front Desk Staff & Roles</h3>
                  <p className="text-xs text-text-secondary">
                    Operational team handling receptionist handover and appointment schedules.
                  </p>

                  <div className="space-y-3">
                    {staff.map((s, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl border border-border bg-bg-main flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-text-primary">{s.name}</p>
                          <p className="text-[11px] text-text-secondary">{s.role}</p>
                        </div>
                        <span className="text-xs text-text-muted">{s.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: AI Receptionist */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-text-primary">6. AI Receptionist Setup</h3>
                  <p className="text-xs text-text-secondary">
                    Configure your 24/7 intelligent dental practice receptionist.
                  </p>

                  <FormField label="Assistant Name">
                    <input
                      type="text"
                      value={aiName}
                      onChange={(e) => setAiName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-border text-sm"
                    />
                  </FormField>

                  <FormField label="Tone of Voice">
                    <div className="grid grid-cols-3 gap-3">
                      {(['friendly', 'professional', 'formal'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setAiTone(t)}
                          className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                            aiTone === t
                              ? 'border-accent-violet bg-accent-lavender text-accent-violet shadow-xs'
                              : 'border-border bg-white text-text-secondary hover:bg-bg-main'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <FormField label="Opening Greeting">
                    <textarea
                      rows={3}
                      value={aiGreeting}
                      onChange={(e) => setAiGreeting(e.target.value)}
                      className="w-full p-3 rounded-xl border border-border text-xs leading-relaxed"
                    />
                  </FormField>
                </div>
              )}

              {/* Step 7: Review & Finish */}
              {currentStep === 7 && (
                <div className="space-y-5">
                  <div className="text-center py-2">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-extrabold text-text-primary">Ready to Launch!</h3>
                    <p className="text-xs text-text-secondary mt-1">
                      Review your initial clinic configuration before opening your dashboard.
                    </p>
                  </div>

                  <div className="divide-y divide-border rounded-2xl border border-border bg-bg-main text-xs p-4 space-y-3">
                    <div className="flex justify-between pt-2">
                      <span className="text-text-secondary">Clinic Name</span>
                      <span className="font-bold text-text-primary">{clinicName}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-text-secondary">Business Hours</span>
                      <span className="font-semibold text-text-primary">Mon-Fri {openTime} - {closeTime}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-text-secondary">Appointment Types</span>
                      <span className="font-semibold text-text-primary">{appointmentTypes.length} types registered</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-text-secondary">Dentists Active</span>
                      <span className="font-semibold text-text-primary">{dentists.length} practitioners</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-text-secondary">AI Assistant</span>
                      <span className="font-bold text-accent-violet">{aiName} ({aiTone})</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-border">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent-violet hover:bg-sidebar-highlight text-white text-xs sm:text-sm font-semibold shadow-md shadow-accent-violet/20 transition-all active:scale-95"
            >
              {currentStep === 7 ? 'Launch Your Clinic' : 'Continue'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
