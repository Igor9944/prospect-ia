import React from 'react';
import { 
  Sparkles, 
  Users, 
  Kanban, 
  BarChart3, 
  Plus, 
  Download, 
  Search,
  Zap
} from 'lucide-react';
import { BackendStatus } from './BackendStatus';

interface NavbarProps {
  currentView: 'list' | 'kanban' | 'analytics';
  onViewChange: (view: 'list' | 'kanban' | 'analytics') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewModal: () => void;
  onExportCSV: () => void;
  totalCount: number;
  hotCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  onOpenNewModal,
  onExportCSV,
  totalCount,
  hotCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Prospect IA</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Zap className="w-3 h-3 mr-1 text-indigo-500 fill-indigo-400" />
                  AI Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Automated Lead Qualification & Cold Outreach Engine</p>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-sm font-medium">
            <button
              id="nav-list-btn"
              onClick={() => onViewChange('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentView === 'list'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Prospects ({totalCount})</span>
            </button>

            <button
              id="nav-kanban-btn"
              onClick={() => onViewChange('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentView === 'kanban'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Pipeline</span>
            </button>

            <button
              id="nav-analytics-btn"
              onClick={() => onViewChange('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentView === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Insights</span>
            </button>
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-2.5">
            <BackendStatus />
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="navbar-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search name, company, role..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              id="export-csv-btn"
              onClick={onExportCSV}
              title="Export Prospects to CSV"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              id="add-prospect-btn"
              onClick={onOpenNewModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-xs shadow-indigo-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lead</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
