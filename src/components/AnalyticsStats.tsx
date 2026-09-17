import React from 'react';
import { Prospect } from '../types';
import { Target, Flame, DollarSign, Award, ArrowUpRight, TrendingUp } from 'lucide-react';

interface AnalyticsStatsProps {
  prospects: Prospect[];
}

export const AnalyticsStats: React.FC<AnalyticsStatsProps> = ({ prospects }) => {
  const total = prospects.length;
  const hotLeads = prospects.filter((p) => p.status === 'hot').length;
  const qualified = prospects.filter((p) => p.fitScore >= 85).length;
  const avgFit = total > 0 ? Math.round(prospects.reduce((acc, p) => acc + p.fitScore, 0) / total) : 0;
  const avgIntent = total > 0 ? Math.round(prospects.reduce((acc, p) => acc + p.intentScore, 0) / total) : 0;
  const meetings = prospects.filter((p) => p.stage === 'meeting' || p.stage === 'won').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {/* Stat 1 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Leads</span>
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{total}</div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span className="text-emerald-600 font-medium">+18%</span> vs last month
          </p>
        </div>
      </div>

      {/* Stat 2 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Hot Leads</span>
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{hotLeads}</div>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-slate-700">{Math.round((hotLeads / (total || 1)) * 100)}%</span> of active pipeline
          </p>
        </div>
      </div>

      {/* Stat 3 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">High ICP Fit (&gt;85)</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{qualified}</div>
          <p className="text-xs text-slate-500 mt-1">
            Avg Score: <span className="font-semibold text-slate-800">{avgFit}/100</span>
          </p>
        </div>
      </div>

      {/* Stat 4 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Avg Buyer Intent</span>
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{avgIntent}%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${avgIntent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stat 5 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 md:col-span-4 lg:col-span-1 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Deals & Meetings</span>
          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{meetings} Active</div>
          <p className="text-xs text-slate-500 mt-1">
            Est. ARR: <span className="font-semibold text-slate-900">~$135,000</span>
          </p>
        </div>
      </div>
    </div>
  );
};
