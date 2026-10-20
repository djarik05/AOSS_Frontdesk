import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { PageHeader } from '@/components/navigation/PageHeader';
import { InfoCard } from '@/components/cards/InfoCard';
import { useToast } from '@/components/feedback/Toast';
import { reportsService } from '@/services/reports.service';

const appointmentVolumeData = [
  { date: 'Oct 14', appointments: 7, enquiries: 12 },
  { date: 'Oct 15', appointments: 9, enquiries: 15 },
  { date: 'Oct 16', appointments: 6, enquiries: 10 },
  { date: 'Oct 17', appointments: 11, enquiries: 18 },
  { date: 'Oct 18', appointments: 8, enquiries: 14 },
  { date: 'Oct 19', appointments: 10, enquiries: 16 },
  { date: 'Oct 20', appointments: 6, enquiries: 11 },
];

const bookingStatusData = [
  { name: 'Confirmed', count: 48, color: '#34D399' },
  { name: 'Completed', count: 32, color: '#7658E8' },
  { name: 'Pending', count: 8, color: '#FBBF24' },
  { name: 'Cancelled', count: 4, color: '#F87171' },
  { name: 'No Show', count: 2, color: '#94A3B8' },
];

const cancellationsReasonData = [
  { reason: 'Patient Busy / Travel', count: 8 },
  { reason: 'Felt Better / No Pain', count: 4 },
  { reason: 'Weather / Traffic', count: 3 },
  { reason: 'Rescheduled Slot', count: 12 },
];

const aiOutcomesData = [
  { category: 'Hours & Location', autoAnswered: 42, escalated: 1 },
  { category: 'Fee Schedule', autoAnswered: 38, escalated: 2 },
  { category: 'Slot Availability', autoAnswered: 29, escalated: 4 },
  { category: 'Emergency Pain', autoAnswered: 0, escalated: 9 },
];

export default function ReportsPage() {
  const toast = useToast();
  const [timeRange, setTimeRange] = useState('7d');

  const handleExportCSV = () => {
    reportsService.exportCSV('frontdesk_analytics_report', [
      { Metric: 'Total Appointments Scheduled', Value: 67 },
      { Metric: 'Completed Consultations', Value: 45 },
      { Metric: 'AI Enquiries Processed', Value: 118 },
      { Metric: 'Automated Reminders Delivered', Value: 94 },
      { Metric: 'No-Show Rate', Value: '2.9%' },
      { Metric: 'Cancellation Rate', Value: '5.8%' },
    ]);
    toast.success('Report exported (CSV downloaded)');
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      <PageHeader
        breadcrumb="Analytics • Practice Metrics"
        title="Reports & Clinic Insights"
        subtitle="Operational metrics across appointment volume, enquiry resolution, and reminder delivery."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-border text-xs font-semibold">
              {(['7d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    timeRange === r
                      ? 'bg-accent-violet text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent-violet hover:bg-sidebar-highlight text-white text-xs font-semibold shadow-md shadow-accent-violet/20"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        }
      />

      {/* Demo Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/60 text-purple-900 text-xs flex items-center gap-2.5">
        <Info className="h-4 w-4 text-accent-violet shrink-0" />
        <span>
          <strong>Demonstration Metrics:</strong> The analytical figures below are simulated to illustrate SaaS dashboard reporting for dental clinics.
        </span>
      </div>

      {/* Grid 1: Volume Trend & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InfoCard
          className="lg:col-span-2"
          title="Appointment & Enquiry Trend"
          subtitle="Daily booking volume compared with AI receptionist enquiries"
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={appointmentVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE7F2" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#77748C', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#77748C', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#EAE7F2',
                    boxShadow: '0 8px 24px rgba(33,22,79,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line
                  type="monotone"
                  dataKey="appointments"
                  stroke="#7658E8"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#7658E8' }}
                  name="Appointments Booked"
                />
                <Line
                  type="monotone"
                  dataKey="enquiries"
                  stroke="#F472B6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  name="AI Inquiries Handled"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </InfoCard>

        <InfoCard
          title="Booking Status Distribution"
          subtitle="Proportion of clinic appointments by outcome"
        >
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {bookingStatusData.map((entry, index) => (
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
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </InfoCard>
      </div>

      {/* Grid 2: AI Action Outcomes & Cancellations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard
          title="AI Assistant Resolution vs Staff Hand-off"
          subtitle="Breakdown of inquiries resolved automatically vs escalated to reception"
        >
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiOutcomesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE7F2" />
                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#77748C', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#77748C', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#EAE7F2',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="autoAnswered" fill="#7658E8" radius={[4, 4, 0, 0]} name="Auto-Answered" />
                <Bar dataKey="escalated" fill="#FBBF24" radius={[4, 4, 0, 0]} name="Escalated to Staff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </InfoCard>

        <InfoCard
          title="Reasons for Rescheduling & Cancellation"
          subtitle="Patient feedback logged by front desk receptionists"
        >
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={cancellationsReasonData} margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EAE7F2" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#77748C', fontSize: 12 }} />
                <YAxis type="category" dataKey="reason" axisLine={false} tickLine={false} tick={{ fill: '#252238', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#EAE7F2',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#A78BFA" radius={[0, 4, 4, 0]} name="Occurrences" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </InfoCard>
      </div>
    </div>
  );
}
