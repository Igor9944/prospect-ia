import React, { useState } from 'react';
import { Prospect, OutreachConfig, GeneratedOutreach } from '../types';
import { 
  X, 
  Sparkles, 
  Mail, 
  Linkedin, 
  Phone, 
  Copy, 
  Check, 
  Send, 
  MessageSquare,
  Globe,
  Sliders,
  RefreshCw,
  Lightbulb
} from 'lucide-react';

interface OutreachModalProps {
  prospect: Prospect | null;
  isOpen: boolean;
  onClose: () => void;
  onLogOutreachSent: (prospectId: string) => void;
}

export const OutreachModal: React.FC<OutreachModalProps> = ({
  prospect,
  isOpen,
  onClose,
  onLogOutreachSent,
}) => {
  if (!isOpen || !prospect) return null;

  const [config, setConfig] = useState<OutreachConfig>({
    channel: 'email',
    tone: 'Consultative & Professional',
    language: 'English',
    senderName: 'Alex Morgan',
    senderCompany: 'Prospect IA',
    valueProp: 'Automate high-intent lead qualification & multichannel outreach',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedOutreach | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospect,
          senderName: config.senderName,
          senderCompany: config.senderCompany,
          valueProp: config.valueProp,
          tone: config.tone,
          language: config.language,
          channel: config.channel,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setResult(data.data);
      }
    } catch (err) {
      console.error('Failed to generate outreach:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Outreach Generator</h2>
              <p className="text-xs text-slate-500">
                Personalized for <span className="font-semibold text-slate-800">{prospect.name}</span> ({prospect.role} at {prospect.company})
              </p>
            </div>
          </div>

          <button
            id="close-outreach-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          {/* Channel Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
              Outreach Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'email', label: 'Cold Email', icon: Mail },
                { id: 'linkedin_invite', label: 'LinkedIn Invite', icon: Linkedin },
                { id: 'linkedin_inmail', label: 'LinkedIn InMail', icon: MessageSquare },
                { id: 'phone_whatsapp_pitch', label: 'Call / WhatsApp', icon: Phone },
              ].map((ch) => {
                const Icon = ch.icon;
                const isSelected = config.channel === ch.id;
                return (
                  <button
                    key={ch.id}
                    id={`channel-btn-${ch.id}`}
                    type="button"
                    onClick={() => setConfig({ ...config, channel: ch.id as any })}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone & Language Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" />
                Tone & Personality
              </label>
              <select
                id="outreach-tone-select"
                value={config.tone}
                onChange={(e) => setConfig({ ...config, tone: e.target.value as any })}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Consultative & Professional">Consultative & Professional</option>
                <option value="Direct & High-Impact">Direct & High-Impact</option>
                <option value="Warm & Conversational">Warm & Conversational</option>
                <option value="Executive Brief">Executive Brief (Ultra concise)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                Language
              </label>
              <select
                id="outreach-language-select"
                value={config.language}
                onChange={(e) => setConfig({ ...config, language: e.target.value as any })}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="English">English</option>
                <option value="Français">Français (French)</option>
                <option value="Português">Português (Portuguese)</option>
                <option value="Español">Español (Spanish)</option>
              </select>
            </div>
          </div>

          {/* Value Prop & Sender Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Sender Name & Company</label>
              <div className="flex gap-2">
                <input
                  id="sender-name-input"
                  type="text"
                  value={config.senderName}
                  onChange={(e) => setConfig({ ...config, senderName: e.target.value })}
                  placeholder="Your Name"
                  className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
                <input
                  id="sender-company-input"
                  type="text"
                  value={config.senderCompany}
                  onChange={(e) => setConfig({ ...config, senderCompany: e.target.value })}
                  placeholder="Your Company"
                  className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-600 block mb-1">Core Pitch / Value Prop</label>
              <input
                id="sender-valueprop-input"
                type="text"
                value={config.valueProp}
                onChange={(e) => setConfig({ ...config, valueProp: e.target.value })}
                placeholder="Value proposition to highlight"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="pt-1">
            <button
              id="trigger-generate-btn"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Prospect Intelligence...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Personalized Message</span>
                </>
              )}
            </button>
          </div>

          {/* Results Display */}
          {result && (
            <div className="mt-4 space-y-3 pt-3 border-t border-slate-200">
              {/* Subject Line */}
              {result.subject && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Subject Line
                    </span>
                    <button
                      id="copy-subject-btn"
                      onClick={() => copyToClipboard(result.subject, 'subject')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                    >
                      {copiedSection === 'subject' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-semibold text-slate-900 text-xs">{result.subject}</p>
                </div>
              )}

              {/* Message Body */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Primary Message Body
                  </span>
                  <button
                    id="copy-body-btn"
                    onClick={() => copyToClipboard(result.body, 'body')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                  >
                    {copiedSection === 'body' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans bg-white p-3 rounded-lg border border-slate-200/80">
                  {result.body}
                </div>
              </div>

              {/* Follow-up script */}
              {result.followUp && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Day 3 Follow-Up
                    </span>
                    <button
                      id="copy-followup-btn"
                      onClick={() => copyToClipboard(result.followUp, 'followup')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                    >
                      {copiedSection === 'followup' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 whitespace-pre-line">{result.followUp}</p>
                </div>
              )}

              {/* Psychological Reason */}
              {result.whyItWorks && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2 text-xs text-emerald-900">
                  <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Conversion Angle:</span> {result.whyItWorks}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <button
            id="cancel-modal-btn"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>

          {result && (
            <button
              id="mark-sent-btn"
              onClick={() => {
                onLogOutreachSent(prospect.id);
                onClose();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Mark Outreach Sent</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
