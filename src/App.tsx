import React, { useState, useEffect } from 'react';
import { Prospect, PipelineStage } from './types';
import { INITIAL_PROSPECTS } from './data/mockProspects';
import { Navbar } from './components/Navbar';
import { AnalyticsStats } from './components/AnalyticsStats';
import { ProspectList } from './components/ProspectList';
import { ProspectDetail } from './components/ProspectDetail';
import { PipelineBoard } from './components/PipelineBoard';
import { OutreachModal } from './components/OutreachModal';
import { NewProspectModal } from './components/NewProspectModal';
import { AnalyticsView } from './components/AnalyticsView';

export const App: React.FC = () => {
  const [prospects, setProspects] = useState<Prospect[]>(() => {
    const saved = localStorage.getItem('prospect_ia_leads');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PROSPECTS;
  });

  const [currentView, setCurrentView] = useState<'list' | 'kanban' | 'analytics'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isOutreachOpen, setIsOutreachOpen] = useState(false);
  const [outreachTargetProspect, setOutreachTargetProspect] = useState<Prospect | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('prospect_ia_leads', JSON.stringify(prospects));
  }, [prospects]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Search filtering
  const filteredProspects = prospects.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.company.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.industry.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    );
  });

  const handleStageChange = (id: string, newStage: PipelineStage) => {
    setProspects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stage: newStage, lastActivity: 'Stage updated' } : p))
    );
    if (selectedProspect && selectedProspect.id === id) {
      setSelectedProspect((prev) => (prev ? { ...prev, stage: newStage } : null));
    }
    showNotification(`Pipeline stage updated to "${newStage}"`);
  };

  const handleEnrichProspect = async (prospect: Prospect) => {
    try {
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: prospect.name,
          company: prospect.company,
          role: prospect.role,
          industry: prospect.industry,
          website: '',
          currentNotes: prospect.notes,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const enriched = json.data;
        const updated: Prospect = {
          ...prospect,
          fitScore: enriched.fitScore || prospect.fitScore,
          intentScore: enriched.intentScore || prospect.intentScore,
          summary: enriched.summary || prospect.summary,
          painPoints: enriched.painPoints || prospect.painPoints,
          estimatedRevenue: enriched.estimatedRevenue || prospect.estimatedRevenue,
          companySize: enriched.companySize || prospect.companySize,
          techStack: enriched.techStack || prospect.techStack,
          buyingTriggers: enriched.buyingTriggers || prospect.buyingTriggers,
          lastActivity: 'AI intelligence refreshed',
        };

        setProspects((prev) => prev.map((p) => (p.id === prospect.id ? updated : p)));
        if (selectedProspect && selectedProspect.id === prospect.id) {
          setSelectedProspect(updated);
        }
        showNotification(`AI Enrichment completed for ${prospect.name}`);
      }
    } catch (err) {
      console.error(err);
      showNotification('Enrichment failed');
    }
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setProspects((prev) => prev.map((p) => (p.id === id ? { ...p, notes } : p)));
    if (selectedProspect && selectedProspect.id === id) {
      setSelectedProspect((prev) => (prev ? { ...prev, notes } : null));
    }
  };

  const handleOpenOutreach = (prospect: Prospect) => {
    setOutreachTargetProspect(prospect);
    setIsOutreachOpen(true);
  };

  const handleLogOutreachSent = (prospectId: string) => {
    setProspects((prev) =>
      prev.map((p) =>
        p.id === prospectId
          ? {
              ...p,
              stage: p.stage === 'discovered' ? 'contacted' : p.stage,
              lastActivity: 'Outreach dispatched',
            }
          : p
      )
    );
    showNotification('Outreach marked as sent! Lead advanced in pipeline.');
  };

  const handleAddProspect = (newLead: Omit<Prospect, 'id'>) => {
    const id = `pr-${Date.now()}`;
    const prospect: Prospect = { ...newLead, id };
    setProspects((prev) => [prospect, ...prev]);
    showNotification(`New prospect "${prospect.name}" qualified & added!`);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Role', 'Company', 'Email', 'Industry', 'Stage', 'FitScore', 'IntentScore', 'Location'];
    const rows = prospects.map((p) => [
      `"${p.name}"`,
      `"${p.role}"`,
      `"${p.company}"`,
      `"${p.email}"`,
      `"${p.industry}"`,
      `"${p.stage}"`,
      p.fitScore,
      p.intentScore,
      `"${p.location}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Prospect-IA-Leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Exported prospects CSV successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {notification}
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onExportCSV={handleExportCSV}
        totalCount={prospects.length}
        hotCount={prospects.filter((p) => p.status === 'hot').length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Metrics Strip */}
        <AnalyticsStats prospects={prospects} />

        {/* View content */}
        {currentView === 'list' && (
          <ProspectList
            prospects={filteredProspects}
            selectedProspect={selectedProspect}
            onSelectProspect={setSelectedProspect}
            onOpenOutreach={handleOpenOutreach}
            onEnrichProspect={handleEnrichProspect}
            onStageChange={handleStageChange}
          />
        )}

        {currentView === 'kanban' && (
          <PipelineBoard
            prospects={filteredProspects}
            onSelectProspect={setSelectedProspect}
            onOpenOutreach={handleOpenOutreach}
            onStageChange={handleStageChange}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsView
            prospects={prospects}
            onSelectProspect={(p) => {
              setSelectedProspect(p);
              setCurrentView('list');
            }}
          />
        )}
      </main>

      {/* Side Drawer for Prospect Detail */}
      <ProspectDetail
        prospect={selectedProspect}
        onClose={() => setSelectedProspect(null)}
        onOpenOutreach={handleOpenOutreach}
        onEnrichProspect={handleEnrichProspect}
        onUpdateNotes={handleUpdateNotes}
        onStageChange={handleStageChange}
      />

      {/* Modal for AI Outreach Generation */}
      <OutreachModal
        isOpen={isOutreachOpen}
        prospect={outreachTargetProspect}
        onClose={() => setIsOutreachOpen(false)}
        onLogOutreachSent={handleLogOutreachSent}
      />

      {/* Modal for Adding New Prospect */}
      <NewProspectModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onAddProspect={handleAddProspect}
      />
    </div>
  );
};

export default App;
