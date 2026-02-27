import { LucideIcon } from 'lucide-react';

export type Status = 'Planned' | 'In Progress' | 'Completed' | 'Open' | 'Closed' | 'Overdue';
export type RiskLevel = 'High' | 'Medium' | 'Low';

export interface Audit {
  id: string;
  title: string;
  division: string;
  auditee: string;
  startDate: string;
  dueDate: string;
  progress: number;
  status: Status;
}

export interface Observation {
  controlNo: string;
  division: string;
  observation: string;
  risk: RiskLevel;
  dueDate: string;
  status: Status;
  assignee: {
    name: string;
    avatar: string;
  };
  predictedClosureDays?: number;
  predictionConfidence?: number;
  willMissSLA?: boolean;
}

export interface Risk {
  id: string;
  category: string;
  likelihood: number; // 1-5
  impact: number; // 1-5
  rating: RiskLevel;
  status: 'Active' | 'Mitigated' | 'Repeat';
  owner: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  skills?: string[];
  avgClosureDays?: number;
  activeObservationsCount?: number;
  activeAuditsCount?: number;
  SLAComplianceScore?: number;
  division?: string;
  seniorityLevel?: string;
}

export interface Division {
  id: string;
  name: string;
  description: string;
}

export interface Checklist {
  id: string;
  name: string;
  description: string;
  division: string;
}

export interface ChecklistItem {
  id: string;
  checkpoint: string;
  category: string;
  status: 'Pending' | 'Complete' | 'Observation' | 'Reopen';
  remarks: string;
  observationsCount: number;
}

export type AuditPhase = 'Planning' | 'Fieldwork' | 'Review' | 'Reporting' | 'Closure';

export interface AuditState {
  controlNo: string;
  division: string;
  type: string;
  phase: AuditPhase;
  isLocked: boolean;
  status: string;
}
