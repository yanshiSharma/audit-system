import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  Lock, 
  Send,
  AlertTriangle,
  FileText,
  Upload,
  X,
  Info,
  MessageSquarePlus,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ChecklistItem, AuditPhase, AuditState, User as UserType } from '../types';
import { mockUsers } from '../data/mockData';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';

// --- Mock Data ---
const initialChecklist: ChecklistItem[] = [
  { id: '1', checkpoint: 'Incident Reporting Processes Properly Documented', category: 'Incident Management', status: 'Complete', remarks: '', observationsCount: 0 },
  { id: '2', checkpoint: 'Incident Response Time Meets Internal SLA', category: 'Incident Management', status: 'Complete', remarks: '', observationsCount: 0 },
  { id: '3', checkpoint: 'Workplace Safety Materials Updated', category: 'Safety Compliance', status: 'Complete', remarks: '', observationsCount: 0 },
  { id: '4', checkpoint: 'Emergency Drills Conducted as Scheduled', category: 'Safety Compliance', status: 'Pending', remarks: '', observationsCount: 0 },
];

const phases: AuditPhase[] = ['Planning', 'Fieldwork', 'Review', 'Reporting', 'Closure'];

// --- Sub-components ---

const AuditorCard: React.FC<{ title: string; user: { name: string; role: string; email: string; phone: string; avatar: string } }> = ({ title, user }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
    <img src={user.avatar} className="w-12 h-12 rounded-full border-2 border-slate-100 shadow-sm" alt={user.name} />
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <h4 className="text-sm font-bold text-slate-900 truncate">{user.name}</h4>
      <p className="text-xs text-slate-500 mb-2">{user.role}</p>
      <div className="flex gap-3">
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Phone className="w-3 h-3" />
          {user.phone}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Mail className="w-3 h-3" />
          {user.email}
        </div>
      </div>
    </div>
  </div>
);

const PhaseStepper: React.FC<{ currentPhase: AuditPhase }> = ({ currentPhase }) => (
  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 w-full overflow-x-auto no-scrollbar">
    {phases.map((phase, idx) => {
      const isActive = phase === currentPhase;
      const isPast = phases.indexOf(phase) < phases.indexOf(currentPhase);
      
      return (
        <React.Fragment key={phase}>
          <div 
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 group relative",
              isActive 
                ? "bg-blue-600 text-white shadow-md" 
                : isPast 
                  ? "text-emerald-600" 
                  : "text-slate-400"
            )}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-32 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl z-10 normal-case font-medium text-center">
              Current lifecycle stage of the audit.
            </div>
            <span className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[9px] shrink-0 font-black",
              isActive ? "bg-white text-blue-600" : isPast ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
            )}>
              {isPast ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
            </span>
            {phase}
          </div>
          {idx < phases.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />}
        </React.Fragment>
      );
    })}
  </div>
);

// --- Main Page Component ---

