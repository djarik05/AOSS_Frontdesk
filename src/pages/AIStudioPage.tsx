import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Play,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Sliders,
  ShieldCheck,
  Cpu,
  Info,
} from 'lucide-react';

import { PageHeader } from '@/components/navigation/PageHeader';
import { TabBar } from '@/components/navigation/TabBar';
import { InfoCard } from '@/components/cards/InfoCard';
import { FormField } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { Modal } from '@/components/dialogs/Modal';
import { useToast } from '@/components/feedback/Toast';

import { aiStudioService } from '@/services/aiStudio.service';
import type { AIConfiguration, KnowledgeItem } from '@/types';

export default function AIStudioPage() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [config, setConfig] = useState<AIConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Playground state
  const [testPrompt, setTestPrompt] = useState('What are your consultation fees and do you accept walk-ins?');
  const [testResult, setTestResult] = useState<{
    response: string;
    detectedIntent: string;
    requiredInformation: string[];
    proposedAction: string;
    escalationStatus: 'none' | 'warning' | 'escalated';
  } | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

  // New knowledge item modal
  const [isNewKbModalOpen, setIsNewKbModalOpen] = useState(false);
  const [kbCategory, setKbCategory] = useState('Fees & Services');
  const [kbQuestion, setKbQuestion] = useState('');
  const [kbAnswer, setKbAnswer] = useState('');

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const data = await aiStudioService.getConfig();
      setConfig(data);
    } catch (e) {
      toast.error('Failed to load AI configuration');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Save changes
  const handleSaveConfig = async () => {
    if (!config) return;
    try {
      await aiStudioService.updateConfig(config);
      toast.success('Configuration Published (Demo)', `Version updated to v${config.configVersion + 1}`);
      loadConfig();
    } catch (e) {
      toast.error('Failed to publish');
    }
  };

  // Toggle permission
  const handleTogglePermission = (key: keyof AIConfiguration['permissions']) => {
    if (!config) return;
    const nextVal = !config.permissions[key];
    setConfig({
      ...config,
      permissions: {
        ...config.permissions,
        [key]: nextVal,
      },
    });
    toast.info('Permission toggled locally');
  };

  // Run test playground
  const handleRunPlayground = async () => {
    if (!testPrompt.trim()) return;
    setIsRunningTest(true);
    try {
      const res = await aiStudioService.runTestPlayground(testPrompt);
      setTestResult(res);
      toast.success('Playground simulation finished');
    } catch (e) {
      toast.error('Playground failed');
    } finally {
      setIsRunningTest(false);
    }
  };

  // Add knowledge item
  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbQuestion.trim() || !kbAnswer.trim()) return;
    try {
      await aiStudioService.addKnowledgeItem({
        category: kbCategory,
        question: kbQuestion.trim(),
        answer: kbAnswer.trim(),
        status: 'approved',
      });
      toast.success('Knowledge item added');
      setIsNewKbModalOpen(false);
      setKbQuestion('');
      setKbAnswer('');
      loadConfig();
    } catch (e) {
      toast.error('Failed to add knowledge item');
    }
  };

  const handleDeleteKnowledge = async (id: string) => {
    try {
      await aiStudioService.deleteKnowledgeItem(id);
      toast.info('Knowledge item removed');
      loadConfig();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  if (!config) {
    return <div className="p-8 text-center text-xs text-text-muted">Loading AI Studio...</div>;
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      <PageHeader
        breadcrumb="Intelligence • Assistant Architecture"
        title="AI Studio"
        subtitle="Configure clinic knowledge, persona tone, safe operational boundaries, and test simulations."
        actions={
          <button
            onClick={handleSaveConfig}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-violet hover:bg-sidebar-highlight text-white text-xs sm:text-sm font-semibold shadow-md shadow-accent-violet/20"
          >
            <Save className="h-4 w-4" />
            Publish Configuration (v{config.configVersion + 1})
          </button>
        }
      />

      {/* Tabs */}
      <TabBar
        tabs={[
          { id: 'overview', label: 'Overview & Persona', icon: <Bot className="h-4 w-4" /> },
          { id: 'knowledge', label: 'Clinic Knowledge Base', icon: <BookOpen className="h-4 w-4" /> },
          { id: 'permissions', label: 'Operational Permissions', icon: <ShieldCheck className="h-4 w-4" /> },
          { id: 'playground', label: 'Test Playground', icon: <Play className="h-4 w-4" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: Overview & Persona */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InfoCard
            className="lg:col-span-2"
            title="Assistant Identity & Personality"
            subtitle="Configure how the AI receptionist represents Mehta Dental Studio"
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Assistant Display Name">
                  <input
                    type="text"
                    value={config.assistantName}
                    onChange={(e) => setConfig({ ...config, assistantName: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border text-sm"
                  />
                </FormField>

                <FormField label="Provider Connection">
                  <input
                    type="text"
                    disabled
                    value={config.provider}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-bg-main text-text-muted text-sm cursor-not-allowed"
                  />
                </FormField>
              </div>

              <FormField label="Persona Tone of Voice">
                <div className="grid grid-cols-3 gap-3">
                  {(['friendly', 'professional', 'formal'] as const).map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setConfig({ ...config, tone })}
                      className={`py-2.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                        config.tone === tone
                          ? 'border-accent-violet bg-accent-lavender text-accent-violet shadow-xs'
                          : 'border-border bg-white text-text-secondary hover:bg-bg-main'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField label="Welcome Greeting Message">
                <textarea
                  rows={3}
                  value={config.greeting}
                  onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-border text-xs sm:text-sm leading-relaxed"
                />
              </FormField>

              <FormField
                label="System Prompt Instructions"
                helpText="Safety rule: AI must decline clinical diagnosis and escalate acute dental emergencies."
              >
                <textarea
                  rows={4}
                  value={config.instructions}
                  onChange={(e) => setConfig({ ...config, instructions: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-border text-xs sm:text-sm leading-relaxed font-mono text-[11px]"
                />
              </FormField>
            </div>
          </InfoCard>

          <InfoCard
            title="Deployment Status"
            subtitle="Current active profile in demo"
          >
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-bg-main border border-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-muted">Status:</span>
                  <span className="font-bold text-emerald-600">Active (Demo Mode)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Current Version:</span>
                  <span className="font-semibold text-text-primary">v{config.configVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Knowledge Entries:</span>
                  <span className="font-bold text-accent-violet">{config.knowledgeItems.length} verified items</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/60 text-purple-900 leading-relaxed text-[11px]">
                <p className="font-bold mb-1">Architecture Notice</p>
                All conversational outputs are simulated locally. No actual LLM provider is connected in this frontend demonstration phase.
              </div>
            </div>
          </InfoCard>
        </div>
      )}

      {/* TAB 2: Knowledge Base */}
      {activeTab === 'knowledge' && (
        <InfoCard
          title="Verified Clinic Knowledge Base"
          subtitle="Approved answers for administrative questions about fees, hours, parking, and clinic policy"
          action={
            <button
              onClick={() => setIsNewKbModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent-violet hover:bg-sidebar-highlight text-white text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" /> Add Knowledge Item
            </button>
          }
        >
          <div className="space-y-3">
            {config.knowledgeItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-border bg-bg-main/30 hover:bg-bg-main transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-border text-accent-violet">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-bold text-text-primary mt-1.5">
                      {item.question}
                    </h4>
                  </div>
                  <button
                    onClick={() => handleDeleteKnowledge(item.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed bg-white p-3 rounded-xl border border-border/60">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </InfoCard>
      )}

      {/* TAB 3: Permissions */}
      {activeTab === 'permissions' && (
        <InfoCard
          title="Autonomous Receptionist Guardrails"
          subtitle="Enable or restrict operational actions the AI is permitted to perform in the clinic portal"
        >
          <div className="divide-y divide-border/60">
            {[
              {
                key: 'answerAdminQuestions' as const,
                title: 'Answer Approved Administrative Enquiries',
                desc: 'Permit AI to respond to questions about hours, address, services, and consultation fees.',
              },
              {
                key: 'checkAvailability' as const,
                title: 'Check Appointment Availability',
                desc: 'Allow AI to read current dentist schedules and propose available time slots.',
              },
              {
                key: 'initiateBooking' as const,
                title: 'Initiate Appointment Booking Demonstrations',
                desc: 'Allow assistant to collect patient name and draft provisional appointment bookings.',
              },
              {
                key: 'initiateRescheduling' as const,
                title: 'Initiate Rescheduling Demonstrations',
                desc: 'Allow assistant to assist patients with date and time changes.',
              },
              {
                key: 'initiateCancellation' as const,
                title: 'Initiate Cancellation Demonstrations',
                desc: 'Allow assistant to record cancellation requests for staff review.',
              },
              {
                key: 'scheduleReminders' as const,
                title: 'Schedule Automated Reminders',
                desc: 'Allow assistant to queue confirmation and follow-up notices.',
              },
              {
                key: 'escalateClinical' as const,
                title: 'Strict Clinical Question Escalation (Mandatory)',
                desc: 'Immediately flag any message mentioning toothache, pain, or diagnosis for human staff.',
              },
            ].map((p) => {
              const isEnabled = config.permissions[p.key];
              return (
                <div key={p.key} className="py-4 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-text-primary">{p.title}</p>
                    <p className="text-xs text-text-secondary">{p.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePermission(p.key)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? 'bg-accent-violet' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </InfoCard>
      )}

      {/* TAB 4: Test Playground */}
      {activeTab === 'playground' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input */}
          <InfoCard
            title="Simulation Input"
            subtitle="Enter sample patient inquiries to test intent recognition and escalation behavior"
          >
            <div className="space-y-4">
              <FormField label="Simulated Patient Message">
                <textarea
                  rows={4}
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="e.g. Can I book an appointment for dental cleaning tomorrow afternoon?"
                  className="w-full p-3.5 rounded-xl border border-border text-xs sm:text-sm leading-relaxed"
                />
              </FormField>

              {/* Quick pre-built test prompts */}
              <div>
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">
                  Sample Prompts:
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setTestPrompt('What are your opening hours on Saturday?')}
                    className="px-2.5 py-1 rounded-lg bg-bg-main hover:bg-black/5 text-text-secondary font-medium"
                  >
                    Opening Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestPrompt('How much is the initial consultation fee?')}
                    className="px-2.5 py-1 rounded-lg bg-bg-main hover:bg-black/5 text-text-secondary font-medium"
                  >
                    Consultation Fee
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestPrompt('I have severe bleeding in my gums since yesterday!')}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium"
                  >
                    Clinical Emergency
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunPlayground}
                disabled={isRunningTest}
                className="w-full py-3 rounded-xl bg-accent-violet hover:bg-sidebar-highlight text-white text-xs sm:text-sm font-semibold shadow-md shadow-accent-violet/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                {isRunningTest ? 'Running Simulation...' : 'Run Test Simulation'}
              </button>
            </div>
          </InfoCard>

          {/* Right: Output */}
          <InfoCard
            title="Assistant Execution Output"
            subtitle="Demonstration simulation result (No live LLM API invoked)"
          >
            {testResult ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    Simulated AI Response:
                  </span>
                  <div className="mt-1 p-3.5 rounded-2xl bg-purple-50 border border-purple-200/70 text-text-primary leading-relaxed font-medium">
                    {testResult.response}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-bg-main border border-border">
                    <p className="text-text-muted text-[10px] uppercase font-bold">Detected Intent</p>
                    <p className="font-bold text-accent-violet mt-0.5">{testResult.detectedIntent}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-bg-main border border-border">
                    <p className="text-text-muted text-[10px] uppercase font-bold">Escalation Status</p>
                    <p className={`font-bold mt-0.5 capitalize ${testResult.escalationStatus === 'escalated' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {testResult.escalationStatus}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-bg-main border border-border">
                  <p className="text-text-muted text-[10px] uppercase font-bold">Proposed Action</p>
                  <p className="font-semibold text-text-primary mt-0.5">{testResult.proposedAction}</p>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-text-muted text-xs">
                Click "Run Test Simulation" to test your configured instructions and guardrails.
              </div>
            )}
          </InfoCard>
        </div>
      )}

      {/* Modal: Add Knowledge Item */}
      <Modal
        isOpen={isNewKbModalOpen}
        onClose={() => setIsNewKbModalOpen(false)}
        title="Add Knowledge Item"
        subtitle="Add a clinic policy, fee, or FAQ to the receptionist knowledge base"
      >
        <form onSubmit={handleAddKnowledge} className="space-y-4">
          <FormField label="Category">
            <SelectField
              value={kbCategory}
              onChange={(e) => setKbCategory(e.target.value)}
              options={[
                { value: 'Fees & Services', label: 'Fees & Services' },
                { value: 'Opening Hours', label: 'Opening Hours' },
                { value: 'Location & Parking', label: 'Location & Parking' },
                { value: 'First Visit', label: 'First Visit Instructions' },
                { value: 'FAQ', label: 'Frequently Asked Questions' },
              ]}
            />
          </FormField>

          <FormField label="Patient Question / Topic" required>
            <input
              type="text"
              required
              placeholder="e.g. Where can patients park?"
              value={kbQuestion}
              onChange={(e) => setKbQuestion(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-border text-sm"
            />
          </FormField>

          <FormField label="Official Clinic Response" required>
            <textarea
              rows={3}
              required
              placeholder="e.g. Dedicated parking is available in the basement of Mehta Towers."
              value={kbAnswer}
              onChange={(e) => setKbAnswer(e.target.value)}
              className="w-full p-3 rounded-xl border border-border text-xs leading-relaxed"
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsNewKbModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-black/5 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-accent-violet hover:bg-sidebar-highlight text-white text-xs font-semibold shadow-md shadow-accent-violet/20"
            >
              Add Item
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
