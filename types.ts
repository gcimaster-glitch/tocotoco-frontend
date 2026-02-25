
export type DisabilityType = 'Physical' | 'Intellectual' | 'Mental' | 'Developmental' | 'Other';
export type DisclosureType = 'Open' | 'Closed';

export interface DisabilityInfo {
  type: DisabilityType;
  certificate: boolean; // 手帳の有無
  certificateGrade?: string; // 等級
  accommodations: string; // 必要な配慮事項
  disclosure: DisclosureType; // オープン就労かクローズか
}

export interface AgentStrategy {
  briefing: string; // エージェントへの裏要件（例：特定の障がい種別の受け入れ実績など）
  targetCompanies: string; // ターゲット層
  feeBonus: string; // インセンティブ
  speedCommitment: boolean;
}

export interface Job {
  id: string;
  catchphrase: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: 'Full-time' | 'Contract' | 'Part-time' | 'A-Type' | 'B-Type' | 'Agent' | 'Dispatch'; // A型・B型事業所など
  tags: string[]; // バリアフリー, 在宅OK, 時短など
  isClosed?: boolean;
  celebrationMoney: number;
  imageUrl: string;
  startDate?: 'Immediate' | 'Future';
  isAgent?: boolean;
  // For Analysis
  description?: string;
  requirements?: string;
  analysisScore?: number;
  analysisReport?: string;
  // Agent Specific
  agentStrategy?: AgentStrategy;
  // Disability Specific
  accessibleFeatures?: string[]; // 車椅子可、筆談対応など
}

export type UserPlan = 'free' | 'pro' | 'enterprise';
export type KYCStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'job_seeker' | 'employer' | 'admin' | 'agent';
  plan: UserPlan;
  kycStatus: KYCStatus;
  credits?: number;
  disabilityInfo?: DisabilityInfo; // Added
}

export type PipelineStatus = 'matching' | 'scout_sent' | 'interview' | 'offer' | 'hired' | 'agent_meeting';

export interface PipelineItem {
  id: string;
  candidateName: string;
  candidateId: string;
  targetCompany: string;
  jobTitle: string;
  status: PipelineStatus;
  lastUpdated: string;
  agentMemo?: string;
  aiInterviewReport?: string;
  aiInterviewScore?: number;
  hasAiInterview?: boolean;
}

export interface HonneFilterState {
  weeklyHolidays: number;
  selectedTags: string[];
  currentSalary: number;
  desiredIncreasePercent: number;
  privateNotes: string;
  disabilityDisclosure: 'Open' | 'Closed' | 'Undecided';
}

export interface AgentProfile {
  id: string;
  agencyName: string;
  representative: string;
  specialtyTags: string[]; // 精神保健福祉士在籍, 発達障がい特化など
  feeRate: string;
  description: string;
  logoUrl: string;
  rating: number;
  trackRecord: number;
  retentionRate?: string;
  strongArea?: string;
  kycStatus?: KYCStatus;
}

export interface AgentProposal {
  id: string;
  agentName: string;
  candidateMaskedName: string;
  candidateAge: string;
  candidateExperience: string;
  candidateSkills: string[];
  agentComment: string;
  salaryExpectation: string;
  status: 'review' | 'accepted' | 'rejected';
  receivedDate: string;
}

export enum ViewState {
  HOME = 'HOME',
  DASHBOARD = 'DASHBOARD',
  AGENT_DASHBOARD = 'AGENT_DASHBOARD',
  AGENT_PROFILE_EDIT = 'AGENT_PROFILE_EDIT',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  AI_RESUME = 'AI_RESUME',
  JOB_SEARCH = 'JOB_SEARCH',
  INTERVIEW_PRACTICE = 'INTERVIEW_PRACTICE',
  AI_DIAGNOSTICS = 'AI_DIAGNOSTICS',
  ABOUT_PRO = 'ABOUT_PRO',
  EMPLOYER_SCOUT = 'EMPLOYER_SCOUT', 
  EMPLOYER_JOB_CREATE = 'EMPLOYER_JOB_CREATE',
  EMPLOYER_FIND_AGENT = 'EMPLOYER_FIND_AGENT',
  ONLINE_SALON = 'ONLINE_SALON',     
  LEARNING = 'LEARNING',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  TERMS = 'TERMS', 
  PRIVACY = 'PRIVACY', 
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  type?: 'text' | 'job_recommendation' | 'interview_request';
  jobData?: Job;
  interviewData?: {
    date: string;
    type: string;
  };
}