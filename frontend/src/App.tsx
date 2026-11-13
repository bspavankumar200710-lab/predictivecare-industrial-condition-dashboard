import React, { useState, useEffect, useCallback } from 'react';
import {
  Machine,
  SensorReading,
  Maintenance,
  MaintenancePriority,
  MaintenanceStatus,
} from './types';
import { api } from './services/api';
import { Sidebar, NavTab } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardView } from './components/DashboardView';
import { MachinesView } from './components/MachinesView';
import { PredictionsView } from './components/PredictionsView';
import { MaintenanceView } from './components/MaintenanceView';
import { DesignPatternsView } from './components/DesignPatternsView';
import { ArchitectureView } from './components/ArchitectureView';
import { BackendModal } from './components/BackendModal';
import { AlertOctagon, RefreshCw, Terminal, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('Dashboard');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null);
  const [machineReadings, setMachineReadings] = useState<SensorReading[]>([]);
  const [latestHealthByMachine, setLatestHealthByMachine] = useState<Record<number, number | null>>({});
  const [latestReadingsByMachine, setLatestReadingsByMachine] = useState<Record<number, SensorReading | null>>({});
  const [maintenanceOrders, setMaintenanceOrders] = useState<Maintenance[]>([]);

  // Connectivity & App state
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showBackendModal, setShowBackendModal] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [connectionErrorNotice, setConnectionErrorNotice] = useState<string | null>(null);

  // Pre-fill maintenance state from Diagnostics view
  const [maintenancePreFill, setMaintenancePreFill] = useState<{
    machineId: number;
    title: string;
    priority: MaintenancePriority;
  } | null>(null);

  // Primary data loader
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setConnectionErrorNotice(null);

    // 1. Check live Spring Boot backend connectivity
    const pingRes = await api.pingBackend();
    setIsBackendConnected(pingRes.connected);

    if (!pingRes.connected) {
      setConnectionErrorNotice(
        `Spring Boot backend is not responding at ${api.getBackendUrl()}. Start backend with 'mvn spring-boot:run' and MySQL.`
      );
    }

    try {
      // 2. Fetch machines
      const machineList = await api.getMachines();
      setMachines(machineList);

      let currentSelectedId = selectedMachineId;
      if (!currentSelectedId && machineList.length > 0) {
        currentSelectedId = machineList[0].id;
        setSelectedMachineId(currentSelectedId);
      } else if (currentSelectedId && !machineList.some((m) => m.id === currentSelectedId)) {
        currentSelectedId = machineList.length > 0 ? machineList[0].id : null;
        setSelectedMachineId(currentSelectedId);
      }

      // 3. Fetch latest reading & health score for each machine
      const healthMap: Record<number, number | null> = {};
      const readingMap: Record<number, SensorReading | null> = {};

      await Promise.all(
        machineList.map(async (m) => {
          const readings = await api.getReadings(m.id);
          if (readings.length > 0) {
            const latest = readings[0];
            healthMap[m.id] = latest.healthScore;
            readingMap[m.id] = latest;
          } else {
            healthMap[m.id] = null;
            readingMap[m.id] = null;
          }
        })
      );

      setLatestHealthByMachine(healthMap);
      setLatestReadingsByMachine(readingMap);

      // 4. Load readings for the actively selected machine
      if (currentSelectedId) {
        const activeReadings = await api.getReadings(currentSelectedId);
        setMachineReadings(activeReadings);
      } else {
        setMachineReadings([]);
      }

      // 5. Fetch maintenance requests
      const maintenanceList = await api.getMaintenance();
      setMaintenanceOrders(maintenanceList);
    } catch (err: any) {
      console.warn('Backend query notice:', err.message);
      // If disconnected and demo mode not enabled, keep lists empty and display honest notice
      if (!api.isDemoModeEnabled()) {
        setMachines([]);
        setMachineReadings([]);
        setMaintenanceOrders([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedMachineId]);

  // Initial load: Primary data source is Spring Boot REST API
  useEffect(() => {
    loadData();
  }, []);

  const handleSelectMachine = async (id: number) => {
    setSelectedMachineId(id);
    const readings = await api.getReadings(id);
    setMachineReadings(readings);
  };

  const handleAddMachine = async (machineData: Omit<Machine, 'id'>) => {
    const created = await api.addMachine(machineData);
    await loadData();
    setSelectedMachineId(created.id);
  };

  const handleUpdateMachine = async (id: number, machineData: Partial<Machine>) => {
    await api.updateMachine(id, machineData);
    await loadData();
  };

  const handleDeleteMachine = async (id: number) => {
    await api.deleteMachine(id);
    await loadData();
  };

  const handleAddReading = async (
    machineId: number,
    data: { temperature: number; vibration: number; operatingHours: number }
  ) => {
    const newReading = await api.addReading(machineId, data);
    const updatedReadings = await api.getReadings(machineId);
    setMachineReadings(updatedReadings);

    setLatestHealthByMachine((prev) => ({
      ...prev,
      [machineId]: newReading.healthScore,
    }));
    setLatestReadingsByMachine((prev) => ({
      ...prev,
      [machineId]: newReading,
    }));

    setMachines((prev) =>
      prev.map((m) =>
        m.id === machineId
          ? {
              ...m,
              status:
                newReading.healthScore >= 70
                  ? 'Healthy'
                  : newReading.healthScore >= 40
                  ? 'Warning'
                  : 'Critical',
            }
          : m
      )
    );
  };

  const handleCreateMaintenance = async (
    machineId: number,
    data: {
      title: string;
      description: string;
      priority: MaintenancePriority;
      scheduledDate?: string | null;
      notes?: string | null;
    }
  ) => {
    await api.createMaintenance(machineId, data);
    const list = await api.getMaintenance();
    setMaintenanceOrders(list);
    setMaintenancePreFill(null);
  };

  const handleUpdateMaintenanceStatus = async (
    id: number,
    status: MaintenanceStatus,
    notes?: string
  ) => {
    await api.updateMaintenanceStatus(id, status, notes);
    const list = await api.getMaintenance();
    setMaintenanceOrders(list);
  };

  const handleDeleteMaintenance = async (id: number) => {
    await api.deleteMaintenance(id);
    const list = await api.getMaintenance();
    setMaintenanceOrders(list);
  };

  const handleResetData = async () => {
    api.seedDemoDataIfRequested();
    setShowBackendModal(false);
    await loadData();
  };

  const handleEnableDemoMode = () => {
    api.seedDemoDataIfRequested();
    loadData();
  };

  // Derived counts for sidebar badges
  const criticalCount = machines.filter((m) => {
    const score = latestHealthByMachine[m.id];
    return score !== null && score !== undefined ? score < 40 : m.status === 'Critical';
  }).length;

  const activeMaintenanceCount = maintenanceOrders.filter(
    (m) => m.status === 'PENDING' || m.status === 'REQUESTED' || m.status === 'IN_PROGRESS'
  ).length;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col lg:flex-row industrial-grid-bg">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendConnected={isBackendConnected}
        onOpenBackendModal={() => setShowBackendModal(true)}
        totalMachines={machines.length}
        criticalCount={criticalCount}
        maintenanceCount={activeMaintenanceCount}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar
          activeTab={activeTab}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          isBackendConnected={isBackendConnected}
          onOpenBackendModal={() => setShowBackendModal(true)}
          onRefresh={loadData}
          isLoading={isLoading}
        />

        {/* Backend Disconnected Notice Banner */}
        {!isBackendConnected && (
          <div className="bg-[#140b12] border-b border-rose-900/60 px-4 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start sm:items-center gap-2.5 text-rose-300">
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Backend Disconnected:</strong> Spring Boot API at <code className="text-rose-200 font-mono">http://localhost:8080</code> is not currently responding.
                MySQL persistence is paused.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={loadData}
                disabled={isLoading}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1e131b] hover:bg-[#2e1c29] text-rose-300 border border-rose-800 text-[11px] font-semibold"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Retry Connection</span>
              </button>

              {!api.isDemoModeEnabled() ? (
                <button
                  onClick={handleEnableDemoMode}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold"
                >
                  Enable Preview Demo
                </button>
              ) : (
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/60">
                  Preview Demo Active
                </span>
              )}
            </div>
          </div>
        )}

        {/* View Switcher Container */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'Dashboard' && (
            <DashboardView
              machines={machines}
              latestHealthByMachine={latestHealthByMachine}
              latestReadingsByMachine={latestReadingsByMachine}
              maintenanceRequests={maintenanceOrders}
              selectedMachineId={selectedMachineId}
              onSelectMachine={handleSelectMachine}
              onNavigateTab={(tab) => {
                if (tab === 'Machines') setActiveTab('Machines');
                else if (tab === 'Predictions') setActiveTab('Predictions');
                else if (tab === 'Maintenance') setActiveTab('Maintenance');
              }}
              machineReadings={machineReadings}
            />
          )}

          {activeTab === 'Machines' && (
            <MachinesView
              machines={machines}
              selectedMachineId={selectedMachineId}
              onSelectMachine={handleSelectMachine}
              machineReadings={machineReadings}
              latestHealthByMachine={latestHealthByMachine}
              onAddMachine={handleAddMachine}
              onUpdateMachine={handleUpdateMachine}
              onDeleteMachine={handleDeleteMachine}
              onAddReading={handleAddReading}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'Predictions' && (
            <PredictionsView
              machines={machines}
              latestHealthByMachine={latestHealthByMachine}
              latestReadingsByMachine={latestReadingsByMachine}
              onSelectMachine={handleSelectMachine}
              onCreateMaintenanceForMachine={(machineId, title, priority) => {
                setMaintenancePreFill({ machineId, title, priority });
                setActiveTab('Maintenance');
              }}
              onNavigateTab={(tab) => {
                if (tab === 'Machines') setActiveTab('Machines');
                else if (tab === 'Maintenance') setActiveTab('Maintenance');
              }}
            />
          )}

          {activeTab === 'Maintenance' && (
            <MaintenanceView
              machines={machines}
              maintenanceOrders={maintenanceOrders}
              onCreateMaintenance={handleCreateMaintenance}
              onUpdateStatus={handleUpdateMaintenanceStatus}
              onDeleteOrder={handleDeleteMaintenance}
              initialMachineId={maintenancePreFill?.machineId}
              initialTitle={maintenancePreFill?.title}
              initialPriority={maintenancePreFill?.priority}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'Patterns' && <DesignPatternsView />}

          {activeTab === 'Architecture' && <ArchitectureView />}
        </main>

        {/* Industrial Footer */}
        <footer className="border-t border-[#1a2333] px-6 py-4 text-center text-xs text-slate-500 bg-[#070b14]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400">PredictiveCare</span>
              <span>•</span>
              <span>Condition-Based Industrial Monitoring System</span>
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              Formula: (max(0, 100 - Temp) + max(0, 100 - Vib * 10)) / 2
            </div>
          </div>
        </footer>
      </div>

      {/* Backend & Database Modal */}
      <BackendModal
        isOpen={showBackendModal}
        onClose={() => setShowBackendModal(false)}
        isBackendConnected={isBackendConnected}
        onConnectionChange={(connected) => setIsBackendConnected(connected)}
        onResetData={handleResetData}
      />
    </div>
  );
}
