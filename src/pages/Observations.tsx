import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Plus, MoreVertical, Upload, Sparkles, Info, BrainCircuit, Check, UserPlus } from 'lucide-react';
import { mockObservations, mockUsers } from '../data/mockData';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const Observations: React.FC = () => {
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState('Finance');
  const [selectedRisk, setSelectedRisk] = useState('Medium');

  const [selectedAssignee, setSelectedAssignee] = useState(mockUsers[0].name);

  // AI Smart Assignment Logic
  const recommendedAssignee = useMemo(() => {
    const candidates = mockUsers.filter(u => u.division === selectedDivision || u.role.includes('Auditor'));
    if (candidates.length === 0) return mockUsers[0];
    
    // Simple scoring: SLA score - workload + skills match
    const scored = candidates.map(u => {
      let score = (u.SLAComplianceScore || 0) - (u.activeObservationsCount || 0) * 2;
      if (u.division === selectedDivision) score += 10;
      return { ...u, score };
    });
    
    return scored.sort((a, b) => b.score - a.score)[0];
  }, [selectedDivision]);

  const handleUseAIRecommendation = () => {
    setSelectedAssignee(recommendedAssignee.name);
  };

  const overdueRiskCount = mockObservations.filter(o => o.willMissSLA && o.risk === 'High').length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Observation Tracker</h1>
          <p className="text-slate-500 mt-1">Track and manage all audit observations and remediation plans</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Sparkles className={cn("w-4 h-4 transition-colors", showAI ? "text-purple-600" : "text-slate-400")} />
            <span className="text-sm font-semibold text-slate-600">Enable AI Predictions</span>
            <button 
              onClick={() => setShowAI(!showAI)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                showAI ? "bg-purple-600" : "bg-slate-200"
              )}
            >
              <span className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                showAI ? "translate-x-6" : "translate-x-1"
              )} />
            </button>
          </div>
          <button 
            onClick={() => setIsObsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            New Observation
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAI && overdueRiskCount > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <BrainCircuit className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-purple-900">AI Governance Insight</p>
                <p className="text-xs text-purple-600 font-medium">
                  ⚠ {overdueRiskCount} high-risk observations are likely to miss SLA based on historical patterns and current workload.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search observations..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900"
          />
        </div>
        <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm font-medium text-slate-600">
          <option>All Divisions</option>
          <option>Finance</option>
          <option>IT</option>
          <option>Operations</option>
        </select>
        <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm font-medium text-slate-600">
          <option>Risk Level</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm font-medium text-slate-600">
          <option>Status</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Closed</option>
          <option>Overdue</option>
        </select>
        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
          <Filter className="w-5 h-5" />
        </button>
        <button className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-lg text-slate-600 font-semibold text-sm transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Control No</th>
                <th className="px-6 py-4">Division</th>
                <th className="px-6 py-4">Observation</th>
                <th className="px-6 py-4">Risk</th>
                <th className="px-6 py-4">Due Date</th>
                {showAI && (
                  <>
                    <th className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        🔮 Predicted Closure
                        <div className="group relative">
                          <Info className="w-3 h-3 cursor-help text-slate-400" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl z-50">
                            Prediction based on assignee history, workload, division efficiency, and SLA adherence.
                          </div>
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-4">Confidence</th>
                    <th className="px-6 py-4">Miss SLA?</th>
                  </>
                )}
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assignee</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockObservations.map((obs, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-blue-600 font-semibold">{obs.controlNo}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{obs.division}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 max-w-xs">
                    <p className="truncate font-medium">{obs.observation}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={obs.risk}>{obs.risk}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{obs.dueDate}</td>
                  {showAI && (
                    <>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold",
                          (obs.predictedClosureDays || 0) <= 5 ? "bg-emerald-50 text-emerald-600" :
                          (obs.predictedClosureDays || 0) <= 10 ? "bg-amber-50 text-amber-600" :
                          "bg-rose-50 text-rose-600"
                        )}>
                          {obs.predictedClosureDays} days
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-16">
                            <div 
                              className="h-full bg-purple-500 rounded-full" 
                              style={{ width: `${obs.predictionConfidence}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-400">{obs.predictionConfidence}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={obs.willMissSLA ? 'High' : 'Low'}>
                          {obs.willMissSLA ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4">
                    <Badge variant={obs.status}>{obs.status}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <img src={obs.assignee.avatar} alt={obs.assignee.name} className="w-6 h-6 rounded-full border border-slate-200" />
                      <span className="text-xs font-semibold text-slate-600">{obs.assignee.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 hover:bg-slate-50 rounded transition-colors">
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing 4 of 156 observations</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 bg-blue-600 border border-blue-600 rounded text-xs font-bold text-white">1</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-400 hover:bg-slate-50">2</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-400 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isObsModalOpen} 
        onClose={() => setIsObsModalOpen(false)} 
        title="Add New Observation"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Checkpoint / Control</label>
              <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-900">
                <option>CTRL-012: Expense Documentation</option>
                <option>CTRL-045: Server Patching</option>
                <option>CTRL-089: Safety Protocols</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Division</label>
              <select 
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              >
                <option>Finance</option>
                <option>IT</option>
                <option>Operations</option>
                <option>HR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Risk Level</label>
              <select 
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="col-span-2 bg-purple-50 border border-purple-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-bold text-purple-900">AI Smart Assignment</span>
                  <div className="group relative">
                    <Info className="w-3 h-3 text-purple-500 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl z-50">
                      AI recommendation is based on historical audit data and workload balancing.
                    </div>
                  </div>
                </div>
                <div className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {recommendedAssignee.SLAComplianceScore}% Match
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={recommendedAssignee.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{recommendedAssignee.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Selected due to {recommendedAssignee.SLAComplianceScore}% SLA adherence and lowest active workload in {selectedDivision} category.
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={handleUseAIRecommendation}
                  className="flex items-center gap-1.5 bg-white border border-purple-100 text-purple-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Use AI Recommendation
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Auditor</label>
              <input type="text" value="John Auditor" disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Assignee</label>
              <select 
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              >
                {mockUsers.map(u => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Observation Details</label>
              <textarea className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none text-slate-900" placeholder="Detailed description of the finding..."></textarea>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Evidence / Attachments</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer group">
                <Upload className="w-8 h-8 text-slate-300 group-hover:text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-medium">Click or drag files to upload evidence</p>
                <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG up to 10MB</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsObsModalOpen(false)} className="px-4 py-2 text-slate-500 font-semibold hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md">Create Observation</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
