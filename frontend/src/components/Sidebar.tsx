import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Activity,
  ClipboardList,
  Layers,
  Settings,
  Database,
  Radio,
  FileCode2,
} from 'lucide-react';

export type NavTab = 'Dashboard' | 'Machines' | 'Predictions' | 'Maintenance' | 'Patterns' | 'Architecture';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isBackendConnected: boolean;
  onOpenBackendModal: () => void;
  totalMachines: number;
  criticalCount: number;
  maintenanceCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isBackendConnected,
  onOpenBackendModal,
  totalMachines,
  criticalCount,
  maintenanceCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'Dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'Machines' as NavTab,
      label: 'Machines & Telemetry',
      icon: Cpu,
      badge: totalMachines > 0 ? String(totalMachines) : null,
      badgeColor: 'bg-slate-800 text-slate-300',
    },
    {
      id: 'Predictions' as NavTab,
      label: 'Condition Diagnostics',
      icon: Activity,
      badge: criticalCount > 0 ? `${criticalCount} alert` : null,
      badgeColor: 'bg-rose-950 text-rose-400 border border-rose-800',
    },
    {
      id: 'Maintenance' as NavTab,
      label: 'Maintenance Orders',
      icon: ClipboardList,
      badge: maintenanceCount > 0 ? String(maintenanceCount) : null,
      badgeColor: 'bg-amber-950 text-amber-400 border border-amber-800',
    },
    {
      id: 'Patterns' as NavTab,
      label: 'OOAD Design Patterns',
      icon: FileCode2,
      badge: '3 Patterns',
      badgeColor: 'bg-purple-950 text-purple-300 border border-purple-800',
    },
    {
      id: 'Architecture' as NavTab,
      label: 'Tech Stack & API',
      icon: Layers,
      badge: 'Spring',
      badgeColor: 'bg-blue-950 text-blue-300 border border-blue-800',
    },
  ];

  const handleSelect = (tab: NavTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a0e1a] border-r border-[#1a2333] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-5 border-b border-[#1a2333] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold shadow-lg shadow-blue-500/10">
              <Radio className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-100 tracking-tight text-base">PredictiveCare</span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                Spring Boot + MySQL
              </p>
            </div>
          </div>
        </div>

        {/* Section title */}
        <div className="px-5 pt-4 pb-1">
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
            Operations Console
          </span>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-300 hover:bg-[#121929] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System & Architecture Info Footer */}
        <div className="p-3 border-t border-[#1a2333] space-y-2">
          {/* Spring Boot / Storage status indicator */}
          <button
            onClick={onOpenBackendModal}
            className="w-full text-left p-2.5 rounded-lg bg-[#0e1424] hover:bg-[#131c33] border border-[#1e293b] transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isBackendConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'
                  }`}
                />
                <span className="text-[11px] font-semibold text-slate-300">
                  {isBackendConnected ? 'Spring Boot Online' : 'Backend Disconnected'}
                </span>
              </div>
              <Settings className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
            </div>

            <p className="text-[10px] text-slate-400 truncate">
              {isBackendConnected ? 'http://localhost:8080/api' : 'Click to inspect / ping'}
            </p>
          </button>

          {/* Database & Architecture Indicator */}
          <div className="px-2 py-1 text-[10px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-slate-500" />
              <span>MySQL 8.0</span>
            </span>
            <span className="font-mono text-slate-400">Java 21</span>
          </div>
        </div>
      </aside>
    </>
  );
};
