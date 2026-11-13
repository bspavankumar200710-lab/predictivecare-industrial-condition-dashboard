import React from 'react';
import { Machine, SensorReading, Maintenance, getHealthStatus } from '../types';
import { HealthSpectrum } from './HealthSpectrum';
import { TrendChart } from './TrendChart';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ClipboardList,
  Activity,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Flame,
  Vibrate,
} from 'lucide-react';

interface DashboardViewProps {
  machines: Machine[];
  latestHealthByMachine: Record<number, number | null>;
  latestReadingsByMachine: Record<number, SensorReading | null>;
  maintenanceRequests: Maintenance[];
  selectedMachineId: number | null;
  onSelectMachine: (id: number) => void;
  onNavigateTab: (tab: 'Machines' | 'Predictions' | 'Maintenance') => void;
  machineReadings: SensorReading[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  machines,
  latestHealthByMachine,
  latestReadingsByMachine,
  maintenanceRequests,
  selectedMachineId,
  onSelectMachine,
  onNavigateTab,
  machineReadings,
}) => {
  // Dynamically calculate actual counts:
  const totalMachines = machines.length;

  const healthyCount = machines.filter((m) => {
    const score = latestHealthByMachine[m.id];
    if (score === null || score === undefined) {
      return m.status === 'Healthy';
    }
    return score >= 70;
  }).length;

  const warningCount = machines.filter((m) => {
    const score = latestHealthByMachine[m.id];
    if (score === null || score === undefined) {
      return m.status === 'Warning';
    }
    return score >= 40 && score < 70;
  }).length;

  const criticalCount = machines.filter((m) => {
    const score = latestHealthByMachine[m.id];
    if (score === null || score === undefined) {
      return m.status === 'Critical';
    }
    return score < 40;
  }).length;

  const activeMaintenanceCount = maintenanceRequests.filter(
    (m) => m.status === 'REQUESTED' || m.status === 'IN_PROGRESS'
  ).length;

  // Real alerts triggered strictly by actual database readings & condition scores
  const activeAlerts: Array<{
    id: string;
    machineName: string;
    machineCode: string;
    type: 'critical' | 'warning';
    title: string;
    description: string;
    metric: string;
  }> = [];

  machines.forEach((m) => {
    const score = latestHealthByMachine[m.id];
    const reading = latestReadingsByMachine[m.id];

    if (score !== null && score !== undefined) {
      if (score < 40) {
        activeAlerts.push({
          id: `${m.id}-health-critical`,
          machineName: m.machineName,
          machineCode: m.machineCode,
          type: 'critical',
          title: 'Critical Health Score',
          description: `Health score calculated at ${score}/100. Immediate maintenance inspection required.`,
          metric: `${score} pts`,
        });
      } else if (score < 70) {
        activeAlerts.push({
          id: `${m.id}-health-warning`,
          machineName: m.machineName,
          machineCode: m.machineCode,
          type: 'warning',
          title: 'Degraded Condition Warning',
          description: `Health score calculated at ${score}/100. Elevated operational wear detected.`,
          metric: `${score} pts`,
        });
      }
    }

    if (reading) {
      if (reading.temperature >= 70) {
        activeAlerts.push({
          id: `${m.id}-temp-alert`,
          machineName: m.machineName,
          machineCode: m.machineCode,
          type: 'warning',
          title: 'High Thermal Reading',
          description: `Sensor recorded temperature of ${reading.temperature}°C, exceeding the 70°C alert threshold.`,
          metric: `${reading.temperature}°C`,
        });
      }

      if (reading.vibration >= 5.0) {
        activeAlerts.push({
          id: `${m.id}-vib-alert`,
          machineName: m.machineName,
          machineCode: m.machineCode,
          type: 'critical',
          title: 'High Vibration Level',
          description: `Sensor recorded vibration velocity of ${reading.vibration} mm/s, exceeding the 5.0 mm/s alert threshold.`,
          metric: `${reading.vibration} mm/s`,
        });
      }
    }
  });

  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || machines[0] || null;

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards with real dynamic calculations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Machines */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-semibold tracking-wider">Total Equipment</span>
            <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
              {totalMachines}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Registered in MySQL database
            </p>
          </div>
        </div>

        {/* Healthy Machines */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-semibold tracking-wider">Healthy Status</span>
            <div className="p-2 rounded-lg bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
              {healthyCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Health score &ge; 70.0 / 100
            </p>
          </div>
        </div>

        {/* Warning Equipment */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-semibold tracking-wider">Warning Status</span>
            <div className="p-2 rounded-lg bg-amber-600/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
              {warningCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Health score 40.0 – 69.9
            </p>
          </div>
        </div>

        {/* Critical / Predicted Failures */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-semibold tracking-wider">Critical Condition</span>
            <div className="p-2 rounded-lg bg-rose-600/10 text-rose-400 border border-rose-500/20">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-rose-400 font-mono tracking-tight">
              {criticalCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Health score &lt; 40.0 (High risk)
            </p>
          </div>
        </div>
      </div>

      {/* Equipment Health Spectrum & Formula Card */}
      <HealthSpectrum />

      {/* Grid: Live Alerts & Telemetry Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Alerts Feed (1 Col) */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e293b]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Condition Alerts
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e293b] text-slate-300">
              {activeAlerts.length} Active
            </span>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
            {activeAlerts.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-slate-500 border border-dashed border-[#1e293b] rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mb-2" />
                <p className="text-xs font-semibold text-slate-400">No active threshold alerts</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Readings are currently within normal ranges (Temp &lt; 70°C, Vib &lt; 5.0 mm/s, Score &ge; 70).
                </p>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border text-xs flex flex-col gap-1.5 ${
                    alert.type === 'critical'
                      ? 'bg-rose-950/20 border-rose-900/50 text-rose-300'
                      : 'bg-amber-950/20 border-amber-900/50 text-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      {alert.type === 'critical' ? (
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                      {alert.title}
                    </span>
                    <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-black/30">
                      {alert.metric}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="text-slate-200 font-semibold">{alert.machineName}</span>
                    <span className="font-mono text-slate-500">[{alert.machineCode}]</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {alert.description}
                  </p>
                </div>
              ))
            )}
          </div>

          <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-[#1e293b]">
            Rule-based condition thresholds (Temp &ge; 70°C, Vib &ge; 5.0 mm/s). No simulated alarm devices.
          </p>
        </div>

        {/* Right Column: Telemetry Charts (2 Cols) */}
        <div className="lg:col-span-2 bg-[#111827] border border-[#1e293b] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#1e293b]">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Telemetry Trend Curves
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Historical sensor readings for machine:{' '}
                <span className="text-slate-200 font-semibold">
                  {selectedMachine ? selectedMachine.machineName : 'None selected'}
                </span>
              </p>
            </div>

            {/* Machine selector dropdown */}
            {machines.length > 0 && (
              <select
                value={selectedMachineId ?? ''}
                onChange={(e) => onSelectMachine(Number(e.target.value))}
                className="bg-[#0b0f19] border border-[#1e293b] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-mono focus:border-blue-500 outline-none"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.machineCode} - {m.machineName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Two trend charts side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TrendChart
              readings={machineReadings}
              field="temperature"
              label="Temperature"
              unit="°C"
              color="#f97316"
            />
            <TrendChart
              readings={machineReadings}
              field="vibration"
              label="Vibration"
              unit=" mm/s"
              color="#38bdf8"
            />
          </div>

          <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between text-xs text-slate-400">
            <span className="text-[11px] text-slate-500">
              Readings saved to MySQL <code className="text-slate-400">sensor_readings</code> table
            </span>
            <button
              onClick={() => onNavigateTab('Machines')}
              className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 text-xs"
            >
              <span>Add / Manage Sensor Readings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Registered Equipment Overview Grid */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e293b]">
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Registered Equipment Quick View
            </h3>
            <p className="text-[11px] text-slate-400">
              Fetched from <code className="text-blue-400 font-mono">/api/machines</code>
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('Machines')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {machines.length === 0 ? (
          <div className="p-8 text-center text-slate-500 border border-dashed border-[#1e293b] rounded-lg">
            <p className="text-sm">No machines registered in the database yet.</p>
            <button
              onClick={() => onNavigateTab('Machines')}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
            >
              Register First Machine
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {machines.map((machine) => {
              const score = latestHealthByMachine[machine.id];
              const status = getHealthStatus(score, machine.status);
              const reading = latestReadingsByMachine[machine.id];

              return (
                <div
                  key={machine.id}
                  onClick={() => onSelectMachine(machine.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedMachineId === machine.id
                      ? 'bg-[#152038] border-blue-500/60 shadow-lg shadow-blue-900/10'
                      : 'bg-[#0f172a] border-[#1e293b] hover:border-slate-700 hover:bg-[#131d33]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{machine.machineName}</h4>
                      <span className="font-mono text-xs text-slate-400">{machine.machineCode}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        status === 'Healthy'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                          : status === 'Warning'
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-800'
                          : status === 'Critical'
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-3 text-[11px] bg-[#0b0f19] p-2.5 rounded border border-[#1a2333]">
                    <div>
                      <span className="text-slate-500 block">Health Score</span>
                      <span className="font-mono font-bold text-slate-200 text-sm">
                        {score !== null && score !== undefined ? `${score} pts` : 'No readings'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Location</span>
                      <span className="text-slate-300 truncate block">
                        {machine.location || 'Unassigned'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Temperature</span>
                      <span className="font-mono text-slate-300">
                        {reading ? `${reading.temperature}°C` : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Vibration</span>
                      <span className="font-mono text-slate-300">
                        {reading ? `${reading.vibration} mm/s` : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>{machine.machineType || 'General Equipment'}</span>
                    <span className="text-blue-400 text-xs font-medium">Select &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
