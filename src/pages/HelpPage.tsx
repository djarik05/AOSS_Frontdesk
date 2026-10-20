import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  BookOpen,
  Phone,
  Mail,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

import { PageHeader } from '@/components/navigation/PageHeader';
import { InfoCard } from '@/components/cards/InfoCard';

const faqs = [
  {
    q: 'How does the AI Receptionist handle patient appointment bookings?',
    a: 'The AI assistant checks current calendar availability configured for Mehta Dental Studio. When a patient inquires about open slots, it proposes confirmed openings and captures patient contact details to schedule provisional appointments for front desk review.',
  },
  {
    q: 'What happens if a patient mentions acute toothache or a medical emergency?',
    a: 'AOSS FrontDesk strictly adheres to clinical guardrails: it declines diagnosis and immediately escalates the enquiry to "Needs Staff Hand-off", alerting clinic receptionists and duty dentists.',
  },
  {
    q: 'Can I connect my clinic WhatsApp number directly?',
    a: 'WhatsApp Business Cloud API integration is designed to plug directly into the AOSS FrontDesk service layer once your backend infrastructure is deployed. During this demonstration phase, message interactions run in simulated local mode.',
  },
  {
    q: 'How do automated 24-hour reminders work?',
    a: 'Reminders are scheduled based on clinic configuration. Patients with confirmed bookings receive automated confirmation notices and day-before arrival alerts to minimize clinic no-show rates.',
  },
  {
    q: 'How can I switch between different staff perspective views in demo mode?',
    a: 'Navigate to the Team & Access page. Use the "Preview Portal as Different Role" banner to toggle between Clinic Owner, Front Desk Receptionist, Dentist, and Operations Manager.',
  },
  {
    q: 'Will my changes persist when I refresh the page?',
    a: 'Yes! All appointments created, patient edits, and AI settings are automatically persisted to your browser local storage. You can restore default values at any time using the Reset Demo Data button in Clinic Settings.',
  },
];

export default function HelpPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      <PageHeader
        breadcrumb="Support • Knowledge"
        title="Help & Support Centre"
        subtitle="Operational documentation, frequently asked questions, and platform guides for AOSS FrontDesk."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQs Accordion (2 cols) */}
        <InfoCard
          className="lg:col-span-2"
          title="Frequently Asked Questions"
          subtitle="Common operational questions regarding AI reception and front desk scheduling"
        >
          <div className="divide-y divide-border/60">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="py-3.5">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left font-bold text-xs sm:text-sm text-text-primary gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-accent-violet' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-2 text-xs text-text-secondary leading-relaxed bg-bg-main/50 p-3.5 rounded-xl border border-border/60">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </InfoCard>

        {/* Right Column: Plan & Contact */}
        <div className="space-y-6">
          <InfoCard
            title="Subscription & Plan"
            subtitle="Current clinic tier"
          >
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-accent-lavender/40 to-purple-50 border border-purple-200/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-accent-violet">Growth Plan</span>
                  <span className="px-2 py-0.5 rounded-full bg-accent-violet text-white text-[10px] font-bold">
                    Active
                  </span>
                </div>
                <p className="text-text-primary font-extrabold text-lg">
                  ₹2,499 <span className="text-xs font-normal text-text-muted">/ month</span>
                </p>
                <p className="text-[11px] text-text-secondary leading-tight">
                  Includes AI Receptionist, 2 Dental Chairs, Unlimited Patient Directory, and Automated WhatsApp Recall.
                </p>
              </div>

              <div className="pt-2 text-text-secondary space-y-1 text-[11px]">
                <p>Platform: <strong>AOSS FrontDesk Dental v2.4</strong></p>
                <p>Clinic: <strong>Mehta Dental Studio</strong></p>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title="Support Assistance"
            subtitle="Get in touch with AOSS support"
          >
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-main border border-border">
                <Mail className="h-4 w-4 text-accent-violet shrink-0" />
                <div>
                  <p className="font-bold text-text-primary">Email Support</p>
                  <p className="text-text-secondary text-[11px]">support@aossfrontdesk.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-main border border-border">
                <Phone className="h-4 w-4 text-accent-violet shrink-0" />
                <div>
                  <p className="font-bold text-text-primary">Dedicated Hotline</p>
                  <p className="text-text-secondary text-[11px]">+91 80 4900 1200 (9 AM - 7 PM IST)</p>
                </div>
              </div>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
