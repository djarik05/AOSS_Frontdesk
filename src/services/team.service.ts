import type { User, Dentist, UserRole } from '../types';
import { mockTeamMembers } from '../mocks';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'frontdesk_team';
const ACTIVE_ROLE_KEY = 'aoss_user_role';

function getStoredTeam(): (User | Dentist)[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed reading team from storage', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTeamMembers));
  return mockTeamMembers;
}

function saveTeam(team: (User | Dentist)[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
  } catch (e) {
    console.error('Failed saving team to storage', e);
  }
}

export class TeamService {
  public async listTeamMembers(roleFilter?: string): Promise<(User | Dentist)[]> {
    await apiClient.simulateLatency(80, 180);
    let items = getStoredTeam();
    if (roleFilter && roleFilter !== 'all') {
      items = items.filter((m) => m.role === roleFilter);
    }
    return items;
  }

  public async getTeamMemberById(id: string): Promise<User | Dentist | null> {
    const items = getStoredTeam();
    return items.find((m) => m.id === id) || null;
  }

  public async updateMember(
    id: string,
    updates: Partial<User | Dentist>
  ): Promise<User | Dentist> {
    await apiClient.simulateLatency(120, 250);
    const items = getStoredTeam();
    const index = items.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Team member not found');

    const updated = {
      ...items[index],
      ...updates,
      fullName:
        updates.firstName || updates.lastName
          ? `${updates.firstName ?? items[index].firstName} ${
              updates.lastName ?? items[index].lastName
            }`.trim()
          : items[index].fullName,
    };
    items[index] = updated as User | Dentist;
    saveTeam(items);
    return updated as User | Dentist;
  }

  public async inviteMember(data: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    phone?: string;
    specialization?: string;
  }): Promise<User | Dentist> {
    await apiClient.simulateLatency(180, 350);
    const items = getStoredTeam();

    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const id = `staff-${Date.now()}`;
    const now = new Date().toISOString();

    let newMember: User | Dentist;
    if (data.role === 'dentist') {
      newMember = {
        id,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName,
        email: data.email,
        phone: data.phone,
        role: 'dentist',
        isActive: true,
        specialization: data.specialization || 'General Dentistry',
        color: '#7658E8',
        createdAt: now,
        availability: [
          { day: 'Mon-Fri', startTime: '09:00', endTime: '18:00', isAvailable: true },
        ],
      };
    } else {
      newMember = {
        id,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        isActive: true,
        createdAt: now,
      };
    }

    items.push(newMember);
    saveTeam(items);
    return newMember;
  }

  public async toggleActiveStatus(id: string): Promise<User | Dentist> {
    const items = getStoredTeam();
    const member = items.find((m) => m.id === id);
    if (!member) throw new Error('Member not found');
    member.isActive = !member.isActive;
    saveTeam(items);
    return member;
  }

  public getCurrentRole(): UserRole {
    return (localStorage.getItem(ACTIVE_ROLE_KEY) as UserRole) || 'owner';
  }

  public setCurrentRole(role: UserRole): void {
    localStorage.setItem(ACTIVE_ROLE_KEY, role);
  }

  public resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEY);
    saveTeam(mockTeamMembers);
  }
}

export const teamService = new TeamService();
