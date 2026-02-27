import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, RefreshCw, Plus } from 'lucide-react';
import { SummaryCard } from '../components/SummaryCard';
import { mockRisks } from '../data/mockData';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const COLORS = ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];

const riskDistributionData = [
  { name: 'Operations', value: 35 },
  { name: 'IT', value: 25 },
  { name: 'Finance', value: 20 },
  { name: 'HR', value: 10 },
  { name: 'Compliance', value: 10 },
];

const tags = ['SLA Breach', 'Data Privacy', 'IT Security', 'Market Volatility', 'Regulatory Change', 'Supply Chain', 'Talent Retention', 'Fraud Risk'];

export const Risk: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'heatmap'>('register');
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Risk Intelligence Dashboard</h1>
          <p className="text-slate-500 mt-1">Strategic risk monitoring and mitigation tracking</p>
        </div>
        <button 
          onClick={() => setIsRiskModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add Risk
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Total Risks" value="48" icon={ShieldAlert} />
        <SummaryCard title="Open Risks" value="32" icon={AlertTriangle} />
        <SummaryCard title="Mitigated Risks" value="14" icon={CheckCircle} />
        <SummaryCard title="Repeat Risks" value="2" icon={RefreshCw} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-100">
          <div className="flex px-6">
            {(['register', 'heatmap'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2",
                  activeTab === tab 
                    ? "border-blue-600 text-blue-600" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                {tab.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'register' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-6 py-4">Risk ID</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Likelihood</th>
                      <th className="px-6 py-4">Impact</th>
                      <th className="px-6 py-4">Rating</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Owner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mockRisks.map((risk) => (
                      <tr key={risk.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-blue-700 font-semibold">{risk.id}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{risk.category}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div key={i} className={cn("w-2 h-2 rounded-full", i <= risk.likelihood ? "bg-blue-600" : "bg-slate-200")} />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div key={i} className={cn("w-2 h-2 rounded-full", i <= risk.impact ? "bg-rose-600" : "bg-slate-200")} />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={risk.rating}>{risk.rating}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={risk.status}>{risk.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{risk.owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page 1 of 5</span>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">Previous</button>
                  <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">Next</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'heatmap' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Risk Heat Map (Impact vs Likelihood)</h3>
                <div className="grid grid-cols-6 grid-rows-6 gap-1 aspect-square max-w-md border-l-2 border-b-2 border-slate-300 p-2 relative">
                  <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold text-slate-400 uppercase tracking-widest">Likelihood</div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400 uppercase tracking-widest">Impact</div>
                  
                  {Array.from({ length: 25 }).map((_, i) => {
                    const row = 5 - Math.floor(i / 5);
                    const col = (i % 5) + 1;
                    const score = row * col;
                    let bgColor = 'bg-emerald-50';
                    if (score > 15) bgColor = 'bg-rose-500';
                    else if (score > 8) bgColor = 'bg-amber-400';
                    else if (score > 4) bgColor = 'bg-emerald-400';

                    return (
                      <div key={i} className={cn("rounded-sm flex items-center justify-center text-[10px] font-bold text-white/50", bgColor)}>
                        {score}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Risk Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {riskDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Keyword Tag Cloud</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:border-blue-400 transition-colors cursor-pointer">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isRiskModalOpen} 
        onClose={() => setIsRiskModalOpen(false)} 
        title="Add New Risk"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Risk Title</label>
              <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Cyber Security Breach" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
              <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                <option>Operations</option>
                <option>IT</option>
                <option>Finance</option>
                <option>Compliance</option>
                <option>HR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Owner</label>
              <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Risk owner name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Likelihood (1-5)</label>
              <input type="number" min="1" max="5" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Impact (1-5)</label>
              <input type="number" min="1" max="5" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Mitigation Plan</label>
              <textarea className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none" placeholder="Describe the steps to mitigate this risk..."></textarea>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsRiskModalOpen(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md">Add Risk</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
