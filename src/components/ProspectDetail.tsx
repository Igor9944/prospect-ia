import React from 'react';
import { Prospect, PipelineStage } from '../types';
import { 
  X, 
  Sparkles, 
  Mail, 
  Phone, 
  Linkedin, 
  Building2, 
  MapPin, 
  Flame, 
  CheckCircle2, 
  AlertCircle,
  Lightbulb,
  Cpu,
  TrendingUp,
  DollarSign,
  Users2
} from 'lucide-react';

interface ProspectDetailProps {
  prospect: Prospect | null;
  onClose: () => void;
  onOpenOutreach: (prospect: Prospect) => void;
  onEnrichProspect: (prospect: Prospect) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onStageChange: (id: string, stage: PipelineStage) => void;
}

export const ProspectDetail: React.FC<ProspectDetailProps> = ({
  prospect,
  onClose,
  onOpenOutreach,
  onEnrichProspect,
  onUpdateNotes,
  onStageChange,
}) => {
  if (!prospect) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={prospect.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(prospect.name)}&background=6366f1&color=fff`}
            alt={prospect.name}
            className="w-13 h-13 rounded-2xl object-cover border-2 border-white shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{prospect.name}</h2>
              {prospect.status === 'hot' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  <Flame className="w-3 h-3 mr-0.5 text-amber-500 fill-amber-500" />
                  HOT
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-600">{prospect.role}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                {prospect.company}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {prospect.location}
              </span>
            </div>
          </div>
        </div>

        <button
          id="close-detail-btn"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Scrollable */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
        {/* Quick Contact Chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          <a
            href={`mailto:${prospect.email}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-600" />
            {prospect.email}
          </a>
          {prospect.phone && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-medium">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              {prospect.phone}
            </span>
          )}
          {prospect.linkedin && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-medium">
              <Linkedin className="w-3.5 h-3.5 text-blue-600" />
              LinkedIn Profile
            </span>
          )}
        </div>

        {/* AI Scoring Summary Grid */}
        <div className="bg-gradient-to-br from-indigo-50/50 via-slate-50 to-blue-50/40 p-4 rounded-xl border border-indigo-100 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Prospect IA Qualification</span>
            </div>
            <button
              id="detail-reenrich-btn"
              onClick={() => onEnrichProspect(prospect)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Re-analyze
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 block">ICP Fit Score</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900">{prospect.fitScore}%</span>
                <span className="text-xs font-semibold text-emerald-600">
                  {prospect.fitScore >= 85 ? 'High Priority' : 'Moderate'}
                </span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 block">Buyer Intent Signals</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900">{prospect.intentScore}%</span>
                <span className="text-xs font-semibold text-blue-600">Strong</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-indigo-50">
            {prospect.summary}
          </p>
        </div>

        {/* Firmographics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 block font-medium flex items-center gap-1">
              <Users2 className="w-3.5 h-3.5 text-slate-500" />
              Company Size
            </span>
            <span className="font-semibold text-slate-800 mt-1 block">{prospect.companySize}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 block font-medium flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-500" />
              Est. Revenue
            </span>
            <span className="font-semibold text-slate-800 mt-1 block">{prospect.estimatedRevenue}</span>
          </div>
        </div>

        {/* Pain Points */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            Detected Pain Points
          </h3>
          <ul className="space-y-1.5">
            {prospect.painPoints.map((pain, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{pain}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Buying Triggers */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            Recent Triggers & Catalysts
          </h3>
          <ul className="space-y-1.5">
            {prospect.buyingTriggers.map((trigger, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{trigger}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tech Stack */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            Detected Tech Stack
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {prospect.techStack.map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Prospect Notes */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Internal Sales Notes
          </h3>
          <textarea
            id="prospect-notes-input"
            value={prospect.notes}
            onChange={(e) => onUpdateNotes(prospect.id, e.target.value)}
            rows={3}
            placeholder="Add notes, previous conversations, objections..."
            className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Footer Fixed Action */}
      <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Stage:</span>
          <select
            id="detail-stage-select"
            value={prospect.stage}
            onChange={(e) => onStageChange(prospect.id, e.target.value as PipelineStage)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
          >
            <option value="discovered">Discovered</option>
            <option value="contacted">Contacted</option>
            <option value="engaged">Engaged</option>
            <option value="meeting">Meeting Set</option>
            <option value="won">Converted</option>
            <option value="nurturing">Nurturing</option>
          </select>
        </div>

        <button
          id="detail-generate-outreach-btn"
          onClick={() => onOpenOutreach(prospect)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs shadow-indigo-200 flex items-center gap-2 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Outreach</span>
        </button>
      </div>
    </div>
  );
};
