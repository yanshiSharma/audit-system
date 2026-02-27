import { Audit, Observation, Risk, User, Division, Checklist } from '../types';

export const mockAudits: Audit[] = [
  { id: 'AUD-2024-001', title: 'Q1 Financial Controls', division: 'Finance', auditee: 'John Smith', startDate: '2024-01-15', dueDate: '2024-03-30', progress: 65, status: 'In Progress' },
  { id: 'AUD-2024-002', title: 'IT Security Audit', division: 'IT', auditee: 'Sarah Chen', startDate: '2024-02-01', dueDate: '2024-04-15', progress: 20, status: 'In Progress' },
  { id: 'AUD-2024-003', title: 'HR Compliance Review', division: 'HR', auditee: 'Mike Johnson', startDate: '2024-03-10', dueDate: '2024-05-20', progress: 0, status: 'Planned' },
  { id: 'AUD-2024-004', title: 'Supply Chain Risk', division: 'Operations', auditee: 'Elena Rodriguez', startDate: '2023-11-01', dueDate: '2024-01-15', progress: 100, status: 'Completed' },
];

export const mockObservations: Observation[] = [
  { 
    controlNo: 'CTRL-012', 
    division: 'Finance', 
    observation: 'Incomplete documentation for travel expenses over $500', 
    risk: 'Medium', 
    dueDate: '2024-04-15', 
    status: 'Open', 
    assignee: { name: 'Alice Wong', avatar: 'https://i.pravatar.cc/150?u=alice' },
    predictedClosureDays: 4,
    predictionConfidence: 92,
    willMissSLA: false
  },
  { 
    controlNo: 'CTRL-045', 
    division: 'IT', 
    observation: 'Critical security patch missing on legacy server SRV-09', 
    risk: 'High', 
    dueDate: '2024-03-20', 
    status: 'Overdue', 
    assignee: { name: 'Bob Miller', avatar: 'https://i.pravatar.cc/150?u=bob' },
    predictedClosureDays: 12,
    predictionConfidence: 88,
    willMissSLA: true
  },
  { 
    controlNo: 'CTRL-089', 
    division: 'Operations', 
    observation: 'Warehouse safety protocols not updated for new machinery', 
    risk: 'High', 
    dueDate: '2024-05-01', 
    status: 'In Progress', 
    assignee: { name: 'Charlie Davis', avatar: 'https://i.pravatar.cc/150?u=charlie' },
    predictedClosureDays: 8,
    predictionConfidence: 85,
    willMissSLA: true
  },
  { 
    controlNo: 'CTRL-102', 
    division: 'HR', 
    observation: 'Employee handbook missing remote work policy updates', 
    risk: 'Low', 
    dueDate: '2024-06-15', 
    status: 'Closed', 
    assignee: { name: 'Diana Prince', avatar: 'https://i.pravatar.cc/150?u=diana' },
    predictedClosureDays: 3,
    predictionConfidence: 95,
    willMissSLA: false
  },
];

export const mockRisks: Risk[] = [
  { id: 'RSK-001', category: 'IT', likelihood: 4, impact: 5, rating: 'High', status: 'Active', owner: 'Sarah Chen' },
  { id: 'RSK-002', category: 'Finance', likelihood: 2, impact: 4, rating: 'Medium', status: 'Mitigated', owner: 'John Smith' },
  { id: 'RSK-003', category: 'Operations', likelihood: 3, impact: 3, rating: 'Medium', status: 'Active', owner: 'Elena Rodriguez' },
  { id: 'RSK-004', category: 'Compliance', likelihood: 1, impact: 5, rating: 'Low', status: 'Mitigated', owner: 'Mike Johnson' },
  { id: 'RSK-005', category: 'HR', likelihood: 5, impact: 2, rating: 'Medium', status: 'Repeat', owner: 'Sarah Chen' },
];

export const mockUsers: User[] = [
  { 
    id: '1', 
    name: 'Admin User', 
    email: 'admin@aura.com', 
    role: 'Administrator', 
    avatar: 'https://i.pravatar.cc/150?u=admin',
    skills: ['Governance', 'Risk Management', 'Compliance'],
    avgClosureDays: 5,
    activeObservationsCount: 2,
    activeAuditsCount: 1,
    SLAComplianceScore: 98,
    division: 'Admin',
    seniorityLevel: 'Director'
  },
  { 
    id: '2', 
    name: 'John Auditor', 
    email: 'john@aura.com', 
    role: 'Senior Auditor', 
    avatar: 'https://i.pravatar.cc/150?u=john',
    skills: ['Financial Audit', 'Compliance', 'Taxation'],
    avgClosureDays: 6,
    activeObservationsCount: 5,
    activeAuditsCount: 3,
    SLAComplianceScore: 92,
    division: 'Finance',
    seniorityLevel: 'Senior Auditor'
  },
  { 
    id: '3', 
    name: 'Sarah Risk', 
    email: 'sarah@aura.com', 
    role: 'Risk Manager', 
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    skills: ['IT Security', 'Risk Assessment', 'Cyber Security'],
    avgClosureDays: 4,
    activeObservationsCount: 3,
    activeAuditsCount: 2,
    SLAComplianceScore: 96,
    division: 'IT',
    seniorityLevel: 'Risk Manager'
  },
  {
    id: '4',
    name: 'Ravi Sharma',
    email: 'ravi@aura.com',
    role: 'Audit Manager',
    avatar: 'https://i.pravatar.cc/150?u=ravi',
    skills: ['IT Compliance', 'Cyber Security', 'Incident Management', 'Security Audit'],
    avgClosureDays: 4,
    activeObservationsCount: 3,
    activeAuditsCount: 2,
    SLAComplianceScore: 94,
    division: 'IT',
    seniorityLevel: 'Audit Manager'
  },
  {
    id: '5',
    name: 'Elena Rodriguez',
    email: 'elena@aura.com',
    role: 'Audit Lead',
    avatar: 'https://i.pravatar.cc/150?u=elena',
    skills: ['Operations', 'Supply Chain', 'Logistics', 'Quality Control'],
    avgClosureDays: 5,
    activeObservationsCount: 4,
    activeAuditsCount: 2,
    SLAComplianceScore: 95,
    division: 'Operations',
    seniorityLevel: 'Audit Lead'
  }
];

export const mockDivisions: Division[] = [
  { id: 'DIV-01', name: 'Finance', description: 'Corporate finance and accounting' },
  { id: 'DIV-02', name: 'IT', description: 'Information technology and infrastructure' },
  { id: 'DIV-03', name: 'Operations', description: 'Supply chain and logistics' },
];

export const mockChecklists: Checklist[] = [
  { id: 'CHK-01', name: 'Financial Control Framework', description: 'Standard SOX compliance checklist', division: 'Finance' },
  { id: 'CHK-02', name: 'ISO 27001 Security', description: 'Information security management system', division: 'IT' },
];
