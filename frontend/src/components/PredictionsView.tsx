import React from 'react';
import {
  Machine,
  SensorReading,
  calculateHealthScore,
  getHealthStatus,
} from '../types';
import {
  Activity,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Thermometer,
  Vibrate,
  ArrowRight,
  Wrench,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface PredictionsViewProps {
  machines: Machine[];
  latestHealthByMachine: Record<number, number | null>;
  latestReadingsByMachine: Record<number, SensorReading | null>;
  onSelectMachine: (id: number) => void;
  onCreateMaintenanceForMachine: (machineId: number, title: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => void;
  onNavigateTab: (tab: 'Machines' | 'Maintenance') => void;
}

export const PredictionsView: React.FC<PredictionsViewProps> = ({
  machines,
  latestHealthByMachine,
  latestReadingsByMachine,
  onSelectMachine,
  onCreateMaintenanceForMachine,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Disclaimer & Technical Scope */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              Condition Risk Diagnostics
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-factor heuristic condition score calculated from real sensor telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-[#090d16] px-3 py-1.5 rounded-lg border border-[#1e293b]">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>Rule-based heuristic condition monitoring (Not an unvalidated ML model)</span>
        </div>
      </div>

      {/* Threshold Reference Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-emerald-900/30 rounded-xl p-4">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Low Risk (Healthy)</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">&ge; 70.0 pts</div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Optimal thermal dissipation and minimal mechanical vibration. Standard maintenance intervals apply.
          </p>
        </div>

        <div className="bg-[#111827] border border-amber-900/30 rounded-xl p-4">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Moderate Risk (Warning)</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">40.0 – 69.9 pts</div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Elevated temperature or vibration detected. Recommend visual inspection and lubrication check.
          </p>
        </div>

        <div className="bg-[#111827] border border-rose-900/30 rounded-xl p-4">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">High Risk (Critical)</span>
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">&lt; 40.0 pts</div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            High probability of component degradation or impending seizure. Immediate service priority required.
          </p>
        </div>
      </div>

      {/* Machine-by-Machine Risk Breakdown */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e293b]">
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Equipment Condition & Health Component Breakdown
            </h3>
            <p className="text-[11px] text-slate-400">
              Evaluated against Spring Boot formula: <code className="text-blue-400 font-mono">(TempScore + VibScore) / 2</code>
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">{machines.length} Equipment</span>
        </div>

        {machines.length === 0 ? (
          <div className="p-8 text-center text-slate-500 border border-dashed border-[#1e293b] rounded-lg">
            <p className="text-xs">No machines registered in database.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {machines.map((machine) => {
              const score = latestHealthByMachine[machine.id];
              const reading = latestReadingsByMachine[machine.id];
              const status = getHealthStatus(score, machine.status);

              // Component calculations:
              const temp = reading ? reading.temperature : 0;
              const vib = reading ? reading.vibration : 0;
              const tempScore = reading ? Math.max(0, 100 - temp) : null;
              const vibScore = reading ? Math.max(0, 100 - vib * 10) : null;

              const isHighRisk = score !== null && score !== undefined && score < 40;
              const isWarning = score !== null && score !== undefined && score >= 40 && score < 70;

              return (
                <div
                  key={machine.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isHighRisk
                      ? 'bg-rose-950/10 border-rose-900/50'
                      : isWarning
                      ? 'bg-amber-950/10 border-amber-900/50'
                      : 'bg-[#0f172a] border-[#1e293b]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-100 text-sm">{machine.machineName}</h4>
                        <span className="font-mono text-xs text-blue-400">[{machine.machineCode}]</span>
                        <span className="text-xs text-slate-500">• {machine.location || 'Bay Unassigned'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Type: {machine.machineType || 'Machinery'} | Installed: {machine.installationDate || 'N/A'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-slate-400 block">Health Score</span>
                        <span className="font-mono font-bold text-lg text-slate-100">
                          {score !== null && score !== undefined ? `${score} pts` : 'No reading'}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-bold ${
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
                  </div>

                  {/* Telemetry Component Bars */}
                  {reading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-3 bg-[#090d16] p-3 rounded-lg border border-[#1a2333]">
                      {/* Temperature component */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                            Temperature Score: <strong className="text-slate-200">{tempScore}/100</strong>
                          </span>
                          <span className="font-mono text-orange-300 font-bold">{temp}°C</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#151d30] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              temp >= 70 ? 'bg-rose-500' : temp >= 50 ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, tempScore ?? 0))}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Formula: max(0, 100 - {temp}) = {tempScore}
                        </span>
                      </div>

                      {/* Vibration component */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Vibrate className="w-3.5 h-3.5 text-cyan-400" />
                            Vibration Score: <strong className="text-slate-200">{vibScore}/100</strong>
                          </span>
                          <span className="font-mono text-cyan-300 font-bold">{vib} mm/s</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#151d30] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              vib >= 5.0 ? 'bg-rose-500' : vib >= 3.0 ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, vibScore ?? 0))}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Formula: max(0, 100 - ({vib} * 10)) = {vibScore}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 my-2 bg-[#090d16] rounded border border-[#1a2333] text-xs text-slate-500 flex items-center justify-between">
                      <span>No sensor readings recorded yet. Awaiting condition telemetry.</span>
                      <button
                        onClick={() => {
                          onSelectMachine(machine.id);
                          onNavigateTab('Machines');
                        }}
                        className="text-blue-400 hover:text-blue-300 font-medium"
                      >
                        Enter Sensor Reading &rarr;
                      </button>
                    </div>
                  )}

                  {/* Diagnostic Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#1a2333] text-xs">
                    <div className="text-[11px] text-slate-400">
                      {isHighRisk && (
                        <span className="text-rose-400 font-semibold flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> High failure risk. Expedited maintenance recommended.
                        </span>
                      )}
                      {isWarning && (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Wear indicators detected. Schedule inspection.
                        </span>
                      )}
                      {!isHighRisk && !isWarning && (
                        <span className="text-slate-400">Operating condition stable under rule thresholds.</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onSelectMachine(machine.id);
                          onNavigateTab('Machines');
                        }}
                        className="px-2.5 py-1 rounded bg-[#1a2333] hover:bg-[#222f45] text-slate-300 text-xs font-medium"
                      >
                        Telemetry View
                      </button>
                      <button
                        onClick={() => {
                          onCreateMaintenanceForMachine(
                            machine.id,
                            `Condition Service: ${machine.machineName}`,
                            isHighRisk ? 'CRITICAL' : isWarning ? 'HIGH' : 'MEDIUM'
                          );
                          onNavigateTab('Maintenance');
                        }}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Request Maintenance</span>
                      </button>
                    </div>
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
