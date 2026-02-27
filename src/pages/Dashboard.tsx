import React, { useState } from 'react';
import { ClipboardList, AlertCircle, Clock, ShieldCheck, Plus, Eye, MessageSquarePlus, Sparkles, RefreshCw, Info, BrainCircuit, UserPlus } from 'lucide-react';
import { SummaryCard } from '../components/SummaryCard';
import { mockAudits, mockUsers } from '../data/mockData';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { Modal } from '../components/Modal';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { cn } from '../lib/utils';

export const Dashboard: React.FC = () => {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  
  // Modal State
  const [auditTitle, setAuditTitle] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('Finance');
  const [selectedAuditor, setSelectedAuditor] = useState('');
  
  // AI Recommendation State
  const [recommendation, setRecommendation] = useState<{
    auditor: User;
    confidence: number;
    explanation: string;
    isSkillMatch: boolean;
  } | null>(null);

  const generateRecommendation = () => {
    if (!auditTitle.trim()) return;

    const keywords = auditTitle.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    const scoredAuditors = mockUsers.map(user => {
      // 1. Skill Match (40%)
      const skillMatches = user.skills?.filter(skill => 
        keywords.some(kw => skill.toLowerCase().includes(kw))
      ).length || 0;
      const skillScore = Math.min((skillMatches / Math.max(keywords.length, 1)) * 100, 100);

      // 2. SLA Compliance (25%)
      const slaScore = user.SLAComplianceScore || 0;

      // 3. Lower Active Audits (20%)
      // Assume 10 audits is "full capacity"
      const workloadScore = Math.max(0, 100 - (user.activeAuditsCount || 0) * 10);

      // 4. Faster Closure Time (15%)
      // Assume 10 days is "slow", 2 days is "fast"
      const speedScore = Math.max(0, 100 - (user.avgClosureDays || 0) * 5);

      const totalScore = (skillScore * 0.4) + (slaScore * 0.25) + (workloadScore * 0.2) + (speedScore * 0.15);

      return {
        user,
        score: totalScore,
        isSkillMatch: skillMatches > 0
      };
    });

    const bestMatch = scoredAuditors.sort((a, b) => b.score - a.score)[0];
    
    if (bestMatch) {
      const confidence = Math.round(bestMatch.score);
      let explanation = "";
      
      if (bestMatch.isSkillMatch) {
        explanation = `Recommended based on strong experience in ${bestMatch.user.skills?.slice(0, 2).join(', ')} audits, ${bestMatch.user.SLAComplianceScore}% SLA adherence, and lowest active workload in ${bestMatch.user.division} division.`;
      } else {
        explanation = "No strong skill match found. Recommended based on workload optimization and high historical performance scores.";
      }

      setRecommendation({
        auditor: bestMatch.user,
        confidence,
        explanation,
        isSkillMatch: bestMatch.isSkillMatch
      });
    }
  };

  const handleUseRecommendation = () => {
    if (recommendation) {
      setSelectedAuditor(recommendation.auditor.name);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Audit Overview Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time governance and compliance metrics</p>
        </div>
        <button 
          onClick={() => {
            setIsAuditModalOpen(true);
            setRecommendation(null);
            setAuditTitle('');
            setSelectedAuditor('');
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create New Audit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Audits" 
          value="24" 
          icon={ClipboardList} 
          trend={{ value: "+12% vs LY", isPositive: true }}
        />
        <SummaryCard 
          title="Open Observations" 
          value="156" 
          icon={AlertCircle} 
          trend={{ value: "-5% vs PM", isPositive: true }}
        />
        <SummaryCard 
          title="Overdue Issues" 
          value="12" 
          icon={Clock} 
          trend={{ value: "+2 new", isPositive: false }}
        />
        <SummaryCard 
          title="Governance Health" 
          value="94.2%" 
          icon={ShieldCheck} 
          trend={{ value: "+0.4%", isPositive: true }}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold text-slate-900">AI Governance Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { text: "IT division risk trending upward by 18% based on recent patch delays.", color: "rose", icon: AlertCircle },
            { text: "Finance audits show 12% faster closure time this quarter.", color: "emerald", icon: ShieldCheck },
            { text: "2 repeat high-risk observations detected in Operations division.", color: "amber", icon: RefreshCw },
            { text: "Operations likely to exceed SLA targets for Q2 remediation.", color: "blue", icon: ClipboardList }
          ].map((insight, i) => (
            <div key={i} className={`bg-${insight.color}-50 border border-${insight.color}-100 p-4 rounded-2xl flex gap-3 items-start`}>
              <div className={`bg-${insight.color}-100 p-2 rounded-lg shrink-0`}>
                <insight.icon className={`w-4 h-4 text-${insight.color}-600`} />
              </div>
              <p className={`text-xs font-semibold text-${insight.color}-900 leading-relaxed`}>
                {insight.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">My Planned Audits</h2>
          <div className="flex gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter by:</span>
            <select className="text-xs font-semibold text-slate-600 bg-slate-50 border-none rounded-md px-2 py-1 outline-none">
              <option>All Divisions</option>
              <option>Finance</option>
              <option>IT</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Audit ID</th>
                <th className="px-6 py-4">Division</th>
                <th className="px-6 py-4">Auditee</th>
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockAudits.map((audit) => (
                <tr key={audit.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-sm text-blue-700 font-semibold">{audit.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{audit.division}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{audit.auditee}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-500">
                      <span className="block">Start: {audit.startDate}</span>
                      <span className="block">Due: {audit.dueDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 w-48">
                    <div className="flex items-center gap-3">
                      <ProgressBar progress={audit.progress} className="flex-1" />
                      <span className="text-xs font-bold text-slate-600">{audit.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={audit.status}>{audit.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors" title="Add Observation">
                        <MessageSquarePlus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isAuditModalOpen} 
        onClose={() => setIsAuditModalOpen(false)} 
        title="Create New Audit"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Audit Title</label>
              <input 
                type="text" 
                value={auditTitle}
                onChange={(e) => setAuditTitle(e.target.value)}
                onBlur={generateRecommendation}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="e.g. IT Security Compliance Review" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Division</label>
              <select 
                value={selectedDivision}
                onChange={(e) => {
                  setSelectedDivision(e.target.value);
                  generateRecommendation();
                }}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Finance</option>
                <option>IT</option>
                <option>Operations</option>
                <option>HR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Risk Category</label>
              <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                <option>Strategic</option>
                <option>Operational</option>
                <option>Financial</option>
                <option>Compliance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
              <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
              <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
              <textarea className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none" placeholder="Audit scope and objectives..."></textarea>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Auditor</label>
              <select 
                value={selectedAuditor}
                onChange={(e) => setSelectedAuditor(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Auditor</option>
                {mockUsers.map(u => (
                  <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            <AnimatePresence>
              {recommendation && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="col-span-2 bg-purple-50 border border-purple-100 rounded-xl p-4 shadow-md"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-bold text-purple-900">AI Recommended Auditor</span>
                      <div className="bg-purple-100 text-purple-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI
                      </div>
                      <div className="group relative">
                        <Info className="w-3 h-3 text-purple-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl z-50">
                          AI recommendation based on skill match, workload, and historical performance.
                        </div>
                      </div>
                    </div>
                    <div className="text-purple-600 text-xs font-bold">
                      Confidence: {recommendation.confidence}%
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={recommendation.auditor.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{recommendation.auditor.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {recommendation.auditor.seniorityLevel} – {recommendation.auditor.division} Division
                        </p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={handleUseRecommendation}
                      className="flex items-center gap-1.5 bg-white border border-purple-200 text-purple-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Use AI Recommendation
                    </button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-purple-100">
                    <p className="text-[10px] text-slate-600 italic leading-relaxed">
                      "{recommendation.explanation}"
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsAuditModalOpen(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md">Create Audit</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
