import React, { useState, useEffect } from 'react';
import {
  Clock,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Sparkles,
  Bot,
  Settings,
} from 'lucide-react';

import { PageHeader } from '@/components/navigation/PageHeader';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { SearchInput } from '@/components/forms/SearchInput';
import { SelectField } from '@/components/forms/SelectField';
import { useToast } from '@/components/feedback/Toast';

import { reportsService } from '@/services/reports.service';
import type { ActivityLog } from '@/types';

export default function ActivityPage() {
  const toast = useToast();

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const loadLogs = async () => {
    try {
      const data = await reportsService.listActivityLogs({
        actionType: actionFilter,
        actorRole: roleFilter,
      });
      setLogs(data);
    } catch (e) {
      toast.error('Failed to load activity logs');
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter, roleFilter]);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.actor.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      <PageHeader
        breadcrumb="Compliance • Audit Trail"
        title="Activity Log"
        subtitle="Searchable audit trail of operational, clinical, and automated AI receptionist events."
      />

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-border shadow-xs">
        <SearchInput
          placeholder="Search activity, actor, or event details..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <SelectField
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full sm:w-44"
            options={[
              { value: 'all', label: 'All Action Types' },
              { value: 'appointment', label: 'Appointments' },
              { value: 'patient', label: 'Patient Directory' },
              { value: 'conversation', label: 'Enquiries' },
              { value: 'reminder', label: 'Reminders' },
              { value: 'ai-config', label: 'AI Configurations' },
            ]}
          />

          <SelectField
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-36"
            options={[
              { value: 'all', label: 'All Actors' },
              { value: 'owner', label: 'Dr. Mehta' },
              { value: 'receptionist', label: 'Receptionist' },
              { value: 'dentist', label: 'Associate Dentist' },
            ]}
          />
        </div>
      </div>

      {/* Activity Table */}
      <div className="rounded-2xl border border-border bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-main/60 text-text-secondary font-bold uppercase tracking-wider text-[11px]">
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Result</th>
                <th className="px-5 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    No activity logs found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-bg-main/50 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap text-text-secondary">
                      {new Date(log.timestamp).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-lg bg-accent-lavender text-accent-violet font-bold text-[10px] flex items-center justify-center">
                          {log.actor[0]}
                        </span>
                        <span className="font-bold text-text-primary">{log.actor}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-text-primary whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap capitalize text-text-secondary">
                      {log.actionType}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          log.result === 'success'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            log.result === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {log.result}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-text-secondary max-w-sm">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
