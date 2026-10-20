import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Send,
  UserCheck,
  Bot,
  User,
  Sparkles,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

import { PageHeader } from '@/components/navigation/PageHeader';
import { TabBar } from '@/components/navigation/TabBar';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { SearchInput } from '@/components/forms/SearchInput';
import { useToast } from '@/components/feedback/Toast';

import { conversationsService } from '@/services/conversations.service';
import { appointmentsService } from '@/services/appointments.service';
import type { Conversation, Message, Appointment } from '@/types';

export default function InboxPage() {
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);

  const loadData = async () => {
    try {
      const [cList, aList] = await Promise.all([
        conversationsService.listConversations(activeFilter),
        appointmentsService.listAppointments(),
      ]);
      setConversations(cList);
      setAppointments(aList);
      if (!selectedConv && cList.length > 0) {
        setSelectedConv(cList[0]);
      } else if (selectedConv) {
        const updated = cList.find((c) => c.id === selectedConv.id);
        if (updated) setSelectedConv(updated);
      }
    } catch (e) {
      toast.error('Failed to load conversations');
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFilter]);

  // Scroll to bottom of message thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConv?.messages]);

  // Handle staff reply
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConv) return;

    const text = replyText.trim();
    setReplyText('');
    setIsSending(true);

    try {
      await conversationsService.sendMessage(
        selectedConv.id,
        text,
        'staff',
        'Kavitha (Front Desk)'
      );
      toast.success('Message sent (Local Demo)', 'Simulated reply posted in thread');
      await loadData();
    } catch (e) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Staff takeover
  const handleTakeOver = async () => {
    if (!selectedConv) return;
    try {
      await conversationsService.takeOverConversation(
        selectedConv.id,
        'Kavitha (Front Desk)'
      );
      toast.info('Staff Takeover Active', 'AI automated replies paused for this thread');
      loadData();
    } catch (e) {
      toast.error('Takeover failed');
    }
  };

  // Resume AI
  const handleResumeAI = async () => {
    if (!selectedConv) return;
    try {
      await conversationsService.resumeAI(selectedConv.id);
      toast.success('AI Receptionist Resumed', 'Automated assistant active');
      loadData();
    } catch (e) {
      toast.error('Failed to resume AI');
    }
  };

  // Trigger deterministic AI response to test simulation
  const handleTriggerSimulatedPatientMessage = async (query: string) => {
    if (!selectedConv) return;
    try {
      // 1. Patient message
      await conversationsService.sendMessage(
        selectedConv.id,
        query,
        'patient',
        selectedConv.patientName
      );
      // 2. AI automated reply
      await conversationsService.generateDeterministicAIReply(selectedConv.id, query);
      toast.info('Simulated Interaction', 'Patient query & AI response added');
      loadData();
    } catch (e) {
      toast.error('Simulation error');
    }
  };

  // Resolve
  const handleResolve = async () => {
    if (!selectedConv) return;
    try {
      await conversationsService.markResolved(selectedConv.id);
      toast.success('Conversation resolved');
      loadData();
    } catch (e) {
      toast.error('Failed to resolve');
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.patientName.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        breadcrumb="Intelligence • Communications"
        title="AI Receptionist Inbox"
        subtitle="Manage live patient enquiries, AI automated conversations, and staff hand-offs."
        actions={
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-accent-violet border border-accent-violet/20 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              AI Assistant Online (Demo)
            </span>
          </div>
        }
      />

      {/* Main 3-Panel Card Container */}
      <div className="bg-white rounded-3xl border border-border shadow-[0_8px_30px_rgba(33,22,79,0.03)] overflow-hidden h-[750px] flex flex-col md:flex-row">
        {/* PANEL 1 (LEFT): Conversation List (~320px) */}
        <div className="w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-bg-main/30 shrink-0">
          {/* Search & Tabs */}
          <div className="p-4 space-y-3 border-b border-border bg-white">
            <SearchInput
              placeholder="Search enquiries or patients..."
              value={searchQuery}
              onChange={setSearchQuery}
            />

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'ai-handling', label: 'AI Handling' },
                { id: 'needs-staff', label: 'Needs Staff' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveFilter(t.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                    activeFilter === t.id
                      ? 'bg-accent-violet text-white shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-black/5'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-muted">
                No matching enquiries.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConv?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`p-4 transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-white border-l-4 border-l-accent-violet shadow-xs'
                        : 'hover:bg-bg-main/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-xs sm:text-sm text-text-primary truncate">
                        {conv.patientName}
                      </span>
                      <span className="text-[10px] text-text-muted whitespace-nowrap">
                        {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary line-clamp-1 mb-2">
                      {conv.lastMessage}
                    </p>

                    <div className="flex items-center justify-between text-[11px]">
                      <StatusBadge status={conv.aiStatus} />
                      {conv.unreadCount > 0 && (
                        <span className="h-5 w-5 rounded-full bg-accent-violet text-white font-bold text-[10px] flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL 2 (CENTRE): Message Thread (Flex-1) */}
        {selectedConv ? (
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            {/* Conversation Header */}
            <div className="p-4 px-6 border-b border-border flex items-center justify-between bg-bg-main/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-accent-lavender text-accent-violet font-extrabold flex items-center justify-center">
                  {selectedConv.patientName[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    {selectedConv.patientName}
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-accent-violet border border-purple-200/50">
                      {selectedConv.channel}
                    </span>
                  </h4>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Assigned: {selectedConv.assignedToName || 'Automated AI'} • Ref #{selectedConv.id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedConv.aiStatus === 'needs-staff' || selectedConv.aiStatus === 'escalated' ? (
                  <button
                    onClick={handleResumeAI}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-accent-violet text-accent-violet hover:bg-accent-lavender text-xs font-semibold"
                  >
                    <Bot className="h-3.5 w-3.5" /> Resume AI
                  </button>
                ) : (
                  <button
                    onClick={handleTakeOver}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-accent-violet text-xs font-semibold"
                  >
                    <UserCheck className="h-3.5 w-3.5" /> Take Over Thread
                  </button>
                )}

                <button
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className="p-2 rounded-xl border border-border text-text-muted hover:text-text-primary hover:bg-bg-main text-xs hidden lg:block"
                  title="Toggle details panel"
                >
                  {showRightPanel ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Hand-off Notice Banner */}
            {(selectedConv.aiStatus === 'needs-staff' || selectedConv.aiStatus === 'escalated') && (
              <div className="px-6 py-2 bg-amber-50 border-b border-amber-200/70 flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  <span className="font-semibold">
                    Staff Takeover Active — AI automated responses paused for this patient enquiry.
                  </span>
                </div>
                <span className="text-[11px] text-amber-700 font-medium">Demo simulation</span>
              </div>
            )}

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-bg-main/10">
              {selectedConv.messages.map((msg) => {
                const isPatient = msg.sender === 'patient';
                const isAI = msg.isAI || msg.sender === 'ai';
                const isStaff = msg.sender === 'staff' && !isAI;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isStaff ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-text-secondary">
                        {msg.senderName}
                      </span>
                      {isAI && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-accent-lavender text-accent-violet">
                          AI Bot
                        </span>
                      )}
                      <span className="text-[10px] text-text-muted">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div
                      className={`max-w-md sm:max-w-lg p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isStaff
                          ? 'bg-accent-violet text-white rounded-tr-xs shadow-xs'
                          : isAI
                          ? 'bg-purple-50/80 border border-purple-200/60 text-text-primary rounded-tl-xs shadow-xs'
                          : 'bg-white border border-border text-text-primary rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Demo Test Inquiries */}
            <div className="px-6 py-2 bg-white border-t border-border flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider shrink-0">
                Simulate Query:
              </span>
              <button
                type="button"
                onClick={() => handleTriggerSimulatedPatientMessage('What are your opening hours on Saturday?')}
                className="px-2.5 py-1 rounded-lg bg-bg-main hover:bg-black/5 text-[11px] font-medium text-text-secondary whitespace-nowrap"
              >
                Opening hours
              </button>
              <button
                type="button"
                onClick={() => handleTriggerSimulatedPatientMessage('How much do you charge for dental cleaning?')}
                className="px-2.5 py-1 rounded-lg bg-bg-main hover:bg-black/5 text-[11px] font-medium text-text-secondary whitespace-nowrap"
              >
                Consultation fees
              </button>
              <button
                type="button"
                onClick={() => handleTriggerSimulatedPatientMessage('I have severe tooth pain and bleeding since morning')}
                className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-medium whitespace-nowrap"
              >
                Clinical pain (Escalate)
              </button>
            </div>

            {/* Composer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-white flex items-center gap-3">
              <input
                type="text"
                placeholder="Type reply as Front Desk Receptionist..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 h-11 px-4 rounded-xl border border-border bg-bg-main/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent-violet/30"
              />
              <button
                type="submit"
                disabled={isSending || !replyText.trim()}
                className="h-11 px-5 rounded-xl bg-accent-violet hover:bg-sidebar-highlight text-white text-xs font-semibold shadow-md shadow-accent-violet/20 flex items-center gap-1.5 disabled:opacity-50 transition-all active:scale-95"
              >
                <Send className="h-4 w-4" /> Send
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-text-muted text-sm">
            Select a patient enquiry to view thread
          </div>
        )}

        {/* PANEL 3 (RIGHT): Patient & Appointment Details (~280px) */}
        {showRightPanel && selectedConv && (
          <div className="w-full lg:w-72 border-l border-border p-5 overflow-y-auto bg-bg-main/20 space-y-6 shrink-0">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">
                Patient Contact
              </p>
              <div className="p-3.5 rounded-2xl bg-white border border-border space-y-2">
                <p className="font-bold text-sm text-text-primary">{selectedConv.patientName}</p>
                <p className="text-xs text-text-secondary">{selectedConv.patientPhone}</p>
                <div className="pt-2 flex items-center justify-between text-xs border-t border-border/60">
                  <span className="text-text-muted">Channel:</span>
                  <span className="font-semibold text-accent-violet uppercase">{selectedConv.channel}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">
                Enquiry Intent
              </p>
              <div className="p-3.5 rounded-2xl bg-white border border-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Category:</span>
                  <span className="font-semibold text-text-primary capitalize">{selectedConv.category.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">AI Status:</span>
                  <StatusBadge status={selectedConv.aiStatus} />
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">
                Related Appointments
              </p>
              <div className="space-y-2">
                {appointments
                  .filter((a) => a.patientName === selectedConv.patientName)
                  .map((a) => (
                    <div key={a.id} className="p-3 rounded-xl bg-white border border-border text-xs space-y-1">
                      <div className="flex justify-between font-bold text-text-primary">
                        <span>{a.typeName}</span>
                        <span className="text-accent-violet">{a.startTime}</span>
                      </div>
                      <p className="text-[11px] text-text-secondary">{a.date} • {a.dentistName}</p>
                    </div>
                  ))}
              </div>
            </div>

            <button
              onClick={handleResolve}
              className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Mark Enquiry Resolved
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
