import type { Task, TaskPriority, TaskStatus } from '../types';
import { mockTasks } from '../mocks';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'frontdesk_tasks';

function getStoredTasks(): Task[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed reading tasks from storage', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTasks));
  return mockTasks;
}

function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed saving tasks to storage', e);
  }
}

export class TasksService {
  public async listTasks(filterTab?: string): Promise<Task[]> {
    await apiClient.simulateLatency(80, 160);
    let items = getStoredTasks();

    if (filterTab === 'my') {
      items = items.filter((t) => t.assignedToName.includes('Mehta') || t.assignedToName.includes('Kavitha'));
    } else if (filterTab === 'overdue') {
      const today = new Date().toISOString().split('T')[0];
      items = items.filter((t) => t.dueDate < today && t.status !== 'completed');
    } else if (filterTab === 'completed') {
      items = items.filter((t) => t.status === 'completed');
    }

    return items;
  }

  public async createTask(
    data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdById' | 'createdByName'>
  ): Promise<Task> {
    await apiClient.simulateLatency(120, 250);
    const items = getStoredTasks();
    const now = new Date().toISOString();
    const newTask: Task = {
      ...data,
      id: `task-${Date.now()}`,
      createdById: 'staff-current',
      createdByName: 'Dr. Mehta',
      createdAt: now,
      updatedAt: now,
    };
    items.unshift(newTask);
    saveTasks(items);
    return newTask;
  }

  public async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const items = getStoredTasks();
    const task = items.find((t) => t.id === id);
    if (!task) throw new Error('Task not found');
    task.status = status;
    task.updatedAt = new Date().toISOString();
    saveTasks(items);
    return task;
  }

  public async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const items = getStoredTasks();
    const index = items.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Task not found');
    const updated = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    items[index] = updated;
    saveTasks(items);
    return updated;
  }

  public resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEY);
    saveTasks(mockTasks);
  }
}

export const tasksService = new TasksService();
