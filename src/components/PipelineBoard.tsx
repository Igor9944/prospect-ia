import React from 'react';
import { Prospect, PipelineStage } from '../types';
import { 
  Sparkles, 
  Mail, 
  Flame, 
  Building2, 
  MapPin, 
  ArrowRight, 
  ChevronRight,
  Send,
  Calendar,
  Trophy,
  Compass,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface PipelineBoardProps {
  prospects: Prospect[];
  onSelectProspect: (prospect: Prospect) => void;
  onOpenOutreach: (prospect: Prospect) => void;
  onStageChange: (id: string, newStage: PipelineStage) => void;
}

const COLUMNS: { id: PipelineStage; title: string; color: string; icon: any }[] = [
  { id: 'discovered', title: 'Discovered', color: 'border-t-slate-400', icon: Compass },
  { id: 'contacted', title: 'Contacted', color: 'border-t-blue-500', icon: Send },
  { id: 'engaged', title: 'Engaged', color: 'border-t-indigo-500', icon: Clock },
  { id: 'meeting', title: 'Meeting Set', color: 'border-t-amber-500', icon: Calendar },
  { id: 'won', title: 'Converted', color: 'border-t-emerald-500', icon: Trophy },
  { id: 'nurturing', title: 'Nurturing', color: 'border-t-purple-500', icon: CheckCircle2 },
];

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  prospects,
  onSelectProspect,
  onOpenOutreach,
  onStageChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-6">
      {COLUMNS.map((col) => {
        const colProspects = prospects.filter((p) => p.stage === col.id);
        const Icon = col.icon;

        return (
          <div
            key={col.id}
            className={`bg-slate-100/80 rounded-xl p-3 border border-slate-200 border-t-4 ${col.color} flex flex-col min-h-[500px]`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 uppercase tracking-wider">
                <Icon className="w-3.5 h-3.5 text-slate-500" />
                <span>{col.title}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-slate-600 border border-slate-200">
                {colProspects.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {colProspects.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-400 font-medium">
                  No leads in stage
                </div>
              ) : (
                colProspects.map((p) => (
                  <div
                    key={p.id}
                    id={`kanban-card-${p.id}`}
                    onClick={() => onSelectProspect(p)}
                    className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {p.name}
                        </span>
                        {p.status === 'hot' && (
                          <span className="inline-flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full shrink-0">
                            <Flame className="w-2.5 h-2.5 mr-0.5 fill-amber-500" />
                            HOT
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-1 mb-1">{p.role}</p>

                      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-2">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{p.company}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-800">{p.fitScore}%</span>
                        <span className="text-slate-400">fit</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenOutreach(p);
                          }}
                          className="p-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                          title="Generate AI Outreach"
                        >
                          <Mail className="w-3 h-3" />
                        </button>

                        <select
                          value={p.stage}
                          onChange={(e) => {
                            e.stopPropagation();
                            onStageChange(p.id, e.target.value as PipelineStage);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-semibold bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-slate-700 cursor-pointer"
                        >
                          <option value="discovered">Discovered</option>
                          <option value="contacted">Contacted</option>
                          <option value="engaged">Engaged</option>
                          <option value="meeting">Meeting</option>
                          <option value="won">Converted</option>
                          <option value="nurturing">Nurturing</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
