import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Filter,
} from 'lucide-react';

import { PageHeader } from '@/components/navigation/PageHeader';
import { TabBar } from '@/components/navigation/TabBar';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { Modal } from '@/components/dialogs/Modal';
import { FormField } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { useToast } from '@/components/feedback/Toast';

import { tasksService } from '@/services/tasks.service';
import type { Task, TaskPriority, TaskStatus } from '@/types';

export default function TasksPage() {
  const toast = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToName, setAssignedToName] = useState('Kavitha Sundaram');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [dueDate, setDueDate] = useState('2026-10-21');
  const [relatedPatientName, setRelatedPatientName] = useState('');

  const loadTasks = async () => {
    try {
      const data = await tasksService.listTasks(activeTab);
      setTasks(data);
    } catch (e) {
      toast.error('Failed to load tasks');
    }
  };

  useEffect(() => {
    loadTasks();
  }, [activeTab]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await tasksService.createTask({
        title: title.trim(),
        description: description.trim(),
        assignedToId: 'staff-1',
        assignedToName,
        dueDate,
        priority,
        status: 'todo',
        relatedPatientName: relatedPatientName.trim() || undefined,
      });

      toast.success('Task created');
      setIsNewModalOpen(false);
      setTitle('');
      setDescription('');
      setRelatedPatientName('');
      loadTasks();
    } catch (e) {
      toast.error('Failed to create task');
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus: TaskStatus =
      task.status === 'completed' ? 'todo' : 'completed';
    try {
      await tasksService.updateTaskStatus(task.id, nextStatus);
      toast.info(`Task marked as ${nextStatus}`);
      loadTasks();
    } catch (e) {
      toast.error('Failed to update task');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      <PageHeader
        breadcrumb="Operations • Front Desk Duties"
        title="Reception & Clinic Tasks"
        subtitle="Manage daily patient follow-ups, recall check-ins, insurance clearances, and front desk tasks."
        actions={
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-violet hover:bg-sidebar-highlight text-white text-xs sm:text-sm font-semibold shadow-md shadow-accent-violet/20"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        }
      />

      {/* Tabs */}
      <TabBar
        tabs={[
          { id: 'all', label: 'All Tasks', count: tasks.length },
          { id: 'my', label: 'My Assigned', count: tasks.filter((t) => t.assignedToName.includes('Kavitha') || t.assignedToName.includes('Mehta')).length },
          { id: 'overdue', label: 'Overdue' },
          { id: 'completed', label: 'Completed' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-text-muted bg-white rounded-2xl border border-border">
            No tasks found in this view.
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.status === 'completed';
            return (
              <div
                key={task.id}
                className={`p-5 rounded-2xl border bg-white shadow-xs transition-all flex flex-col justify-between ${
                  isCompleted ? 'opacity-60 border-border/60 bg-bg-main/30' : 'border-border hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[11px] font-bold text-accent-violet">
                      Due: {task.dueDate}
                    </span>
                    <StatusBadge status={task.priority} />
                  </div>

                  <h4 className={`text-sm font-bold text-text-primary ${isCompleted ? 'line-through' : ''}`}>
                    {task.title}
                  </h4>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {task.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-text-muted block">Assigned to</span>
                    <span className="font-semibold text-text-primary">{task.assignedToName}</span>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(task)}
                    className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-bg-main hover:bg-black/5 text-text-secondary'
                    }`}
                  >
                    <CheckCircle2 className={`h-4 w-4 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                    {isCompleted ? 'Done' : 'Mark Done'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: New Task */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Create Operational Task"
        subtitle="Assign a follow-up, verification, or administrative clinic duty"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <FormField label="Task Title" required>
            <input
              type="text"
              required
              placeholder="e.g. Call Vikram Patel regarding root canal healing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-border text-sm"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              rows={2}
              placeholder="e.g. Check if any pain or swelling persists 48 hours post-op"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-border text-xs"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Assign To">
              <SelectField
                value={assignedToName}
                onChange={(e) => setAssignedToName(e.target.value)}
                options={[
                  { value: 'Kavitha Sundaram', label: 'Kavitha (Head Receptionist)' },
                  { value: 'Dr. Rohan Mehta', label: 'Dr. Rohan Mehta' },
                  { value: 'Dr. Ananya Rao', label: 'Dr. Ananya Rao' },
                  { value: 'Amit Joshi', label: 'Amit Joshi (Manager)' },
                ]}
              />
            </FormField>

            <FormField label="Priority Level">
              <SelectField
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                options={[
                  { value: 'urgent', label: 'Urgent' },
                  { value: 'high', label: 'High Priority' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'low', label: 'Low' },
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Due Date" required>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border text-xs"
              />
            </FormField>

            <FormField label="Related Patient (Optional)">
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={relatedPatientName}
                onChange={(e) => setRelatedPatientName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-border text-xs"
              />
            </FormField>
          </div>

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
              Save Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
