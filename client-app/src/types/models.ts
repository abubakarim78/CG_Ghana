export type CaseStatus =
  | 'submitted'
  | 'assigned'
  | 'investigating'
  | 'intervention'
  | 'resolved';

export type CasePriority = 'low' | 'medium' | 'high' | 'critical';

export type CaseType =
  | 'child_labour_agriculture'
  | 'child_labour_fishing'
  | 'child_labour_mining'
  | 'child_labour_domestic'
  | 'child_labour_manufacturing'
  | 'child_labour_street'
  | 'trafficking_labour'
  | 'trafficking_sexual'
  | 'trafficking_domestic'
  | 'neglect'
  | 'early_marriage'
  | 'physical_abuse';

export type UserRole = 'reporter' | 'officer' | 'admin';

export type Gender = 'male' | 'female' | 'unknown';

export interface GhanaLocation {
  district: string;
  region: string;
  lat: number;
  lng: number;
  description?: string;
}

export interface CaseTimelineEvent {
  id: string;
  status: CaseStatus;
  timestamp: string;
  title: string;
  description: string;
  officerName?: string;
  isSystemEvent: boolean;
}

export interface Case {
  id: string;
  caseNumber?: string;
  type: CaseType;
  childAge: number;
  childGender: Gender;
  location: GhanaLocation;
  description: string;
  photos: string[];
  isAnonymous: boolean;
  isEmergency: boolean;
  status: CaseStatus;
  priority: CasePriority;
  riskScore: number;
  reportedAt: string;
  updatedAt: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  timeline: CaseTimelineEvent[];
}

export interface Officer {
  id: string;
  name: string;
  badge: string;
  district: string;
  region: string;
  role: 'social_worker' | 'police_dovvsu' | 'labour_inspector' | 'ngo_agent';
  languages: string[];
  caseload: number;
  resolvedThisMonth: number;
  phone: string;
  assignedCaseIds: string[];
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  officerId?: string;
  isAnonymous?: boolean;
}

export interface ReportDraft {
  type?: CaseType;
  isEmergency: boolean;
  childAge?: number;
  childGender?: Gender;
  childDescription?: string;
  location?: GhanaLocation;
  locationText?: string;
  description: string;
  photos: string[];
  isAnonymous: boolean;
  dangerTriage: {
    withPerp: boolean;
    recentViolence: boolean;
    noBasicNeeds: boolean;
  };
}

export interface OfflineQueueItem {
  id: string;
  type: 'submit_report' | 'update_status';
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
}

export interface MonthlyTrendData {
  month: string;
  count: number;
}

export interface CategoryData {
  label: string;
  value: number;
  color: string;
}

export interface RegionData {
  region: string;
  count: number;
  intensity: number;
}

export interface DashboardStats {
  totalCases: number;
  openCases: number;
  resolvedThisMonth: number;
  criticalCases: number;
  avgResponseHours: number;
  monthlyTrend: MonthlyTrendData[];
  casesByType: CategoryData[];
  casesByRegion: RegionData[];
}

export interface HeatmapPoint {
  district: string;
  region: string;
  lat: number;
  lng: number;
  caseCount: number;
  intensity: number;
}

export interface EducationSection {
  heading: string;
  type: 'definition' | 'signs' | 'actions' | 'facts' | 'law';
  items: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface EducationModule {
  id: string;
  category: 'labour' | 'trafficking' | 'how_to_report' | 'safety_tips';
  title: string;
  summary: string;
  iconName: string;
  color: string;
  sections: EducationSection[];
  quiz: QuizQuestion[];
  completedBy?: number;
}
