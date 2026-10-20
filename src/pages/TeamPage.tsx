import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Users,
  Plus,
  Shield,
  Clock,
  Mail,
  Phone,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

import { PageHeader } from '@/components/navigation/PageHeader';
import { TabBar } from '@/components/navigation/TabBar';
import { InfoCard } from '@/components/cards/InfoCard';
import { Modal } from '@/components/dialogs/Modal';
import { Drawer } from '@/components/dialogs/Drawer';
import { FormField } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { useToast } from '@/components/feedback/Toast';

import { teamService } from '@/services/team.service';
import type { User, Dentist, UserRole } from '@/types';

export default function TeamPage() {
  const toast = useToast();

  const [team, setTeam] = useState<(User | Dentist)[]>([]);
  const [activeRoleFilter, setActiveRoleFilter] = useState('all');
  const [currentDemoRole, setCurrentDemoRole] = useState<UserRole>('owner');

  // Modals & Drawers
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<(User | Dentist) | null>(null);

  // Invite Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('dentist');
  const [specialization, setSpecialization] = useState('General Dentistry');

  const loadTeam = async () => {
    try {
      const data = await teamService.listTeamMembers(activeRoleFilter);
      setTeam(data);
      setCurrentDemoRole(teamService.getCurrentRole());
    } catch (e) {
      toast.error('Failed to load team');
    }
  };

  useEffect(() => {
    loadTeam();
  }, [activeRoleFilter]);

  const handleSwitchDemoRole = (newRole: UserRole) => {
    teamService.setCurrentRole(newRole);
    setCurrentDemoRole(newRole);
    toast.success('Switched Demo Perspective', `Now viewing AOSS FrontDesk as: ${newRole.toUpperCase()}`);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;

    try {
      await teamService.inviteMember({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        specialization: role === 'dentist' ? specialization : undefined,
      });

      toast.success('Team member simulated invitation sent');
      setIsInviteModalOpen(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      loadTeam();
    } catch (e) {
      toast.error('Invitation failed');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const updated = await teamService.toggleActiveStatus(id);
      toast.info(`Status changed: ${updated.isActive ? 'Active' : 'Deactivated'}`);
      loadTeam();
      if (selectedMember && selectedMember.id === id) {
        setSelectedMember(updated);
      }
    } catch (e) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      <PageHeader
        breadcrumb="Administration • Staff Directory"
        title="Team & Access Control"
        subtitle="Manage clinic practitioners, front desk receptionists, practice managers, and demo role views."
        actions={
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-violet hover:bg-sidebar-highlight text-white text-xs sm:text-sm font-semibold shadow-md shadow-accent-violet/20"
          >
            <Plus className="h-4 w-4" />
            Invite Staff Member
          </button>
        }
      />

      {/* Demo Role Switcher Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-sidebar-bg via-sidebar-secondary to-sidebar-bg border border-white/10 text-white shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-accent-violet/40 text-accent-lavender text-[10px] font-bold uppercase tracking-wider">
                Demo Feature
              </span>
              <h4 className="text-sm font-bold text-white">Preview Portal as Different Role</h4>
            </div>
            <p className="text-xs text-white/70 mt-1">
              Switch perspective to test operational workflows tailored to receptionists, dentists, or clinic managers.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {(['owner', 'receptionist', 'dentist', 'manager'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => handleSwitchDemoRole(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                  currentDemoRole === r
                    ? 'bg-accent-violet text-white shadow-md shadow-accent-violet/40 ring-2 ring-white/20'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TabBar
        tabs={[
          { id: 'all', label: 'All Staff', count: team.length },
          { id: 'dentist', label: 'Dentists' },
          { id: 'receptionist', label: 'Receptionists' },
          { id: 'manager', label: 'Managers' },
        ]}
        activeTab={activeRoleFilter}
        onChange={setActiveRoleFilter}
      />

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member) => {
          const isDentist = member.role === 'dentist';
          return (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="p-6 rounded-3xl bg-white border border-border shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-accent-lavender text-accent-violet font-extrabold text-lg flex items-center justify-center">
                    {member.firstName[0]}
                    {member.lastName ? member.lastName[0] : ''}
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      member.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h4 className="text-base font-bold text-text-primary">{member.fullName}</h4>
                <p className="text-xs font-semibold text-accent-violet capitalize mt-0.5">
                  {member.role === 'owner' ? 'Clinic Owner & Senior Dentist' : member.role}
                </p>

                {isDentist && (member as Dentist).specialization && (
                  <p className="text-xs text-text-secondary mt-1">
                    {(member as Dentist).specialization}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-border/60 space-y-1.5 text-xs text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-text-muted" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-text-muted" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                <span className="text-text-muted">
                  {isDentist ? 'Availability configured' : 'Front Desk Portal Access'}
                </span>
                <span className="font-semibold text-accent-violet">View Profile →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer: Member Profile */}
      <Drawer
        isOpen={Boolean(selectedMember)}
        onClose={() => setSelectedMember(null)}
        title="Staff Member Profile"
        subtitle={selectedMember?.fullName || ''}
        footer={
          selectedMember && (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => handleToggleActive(selectedMember.id)}
                className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
                  selectedMember.isActive
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {selectedMember.isActive ? 'Deactivate Account' : 'Reactivate Account'}
              </button>
            </div>
          )
        }
      >
        {selectedMember && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-bg-main border border-border">
              <div className="h-14 w-14 rounded-2xl bg-accent-lavender text-accent-violet font-extrabold text-xl flex items-center justify-center">
                {selectedMember.firstName[0]}
                {selectedMember.lastName ? selectedMember.lastName[0] : ''}
              </div>
              <div>
                <h4 className="text-base font-bold text-text-primary">{selectedMember.fullName}</h4>
                <p className="text-xs text-accent-violet font-semibold capitalize mt-0.5">
                  {selectedMember.role}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border/70">
                <span className="text-text-secondary">Official Email</span>
                <span className="font-semibold text-text-primary">{selectedMember.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/70">
                <span className="text-text-secondary">Direct Phone</span>
                <span className="font-semibold text-text-primary">{selectedMember.phone || '+91 80 2558 1234'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/70">
                <span className="text-text-secondary">Account Status</span>
                <span className={`font-bold ${selectedMember.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {selectedMember.isActive ? 'Active Member' : 'Deactivated'}
                </span>
              </div>
            </div>

            {selectedMember.role === 'dentist' && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Weekly Chair Availability
                </p>
                <div className="p-3.5 rounded-2xl bg-bg-main border border-border space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Monday – Friday</span>
                    <span className="font-semibold text-text-primary">09:00 AM – 06:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Saturday</span>
                    <span className="font-semibold text-text-primary">09:00 AM – 02:00 PM</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Sunday</span>
                    <span>Off Duty</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Modal: Invite Member */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Clinic Team Member"
        subtitle="Simulate staff registration and role-based permissions"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Vikram"
                className="w-full h-10 px-3.5 rounded-xl border border-border text-sm"
              />
            </FormField>
            <FormField label="Last Name">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Nayak"
                className="w-full h-10 px-3.5 rounded-xl border border-border text-sm"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email" required>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@mehtadental.com"
                className="w-full h-10 px-3.5 rounded-xl border border-border text-sm"
              />
            </FormField>
            <FormField label="Phone">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full h-10 px-3.5 rounded-xl border border-border text-sm"
              />
            </FormField>
          </div>

          <FormField label="Clinic Role">
            <SelectField
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              options={[
                { value: 'dentist', label: 'Dentist / Clinical Practitioner' },
                { value: 'receptionist', label: 'Front Desk Receptionist' },
                { value: 'manager', label: 'Clinic Operations Manager' },
              ]}
            />
          </FormField>

          {role === 'dentist' && (
            <FormField label="Clinical Specialization">
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Orthodontics"
                className="w-full h-10 px-3.5 rounded-xl border border-border text-sm"
              />
            </FormField>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-black/5 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-accent-violet hover:bg-sidebar-highlight text-white text-xs font-semibold shadow-md shadow-accent-violet/20"
            >
              Send Invitation (Demo)
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