export const AuditExecutionPage: React.FC = () => {
  const [audit, setAudit] = useState<AuditState>({
    controlNo: 'AUD-2026-OPS-01',
    division: 'Operations',
    type: 'Operational Compliance',
    phase: 'Reporting',
    isLocked: false,
    status: 'Reporting'
  });

  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [isObservationModalOpen, setIsObservationModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [observationGenerated, setObservationGenerated] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Panel Observation Form State
  const [panelObservation, setPanelObservation] = useState({
    description: '',
    risk: 'Medium',
    recommendation: ''
  });

  // Modal form state
  const [observationDetails, setObservationDetails] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignee, setAssignee] = useState(mockUsers[1].name);

  const stats = useMemo(() => {
    const total = checklist.length;
    const completed = checklist.filter(i => i.status === 'Complete').length;
    const observations = checklist.reduce((acc, curr) => acc + curr.observationsCount, 0);
    const pending = checklist.filter(i => i.status === 'Pending').length;
    const progress = Math.round((completed / total) * 100);
    
    return { total, completed, observations, pending, progress };
  }, [checklist]);

  const isSubmitDisabled = useMemo(() => {
    if (audit.isLocked) return true;
    if (!observationGenerated) return true;
    // All high priority observations must be addressed (not open)
    // For this simulation, we'll just check if there are any pending items
    return stats.pending > 0;
  }, [observationGenerated, stats.pending, audit.isLocked]);

  const handleStatusChange = (id: string, newStatus: string) => {
    if (audit.isLocked) return;
    
    if (newStatus === 'Observation') {
      const item = checklist.find(i => i.id === id);
      if (item) {
        setSelectedItem(item);
        setIsObservationModalOpen(true);
      }
    } else {
      setChecklist(prev => prev.map(item => 
        item.id === id ? { ...item, status: newStatus as any } : item
      ));
    }
  };

  const handleCreateObservation = () => {
    if (!selectedItem || !observationDetails.trim()) return;

    setChecklist(prev => prev.map(item => 
      item.id === selectedItem.id 
        ? { ...item, status: 'Observation', observationsCount: item.observationsCount + 1 } 
        : item
    ));

    setObservationGenerated(true);
    setIsObservationModalOpen(false);
    setSelectedItem(null);
    setObservationDetails('');
    showToast('Observation generated successfully.');
  };

  const handlePanelObservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!panelObservation.description.trim() || !panelObservation.recommendation.trim()) {
      showToast('Please fill in all required observation fields.', 'error');
      return;
    }
    setObservationGenerated(true);
    showToast('General observation generated successfully.');
  };

  const handleGenerateReport = () => {
    if (!observationGenerated) return;
    setReportGenerated(true);
    showToast('Audit report compiled successfully.');
  };

  const handleSubmitAudit = () => {
    if (!reportGenerated) {
      showToast('Report must be generated before submission.', 'error');
      return;
    }

    if (stats.pending > 0) {
      showToast('All checkpoints must be addressed before submission.', 'error');
      return;
    }

    setAudit(prev => ({
      ...prev,
      isLocked: true,
      phase: 'Closure',
      status: 'Closure'
    }));
    
    showToast('Audit submitted successfully and moved to Closure phase.');
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-20"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className={cn(
              "fixed top-0 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-bold text-sm",
              toast.type === 'error' ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
            )}
          >
            {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Audit Execution – Checklist</h1>
          <p className="text-slate-500 mt-1">Operational compliance fieldwork and evidence gathering</p>
        </div>
      </div>

      {/* Phase Stepper */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <PhaseStepper currentPhase={audit.phase} />
      </div>

      {/* Ticket Header Section */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Left Section: Audit Info */}
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Control No</p>
                <h3 className="text-lg font-black text-blue-900 font-mono tracking-tighter">{audit.controlNo}</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Status</p>
                <Badge variant={audit.status as any}>{audit.status}</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Division</p>
                <p className="text-sm font-bold text-slate-700">{audit.division}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Type</p>
                <p className="text-sm font-bold text-slate-700">{audit.type}</p>
              </div>
            </div>
          </div>

          {/* Middle Section: Stakeholders */}
          <div className="p-6 bg-slate-50/50 space-y-4">
            <AuditorCard 
              title="Lead Auditor" 
              user={{
                name: 'Ravi Sharma',
                role: 'Audit Manager',
                email: 'r.sharma@company.com',
                phone: '+91-98765 43210',
                avatar: 'https://i.pravatar.cc/150?u=ravi'
              }} 
            />
            <AuditorCard 
              title="Auditee" 
              user={{
                name: 'Suresh Verma',
                role: 'Operations Manager',
                email: 's.verma@company.com',
                phone: '+91-98765 11223',
                avatar: 'https://i.pravatar.cc/150?u=suresh'
              }} 
            />
          </div>

          {/* Right Section: Summary & Action */}
          <div className="p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">Audit Summary Panel</h3>
                <span className="text-xs font-bold text-blue-600">{stats.progress}% Complete</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Checkpoints</p>
                  <p className="text-xl font-black text-slate-900">{stats.total}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</p>
                  <p className="text-xl font-black text-emerald-600">{stats.completed}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Observations</p>
                  <p className="text-xl font-black text-amber-600">{stats.observations || 'None'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending</p>
                  <p className="text-xl font-black text-rose-600">{stats.pending}</p>
                </div>
              </div>

              <ProgressBar progress={stats.progress} className="h-2" />
            </div>

            <div className="group relative w-full">
              <button 
                onClick={handleSubmitAudit}
                disabled={!reportGenerated || audit.isLocked}
                className={cn(
                  "w-full mt-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95",
                  (!reportGenerated || audit.isLocked)
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                {audit.isLocked ? <Lock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                {audit.isLocked ? 'Audit Submitted' : 'Submit Audit'}
              </button>
              {!reportGenerated && !audit.isLocked && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl z-10 text-center font-medium">
                  Generate the audit report before submitting.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Summary Workflow Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Observation Generation Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Audit Summary – Observation Generation</h2>
              </div>
              {observationGenerated && (
                <Badge variant="Completed" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  Observation Logged
                </Badge>
              )}
            </div>
            <div className="p-6">
              {audit.phase === 'Reporting' && !audit.isLocked ? (
                <form onSubmit={handlePanelObservationSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Observation Description</label>
                      <textarea 
                        value={panelObservation.description}
                        onChange={(e) => setPanelObservation(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none text-sm"
                        placeholder="Detailed description of the finding..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Risk Level</label>
                      <select 
                        value={panelObservation.risk}
                        onChange={(e) => setPanelObservation(prev => ({ ...prev, risk: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recommendation</label>
                      <input 
                        type="text"
                        value={panelObservation.recommendation}
                        onChange={(e) => setPanelObservation(prev => ({ ...prev, recommendation: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Proposed remedial action..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      disabled={observationGenerated}
                      className={cn(
                        "px-6 py-2 rounded-lg font-bold transition-all shadow-md text-sm flex items-center gap-2",
                        observationGenerated 
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                          : "bg-amber-500 hover:bg-amber-600 text-white"
                      )}
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                      Generate Observation
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-8 text-center text-slate-400 italic">
                  Observation generation is only available during the Reporting phase.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Report Generation Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900">Report Generation</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Compile all logged observations and checklist results into a formal audit report for stakeholder review.
            </p>
            <button 
              onClick={handleGenerateReport}
              disabled={!observationGenerated || reportGenerated || audit.isLocked}
              className={cn(
                "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm",
                (!observationGenerated || reportGenerated || audit.isLocked)
                  ? "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed" 
                  : "bg-white border border-blue-200 text-blue-600 hover:bg-blue-50"
              )}
            >
              {reportGenerated ? <CheckCircle2 className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
              {reportGenerated ? 'Report Compiled' : 'Generate Report'}
            </button>
            {reportGenerated && (
              <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg">
                <CheckCircle2 className="w-3 h-3" />
                Audit report is ready for submission.
              </div>
            )}
          </div>

          {/* Submission Status Panel */}
          <div className="bg-slate-900 rounded-2xl shadow-xl p-6 text-white space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              Submission Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Observations</span>
                <span className={observationGenerated ? "text-emerald-400" : "text-amber-400"}>
                  {observationGenerated ? 'Completed' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Report Compilation</span>
                <span className={reportGenerated ? "text-emerald-400" : "text-amber-400"}>
                  {reportGenerated ? 'Completed' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Final Submission</span>
                <span className={audit.isLocked ? "text-emerald-400" : "text-slate-500"}>
                  {audit.isLocked ? 'Submitted' : 'Awaiting'}
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <button 
                onClick={handleSubmitAudit}
                disabled={!reportGenerated || audit.isLocked}
                className={cn(
                  "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                  (!reportGenerated || audit.isLocked)
                    ? "bg-slate-800 text-slate-600 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                )}
              >
                <Send className="w-4 h-4" />
                Submit Final Audit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edge Case: Warning Banner */}
      {!observationGenerated && !audit.isLocked && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <p className="text-sm font-bold text-amber-900">
            Reporting phase requires at least one observation before submission.
          </p>
        </motion.div>
      )}

      {/* Checklist Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">OPS Compliance Checklist</h2>
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {stats.completed} of {stats.total} Addressed
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="px-6 py-4 w-16">No.</th>
                <th className="px-6 py-4">Audit Checkpoint</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Remarks / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {checklist.map((item, idx) => (
                <tr key={item.id} className={cn(
                  "hover:bg-slate-50 transition-colors group",
                  audit.isLocked && "opacity-75"
                )}>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900 leading-tight">{item.checkpoint}</p>
                    {item.observationsCount > 0 && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Observation Raised
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded uppercase tracking-wider">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={item.status}
                      disabled={audit.isLocked}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={cn(
                        "text-xs font-bold px-3 py-1.5 rounded-lg border outline-none transition-all",
                        item.status === 'Pending' && "bg-slate-50 border-slate-200 text-slate-500",
                        item.status === 'Complete' && "bg-emerald-50 border-emerald-200 text-emerald-600",
                        item.status === 'Observation' && "bg-amber-50 border-amber-200 text-amber-600",
                        item.status === 'Reopen' && "bg-rose-50 border-rose-200 text-rose-600",
                        audit.isLocked && "cursor-not-allowed"
                      )}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Complete">Complete</option>
                      <option value="Observation">Generate Observation</option>
                      <option value="Reopen">Reopen</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <input 
                        type="text"
                        placeholder="Add remarks..."
                        disabled={audit.isLocked}
                        className="flex-1 bg-transparent text-xs text-slate-600 outline-none border-b border-transparent focus:border-blue-300 transition-all py-1"
                      />
                      {!audit.isLocked && (
                        <button 
                          onClick={() => {
                            setSelectedItem(item);
                            setIsObservationModalOpen(true);
                          }}
                          className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded transition-colors border border-amber-200 shadow-sm"
                        >
                          <MessageSquarePlus className="w-3 h-3" />
                          Generate Observation
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Observation Generation Modal */}
      <Modal 
        isOpen={isObservationModalOpen} 
        onClose={() => {
          setIsObservationModalOpen(false);
          setSelectedItem(null);
        }} 
        title="Observation Generation"
      >
        <div className="space-y-6">
          <div>
            <p className="text-xs text-slate-500 font-medium">Log an audit finding based on observed issue.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Checkpoint</label>
              <div className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-sm font-medium">
                {selectedItem?.checkpoint}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Auditor</label>
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                <img src="https://i.pravatar.cc/150?u=ravi" className="w-8 h-8 rounded-full" alt="" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Ravi Sharma</p>
                  <p className="text-[10px] text-slate-500">Audit Manager</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assignee</label>
              <select 
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              >
                {mockUsers.map(u => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</label>
              <div className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-sm font-medium">
                In Progress
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Priority</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Observation Details</label>
              <textarea 
                value={observationDetails}
                onChange={(e) => setObservationDetails(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none text-sm font-medium" 
                placeholder="Describe the issue found..."
              ></textarea>
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Attach Evidence</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:border-blue-400 transition-colors cursor-pointer group">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-10 w-10 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  <div className="flex text-sm text-slate-600">
                    <span className="relative cursor-pointer bg-white rounded-md font-bold text-blue-600 hover:text-blue-500">
                      Upload a file
                    </span>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                    PDF, PNG, JPG up to 50MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => {
                setIsObservationModalOpen(false);
                setSelectedItem(null);
              }} 
              className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleCreateObservation}
              disabled={!observationDetails.trim()}
              className={cn(
                "px-6 py-2 rounded-lg font-bold transition-all shadow-md text-sm",
                !observationDetails.trim() 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              Create Observation
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};
