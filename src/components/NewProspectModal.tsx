import React, { useState } from 'react';
import { Prospect } from '../types';
import { X, Sparkles, Plus, RefreshCw } from 'lucide-react';

interface NewProspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProspect: (prospect: Omit<Prospect, 'id'>) => void;
}

export const NewProspectModal: React.FC<NewProspectModalProps> = ({
  isOpen,
  onClose,
  onAddProspect,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('B2B SaaS / Tech');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');
  const [isAutoEnriching, setIsAutoEnriching] = useState(false);

  const handleAutoEnrich = async () => {
    if (!company) {
      alert('Please enter a company name first to run AI intelligence.');
      return;
    }
    setIsAutoEnriching(true);
    try {
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, company, role, industry, website, currentNotes: notes }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setNotes((prev) => (prev ? `${prev}\n\n[AI Summary]: ${data.data.summary}` : data.data.summary));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAutoEnriching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company) return;

    onAddProspect({
      name,
      role: role || 'Executive',
      company,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone,
      location: location || 'Remote / Worldwide',
      industry: industry || 'Technology',
      stage: 'discovered',
      fitScore: Math.floor(75 + Math.random() * 20),
      intentScore: Math.floor(70 + Math.random() * 25),
      status: 'warm',
      companySize: '50 - 150 employees',
      estimatedRevenue: '$5M - $20M ARR',
      techStack: ['CRM', 'Analytics', 'Cloud'],
      painPoints: ['Outbound pipeline predictability', 'Scaling lead qualification'],
      buyingTriggers: ['Recent company growth milestone'],
      summary: `${name} leads ${role || 'operations'} at ${company}.`,
      lastActivity: 'Just now',
      notes: notes || 'Recently added to prospecting queue.',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600 text-white">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add New Prospect</h2>
              <p className="text-xs text-slate-500">Input lead parameters for AI scoring and qualification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Prospect Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Marc Dubois"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Company *</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. CloudScale AI"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Job Role / Title</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. VP Sales / Growth"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. SaaS / E-commerce"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Direct Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marc@company.com"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Location / HQ</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lyon, France"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Notes & Context</label>
              <button
                type="button"
                onClick={handleAutoEnrich}
                disabled={isAutoEnriching || !company}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 disabled:opacity-50"
              >
                {isAutoEnriching ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>Auto-enrich with AI</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Context, pain points, or notes..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="p-4 bg-slate-50 -mx-5 -mb-5 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save & Qualify Lead</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
