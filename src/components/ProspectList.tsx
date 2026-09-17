import React, { useState } from 'react';
import { Prospect, PipelineStage, LeadStatus } from '../types';
import { 
  Sparkles, 
  Mail, 
  Flame, 
  MapPin, 
  Building2, 
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Calendar,
  Trophy,
  Compass
} from 'lucide-react';

interface ProspectListProps {
  prospects: Prospect[];
  selectedProspect: Prospect | null;
  onSelectProspect: (prospect: Prospect) => void;
  onOpenOutreach: (prospect: Prospect) => void;
  onEnrichProspect: (prospect: Prospect) => void;
  onStageChange: (id: string, newStage: PipelineStage) => void;
}

const STAGE_LABELS: Record<PipelineStage, { label: string; color: string; icon: any }> = {
  discovered: { label: 'Discovered', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Compass },
  contacted: { label: 'Contacted', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Send },
  engaged: { label: 'Engaged', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Clock },
  meeting: { label: 'Meeting Set', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Calendar },
  won: { label: 'Converted', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Trophy },
  nurturing: { label: 'Nurturing', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: CheckCircle2 },
};

export const ProspectList: React.FC<ProspectListProps> = ({
  prospects,
  selectedProspect,
  onSelectProspect,
  onOpenOutreach,
  onEnrichProspect,
  onStageChange,
}) => {
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [enrichingId, setEnrichingId] = useState<string | null>(null);

  const filtered = prospects.filter((p) => {
    if (selectedStage !== 'all' && p.stage !== selectedStage) return false;
    if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
    return true;
  });

  const handleEnrichClick = async (e: React.MouseEvent, p: Prospect) => {
    e.stopPropagation();
    setEnrichingId(p.id);
    try {
      await onEnrichProspect(p);
    } finally {
      setEnrichingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Filter Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Filters:</span>
          
          {/* Stage Filter */}
          <select
            id="filter-stage-select"
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Stages ({prospects.length})</option>
            <option value="discovered">Discovered</option>
            <option value="contacted">Contacted</option>
            <option value="engaged">Engaged</option>
            <option value="meeting">Meeting Set</option>
            <option value="won">Converted</option>
            <option value="nurturing">Nurturing</option>
          </select>

          {/* Priority Status Filter */}
          <select
            id="filter-status-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Lead Priorities</option>
            <option value="hot">🔥 Hot Only</option>
            <option value="warm">⚡ Warm Only</option>
            <option value="cold">❄️ Cold Only</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{filtered.length}</span> of {prospects.length} prospects
        </div>
      </div>

      {/* Prospect Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Lead & Role</th>
              <th className="py-3 px-4">Company & Tech</th>
              <th className="py-3 px-4">ICP Fit</th>
              <th className="py-3 px-4">Intent</th>
              <th className="py-3 px-4">Pipeline Stage</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <Compass className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-medium">No prospects found matching your current filter.</p>
                  <p className="text-xs text-slate-400 mt-1">Try resetting the filters or add a new lead.</p>
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const isSelected = selectedProspect?.id === p.id;
                const stageInfo = STAGE_LABELS[p.stage] || STAGE_LABELS.discovered;
                const StageIcon = stageInfo.icon;

                return (
                  <tr
                    key={p.id}
                    id={`prospect-row-${p.id}`}
                    onClick={() => onSelectProspect(p)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Lead info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=6366f1&color=fff`}
                          alt={p.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{p.name}</span>
                            {p.status === 'hot' && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                <Flame className="w-2.5 h-2.5 mr-0.5 fill-amber-500 text-amber-500" />
                                HOT
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{p.role}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {p.location}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Company & Tech */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {p.company}
                      </div>
                      <p className="text-xs text-slate-500">{p.industry}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {p.techStack.slice(0, 2).map((tech) => (
                          <span
                            key={tech}
                            className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-md border border-slate-200"
                          >
                            {tech}
                          </span>
                        ))}
                        {p.techStack.length > 2 && (
                          <span className="inline-block px-1 py-0.5 text-[10px] text-slate-400">
                            +{p.techStack.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* ICP Fit */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{p.fitScore}%</span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              p.fitScore >= 90
                                ? 'bg-emerald-500'
                                : p.fitScore >= 75
                                ? 'bg-indigo-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${p.fitScore}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {p.fitScore >= 90 ? 'High Fit' : p.fitScore >= 75 ? 'Moderate' : 'Low'}
                      </span>
                    </td>

                    {/* Intent */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">{p.intentScore}%</span>
                        <span className="text-[10px] text-slate-400">signals</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-[130px]" title={p.buyingTriggers[0]}>
                        {p.buyingTriggers[0] || 'Active hiring'}
                      </p>
                    </td>

                    {/* Stage Selector */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <select
                          id={`stage-select-${p.id}`}
                          value={p.stage}
                          onChange={(e) => onStageChange(p.id, e.target.value as PipelineStage)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border appearance-none pr-6 cursor-pointer focus:outline-hidden ${stageInfo.color}`}
                        >
                          <option value="discovered">Discovered</option>
                          <option value="contacted">Contacted</option>
                          <option value="engaged">Engaged</option>
                          <option value="meeting">Meeting Set</option>
                          <option value="won">Converted</option>
                          <option value="nurturing">Nurturing</option>
                        </select>
                        <StageIcon className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`enrich-btn-${p.id}`}
                          onClick={(e) => handleEnrichClick(e, p)}
                          title="Enrich with Prospect IA"
                          disabled={enrichingId === p.id}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs inline-flex items-center gap-1"
                        >
                          <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${enrichingId === p.id ? 'animate-spin' : ''}`} />
                          <span className="hidden sm:inline">Enrich</span>
                        </button>

                        <button
                          id={`outreach-btn-${p.id}`}
                          onClick={() => onOpenOutreach(p)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-2xs shadow-indigo-200 inline-flex items-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Outreach</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
