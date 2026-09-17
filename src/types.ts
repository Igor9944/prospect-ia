export type PipelineStage =
  | 'discovered'
  | 'contacted'
  | 'engaged'
  | 'meeting'
  | 'won'
  | 'nurturing';

export type LeadStatus = 'hot' | 'warm' | 'cold';

export interface Prospect {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone?: string;
  linkedin?: string;
  location: string;
  industry: string;
  stage: PipelineStage;
  fitScore: number;
  intentScore: number;
  status: LeadStatus;
  companySize: string;
  estimatedRevenue: string;
  techStack: string[];
  painPoints: string[];
  buyingTriggers: string[];
  summary: string;
  lastActivity: string;
  notes: string;
  avatarUrl?: string;
}

export interface OutreachConfig {
  channel: 'email' | 'linkedin_invite' | 'linkedin_inmail' | 'phone_whatsapp_pitch';
  tone: 'Consultative & Professional' | 'Direct & High-Impact' | 'Warm & Conversational' | 'Executive Brief';
  language: 'English' | 'Français' | 'Português' | 'Español';
  senderName: string;
  senderCompany: string;
  valueProp: string;
}

export interface GeneratedOutreach {
  subject: string;
  body: string;
  followUp: string;
  whyItWorks: string;
}
