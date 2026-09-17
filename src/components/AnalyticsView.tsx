import React from 'react';
import { Prospect } from '../types';
import { 
  TrendingUp, 
  Users, 
  Flame, 
  DollarSign, 
  BarChart2, 
  PieChart, 
  CheckCircle,
  Zap
} from 'lucide-react';

interface AnalyticsViewProps {
  prospects: Prospect[];
  onSelectProspect: (prospect: Prospect) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ prospects, onSelectProspect }) => {
  const stageCounts = {
    discovered: prospects.filter((p) => p.stage === 'discovered').length,
    contacted: prospects.filter((p) => p.stage === 'contacted').length,
    engaged: prospects.filter((p) => p.stage === 'engaged').length,
    meeting: prospects.filter((p) => p.stage === 'meeting').length,
    won: prospects.filter((p) => p.stage === 'won').length,
    nurturing: prospects.filter((p) => p.stage === 'nurturing').length,
  };

  const industries = prospects.reduce((acc, p) => {
    acc[p.industry] = (acc[p.industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const highFitLeads = [...prospects].sort((a, b) => b.fitScore - a.fitScore).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Funnel Overview */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              Prospect Pipeline Velocity & Conversion Funnel
            </h3>
            <p className="text-xs text-slate-500">Live progression of accounts across acquisition stages</p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <Zap className="w-3 h-3 fill-emerald-500" />
            Active AI Sourcing
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: 'Discovered', count: stageCounts.discovered, color: 'bg-slate-500' },
            { label: 'Contacted', count: stageCounts.contacted, color: 'bg-blue-500' },
            { label: 'Engaged', count: stageCounts.engaged, color: 'bg-indigo-500' },
            { label: 'Meetings', count: stageCounts.meeting, color: 'bg-amber-500' },
            { label: 'Converted', count: stageCounts.won, color: 'bg-emerald-500' },
            { label: 'Nurturing', count: stageCounts.nurturing, color: 'bg-purple-500' },
          ].map((stage, idx) => (
            <div key={stage.label} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                {stage.label}
              </span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                {stage.count}
              </span>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${stage.color}`}
                  style={{ width: `${Math.min(100, (stage.count / (prospects.length || 1)) * 100 * 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid of Two Columns: High Priority Accounts & Industry Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Highest Fit Prospects */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            Top Ranked High-Fit Accounts (AI Prioritized)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Immediate outreach recommended based on fit & buyer intent</p>

          <div className="space-y-3">
            {highFitLeads.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProspect(p)}
                className="p-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{p.name}</span>
                    <span className="text-[11px] text-slate-500">{p.role} • {p.company}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    {p.fitScore}% ICP Fit
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{p.estimatedRevenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Industry & Tech Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-500" />
            Industry & Market Segment Breakdown
          </h3>
          <p className="text-xs text-slate-500 mb-4">Distribution of leads across target vertical sectors</p>

          <div className="space-y-3">
            {Object.entries(industries).map(([ind, count]) => {
              const pct = Math.round((count / (prospects.length || 1)) * 100);
              return (
                <div key={ind}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">{ind}</span>
                    <span className="text-slate-500">{count} leads ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
