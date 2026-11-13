import React from 'react';
import { Menu, RefreshCw, Download, Database, Server, CheckCircle2, AlertOctagon } from 'lucide-react';
import { NavTab } from './Sidebar';

interface TopbarProps {
  activeTab: NavTab;
  onOpenMobileNav: () => void;
  isBackendConnected: boolean;
  onOpenBackendModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  onOpenMobileNav,
  isBackendConnected,
  onOpenBackendModal,
  onRefresh,
  isLoading,
}) => {
  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    Dashboard: {
      title: 'Equipment Health Dashboard',
      subtitle: 'Dynamic condition assessment based on Spring Boot health-score formula.',
    },
    Machines: {
      title: 'Machines & Telemetry Data',
      subtitle: 'Database records, equipment registration, and manual sensor reading entry.',
    },
    Predictions: {
      title: 'Condition Diagnostics',
      subtitle: 'Heuristic health scoring with component-level temperature & vibration breakdown.',
    },
    Maintenance: {
      title: 'Maintenance Order Management',
      subtitle: 'Spring Boot JPA persistence for equipment service requests and work orders.',
    },
    Patterns: {
      title: 'OOAD Design Patterns Verification',
      subtitle: 'Factory Method, Adapter, and Strategy design patterns implemented in Java 21.',
    },
    Architecture: {
      title: 'System Architecture & REST API',
      subtitle: 'Technical specifications, database schema, and Spring Boot controller contracts.',
    },
  };

  const current = titles[activeTab];

  return (
    <header className="sticky top-0 z-30 bg-[#0a0e1a]/95 backdrop-blur border-b border-[#1a2333] px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-lg bg-[#111827] text-slate-400 hover:text-white border border-[#1e293b]"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
              PredictiveCare
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] text-slate-400 font-mono">
              Spring Boot + MySQL
            </span>
          </div>
          <h1 className="text-lg lg:text-xl font-bold text-slate-100 tracking-tight">
            {current.title}
          </h1>
          <p className="hidden md:block text-xs text-slate-400 mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        {/* Download Project ZIP button */}
        <a
          href="/machines-diagnosis-project.zip"
          download="machines-diagnosis-project.zip"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/50 text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
          title="Download complete VS Code project ZIP (Frontend + Backend + MySQL Schema)"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Download Project ZIP</span>
          <span className="sm:hidden font-mono text-[11px]">ZIP</span>
        </a>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh database records"
          className="p-2 rounded-lg bg-[#111827] hover:bg-[#1a243b] text-slate-400 hover:text-slate-200 border border-[#1e293b] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
        </button>

        {/* Backend status indicator */}
        <button
          onClick={onOpenBackendModal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            isBackendConnected
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/50'
              : 'bg-rose-950/30 border-rose-800/60 text-rose-300 hover:bg-rose-900/40'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className="hidden sm:inline">
            {isBackendConnected ? 'Spring Boot Online' : 'Backend Disconnected'}
          </span>
          <span className="sm:hidden font-mono text-[11px]">
            {isBackendConnected ? 'API OK' : 'Offline'}
          </span>
        </button>
      </div>
    </header>
  );
};
