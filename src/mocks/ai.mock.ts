import type { AIConfiguration } from '../types';

export const mockAIConfig: AIConfiguration = {
  assistantName: 'AOSS Receptionist',
  isEnabled: true,
  provider: 'AOSS AI Engine',
  configVersion: 3,
  lastPublished: '2026-10-18T16:00:00Z',
  tone: 'friendly',
  greeting: 'Hello! Thank you for contacting Mehta Dental Studio. I\'m AOSS, your AI dental receptionist. How can I help you today? 😊',
  instructions: 'You are the AI receptionist for Mehta Dental Studio, a premium dental clinic in Bangalore. Be warm, professional, and helpful. Answer questions about clinic hours, fees, and services using the knowledge base. Help patients book, reschedule, or cancel appointments. Always escalate clinical or medical questions to the dental team. Never provide medical advice. Use the patient\'s name when possible. Keep responses concise and use emojis sparingly.',
  permissions: {
    answerAdminQuestions: true,
    checkAvailability: true,
    initiateBooking: true,
    initiateRescheduling: true,
    initiateCancellation: false,
    scheduleReminders: true,
    escalateClinical: true,
  },
  knowledgeItems: [
    {
      id: 'ki1',
      category: 'General',
      question: 'What are your clinic hours?',
      answer: 'Mehta Dental Studio is open Monday to Friday from 9:00 AM to 6:00 PM (lunch break 1:00-2:00 PM), Wednesday 9:00 AM to 3:00 PM, and Saturday 9:00 AM to 2:00 PM. We are closed on Sundays.',
      status: 'approved',
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-10-01T10:00:00Z',
    },
    {
      id: 'ki2',
      category: 'Fees',
      question: 'How much does a consultation cost?',
      answer: 'A general consultation costs ₹500. This includes a comprehensive dental examination. If X-rays are needed, there is an additional charge of ₹300 per X-ray.',
      status: 'approved',
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-10-01T10:00:00Z',
    },
    {
      id: 'ki3',
      category: 'Fees',
      question: 'How much does teeth cleaning cost?',
      answer: 'Professional teeth cleaning starts at ₹1,500 for a standard session (45 minutes). Deep cleaning or scaling for patients with tartar buildup may cost ₹2,500-₹3,500 depending on the case.',
      status: 'approved',
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-10-05T14:00:00Z',
    },
    {
      id: 'ki4',
      category: 'Services',
      question: 'Do you offer teeth whitening?',
      answer: 'Yes! We offer professional in-office teeth whitening at ₹6,000 per session. Results are typically visible immediately. We also provide at-home whitening kits for ₹3,500.',
      status: 'approved',
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-09-15T11:00:00Z',
    },
    {
      id: 'ki5',
      category: 'General',
      question: 'Do you accept insurance?',
      answer: 'Yes, we accept most major health insurance plans including Star Health, ICICI Lombard, Max Bupa, and HDFC ERGO. Please bring your insurance card during your visit for verification.',
      status: 'approved',
      createdAt: '2026-09-05T09:00:00Z',
      updatedAt: '2026-09-05T09:00:00Z',
    },
    {
      id: 'ki6',
      category: 'General',
      question: 'Where is the clinic located?',
      answer: 'Mehta Dental Studio is located at 23 Brigade Road, 2nd Floor, Ashok Nagar, Bangalore 560025. We are near the Brigade Road Metro Station. Parking is available in the building basement.',
      status: 'approved',
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-09-01T10:00:00Z',
    },
    {
      id: 'ki7',
      category: 'Fees',
      question: 'How much does a root canal cost?',
      answer: 'Root canal treatment costs ₹8,000 per tooth for a single sitting. Multi-visit root canals may cost ₹6,000-₹10,000 depending on complexity. A crown is recommended after root canal and costs ₹12,000.',
      status: 'approved',
      createdAt: '2026-09-10T10:00:00Z',
      updatedAt: '2026-10-10T10:00:00Z',
    },
    {
      id: 'ki8',
      category: 'Policy',
      question: 'What is the cancellation policy?',
      answer: 'We request at least 24 hours notice for cancellations. Same-day cancellations may incur a ₹200 fee. No-shows without prior notice will be charged a ₹300 fee.',
      status: 'draft',
      createdAt: '2026-10-15T14:00:00Z',
      updatedAt: '2026-10-15T14:00:00Z',
    },
  ],
};

export interface PlaygroundMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const mockPlaygroundResponses: Record<string, string> = {
  'what are your hours': 'Mehta Dental Studio is open Monday to Friday from 9:00 AM to 6:00 PM (lunch break 1:00-2:00 PM), Wednesday 9:00 AM to 3:00 PM, and Saturday 9:00 AM to 2:00 PM. We are closed on Sundays. Would you like to book an appointment? 😊',
  'how much is cleaning': 'Professional teeth cleaning starts at ₹1,500 for a standard session (45 minutes). Deep cleaning for patients with heavier tartar buildup may cost ₹2,500-₹3,500. Would you like to schedule a cleaning appointment?',
  'i need an appointment': 'I\'d be happy to help you book an appointment! Could you let me know:\n\n1. What type of visit? (consultation, cleaning, etc.)\n2. Do you have a preferred doctor?\n3. What dates/times work best for you?\n\nI\'ll find the perfect slot for you! 📅',
  'do you take insurance': 'Yes! We accept most major health insurance plans including Star Health, ICICI Lombard, Max Bupa, and HDFC ERGO. Please bring your insurance card during your visit, and our reception team will verify your coverage. 💳',
  'where are you located': 'Mehta Dental Studio is at 23 Brigade Road, 2nd Floor, Ashok Nagar, Bangalore 560025. We\'re near Brigade Road Metro Station, and parking is available in the building basement. Would you like directions? 📍',
  'my tooth hurts': 'I\'m sorry to hear you\'re in pain! While I can\'t provide medical advice, I can connect you with our dental team right away for guidance. Would you like me to escalate this to Dr. Mehta? If the pain is severe, please visit our clinic as soon as possible — we accommodate emergency cases. 🏥',
};
