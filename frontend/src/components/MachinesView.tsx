import React, { useState } from 'react';
import {
  Machine,
  SensorReading,
  calculateHealthScore,
  getHealthStatus,
} from '../types';
import { TrendChart } from './TrendChart';
import {
  Plus,
  Cpu,
  Thermometer,
  Activity,
  Clock,
  Trash2,
  Edit2,
  Calendar,
  MapPin,
  Tag,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowUpDown,
  History,
  Check,
  X,
} from 'lucide-react';

interface MachinesViewProps {
  machines: Machine[];
  selectedMachineId: number | null;
  onSelectMachine: (id: number) => void;
  machineReadings: SensorReading[];
  latestHealthByMachine: Record<number, number | null>;
  onAddMachine: (data: Omit<Machine, 'id'>) => Promise<void>;
  onUpdateMachine: (id: number, data: Partial<Machine>) => Promise<void>;
  onDeleteMachine: (id: number) => Promise<void>;
  onAddReading: (
    machineId: number,
    data: { temperature: number; vibration: number; operatingHours: number }
  ) => Promise<void>;
  isLoading: boolean;
}

export const MachinesView: React.FC<MachinesViewProps> = ({
  machines,
  selectedMachineId,
  onSelectMachine,
  machineReadings,
  latestHealthByMachine,
  onAddMachine,
  onUpdateMachine,
  onDeleteMachine,
  onAddReading,
  isLoading,
}) => {
  // Machine registration form state
  const [showAddMachineModal, setShowAddMachineModal] = useState(false);
  const [newMachine, setNewMachine] = useState({
    machineName: '',
    machineCode: '',
    machineType: '',
    location: '',
    status: 'Healthy',
    installationDate: new Date().toISOString().split('T')[0],
  });
  const [machineFormError, setMachineFormError] = useState('');
  const [machineFormSuccess, setMachineFormSuccess] = useState('');
  const [isSubmittingMachine, setIsSubmittingMachine] = useState(false);

  // Machine edit modal state
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [isUpdatingMachine, setIsUpdatingMachine] = useState(false);

  // Sensor reading entry state
  const [readingForm, setReadingForm] = useState({
    temperature: '',
    vibration: '',
    operatingHours: '',
  });
  const [readingError, setReadingError] = useState('');
  const [readingSuccess, setReadingSuccess] = useState('');
  const [isSubmittingReading, setIsSubmittingReading] = useState(false);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Active selected machine object
  const activeMachine = machines.find((m) => m.id === selectedMachineId) || machines[0] || null;

  // Real-time calculation preview for reading form
  const tempVal = parseFloat(readingForm.temperature) || 0;
  const vibVal = parseFloat(readingForm.vibration) || 0;
  const previewCalc = calculateHealthScore(tempVal, vibVal);
  const hasReadingInputs = readingForm.temperature !== '' && readingForm.vibration !== '';

  // Filtered machines
  const filteredMachines = machines.filter((m) => {
    const matchesSearch =
      m.machineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.machineCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.location && m.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const score = latestHealthByMachine[m.id];
    const computedStatus = getHealthStatus(score, m.status);

    const matchesStatus =
      statusFilter === 'ALL' ||
      computedStatus.toUpperCase() === statusFilter.toUpperCase() ||
      (m.status && m.status.toUpperCase() === statusFilter.toUpperCase());

    return matchesSearch && matchesStatus;
  });

  // Handle machine registration
  const handleRegisterMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    setMachineFormError('');
    setMachineFormSuccess('');
    setIsSubmittingMachine(true);

    try {
      if (!newMachine.machineName.trim() || !newMachine.machineCode.trim()) {
        throw new Error('Machine name and code are required');
      }
      await onAddMachine(newMachine);
      setMachineFormSuccess(`Machine '${newMachine.machineName}' registered successfully in MySQL database.`);
      setNewMachine({
        machineName: '',
        machineCode: '',
        machineType: '',
        location: '',
        status: 'Healthy',
        installationDate: new Date().toISOString().split('T')[0],
      });
      setTimeout(() => setShowAddMachineModal(false), 1200);
    } catch (err: any) {
      setMachineFormError(err.message || 'Failed to add machine');
    } finally {
      setIsSubmittingMachine(false);
    }
  };

  // Handle machine update
  const handleSaveEditMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMachine) return;
    setIsUpdatingMachine(true);
    try {
      await onUpdateMachine(editingMachine.id, editingMachine);
      setEditingMachine(null);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsUpdatingMachine(false);
    }
  };

  // Handle machine delete
  const handleDelete = async (machine: Machine) => {
    if (confirm(`Are you sure you want to delete ${machine.machineName} (${machine.machineCode})? This will also remove its sensor readings.`)) {
      try {
        await onDeleteMachine(machine.id);
      } catch (err: any) {
        alert(`Deletion failed: ${err.message}`);
      }
    }
  };

  // Handle sensor reading submission
  const handleSubmitReading = async (e: React.FormEvent) => {
    e.preventDefault();
    setReadingError('');
    setReadingSuccess('');

    if (!activeMachine) {
      setReadingError('Please select a machine first.');
      return;
    }

    if (!readingForm.temperature || !readingForm.vibration || !readingForm.operatingHours) {
      setReadingError('All 3 sensor fields (Temperature, Vibration, Operating Hours) are required.');
      return;
    }

    setIsSubmittingReading(true);
    try {
      await onAddReading(activeMachine.id, {
        temperature: parseFloat(readingForm.temperature),
        vibration: parseFloat(readingForm.vibration),
        operatingHours: parseFloat(readingForm.operatingHours),
      });

      setReadingSuccess(
        `Reading recorded! Score: ${previewCalc.healthScore} (${previewCalc.category}) via verified formula.`
      );
      setReadingForm({ temperature: '', vibration: '', operatingHours: '' });
    } catch (err: any) {
      setReadingError(err.message || 'Failed to submit sensor reading');
    } finally {
      setIsSubmittingReading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar: Search, Filter, Register button */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by machine name, code, or bay..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 outline-none"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 bg-[#090d16] border border-[#1e293b] rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-slate-300 text-xs focus:ring-0 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="HEALTHY">Healthy (&ge;70)</option>
              <option value="WARNING">Warning (40-69)</option>
              <option value="CRITICAL">Critical (&lt;40)</option>
            </select>
          </div>
        </div>

        {/* Register Machine Button */}
        <button
          onClick={() => {
            setShowAddMachineModal(true);
            setMachineFormError('');
            setMachineFormSuccess('');
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register Machine</span>
        </button>
      </div>

      {/* Main Grid: Machine Listing on Left, Reading Entry & History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Machine List Table (5 cols on large screens) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Database Records ({filteredMachines.length})
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                table: <code className="text-slate-300">machines</code>
              </span>
            </div>

            {filteredMachines.length === 0 ? (
              <div className="p-6 text-center text-slate-500 border border-dashed border-[#1e293b] rounded-lg">
                <p className="text-xs">No machines match search criteria.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                {filteredMachines.map((m) => {
                  const score = latestHealthByMachine[m.id];
                  const status = getHealthStatus(score, m.status);
                  const isSelected = activeMachine?.id === m.id;

                  return (
                    <div
                      key={m.id}
                      onClick={() => onSelectMachine(m.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#152038] border-blue-500/80 shadow-md shadow-blue-900/20'
                          : 'bg-[#0e1424] border-[#1e293b] hover:border-slate-700 hover:bg-[#121a2e]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <div>
                          <h4 className="font-bold text-slate-100 text-sm">{m.machineName}</h4>
                          <span className="font-mono text-xs text-blue-400">{m.machineCode}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
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
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-400 my-2 pt-2 border-t border-[#1a2333]">
                        <div>
                          <span className="text-slate-500">Location:</span>{' '}
                          <span className="text-slate-300">{m.location || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Health:</span>{' '}
                          <span className="font-mono font-bold text-slate-200">
                            {score !== null && score !== undefined ? `${score} pts` : 'No data'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Type:</span>{' '}
                          <span className="text-slate-300">{m.machineType || 'General'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Installed:</span>{' '}
                          <span className="font-mono text-slate-300">{m.installationDate || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#1a2333]/60 text-[11px]">
                        <span className="text-blue-400 font-medium">
                          {isSelected ? '● Active in Telemetry' : 'Click to select'}
                        </span>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setEditingMachine(m)}
                            className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800"
                            title="Edit machine details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(m)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            title="Delete machine"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Right Column: Manual Sensor Reading Entry & Reading History (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeMachine ? (
            <>
              {/* Manual Sensor Entry Card */}
              <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e293b]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-orange-400" />
                      <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                        Manual Sensor Reading Entry
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Submitting condition data for{' '}
                      <span className="text-blue-400 font-bold">{activeMachine.machineName}</span> (
                      <span className="font-mono text-slate-300">{activeMachine.machineCode}</span>)
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono bg-[#090d16] px-2 py-1 rounded border border-[#1e293b]">
                    POST /api/machines/{activeMachine.id}/readings
                  </span>
                </div>

                <form onSubmit={handleSubmitReading} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Temperature Input */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Temperature (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="200"
                        placeholder="e.g. 48.5"
                        value={readingForm.temperature}
                        onChange={(e) =>
                          setReadingForm({ ...readingForm, temperature: e.target.value })
                        }
                        className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 outline-none"
                        required
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Threshold alert at &ge; 70°C
                      </span>
                    </div>

                    {/* Vibration Input */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Vibration (mm/s)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="25"
                        placeholder="e.g. 2.1"
                        value={readingForm.vibration}
                        onChange={(e) =>
                          setReadingForm({ ...readingForm, vibration: e.target.value })
                        }
                        className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 outline-none"
                        required
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Threshold alert at &ge; 5.0 mm/s
                      </span>
                    </div>

                    {/* Operating Hours */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Operating Hours (hrs)
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="e.g. 1500"
                        value={readingForm.operatingHours}
                        onChange={(e) =>
                          setReadingForm({ ...readingForm, operatingHours: e.target.value })
                        }
                        className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 outline-none"
                        required
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Cumulative run-time
                      </span>
                    </div>
                  </div>

                  {/* Real-time verified formula preview banner */}
                  {hasReadingInputs && (
                    <div className="p-3 rounded-lg bg-[#0c1322] border border-blue-900/40 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-mono text-blue-400 font-semibold">
                          Spring Boot Health Score Calculation:
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            previewCalc.category === 'Healthy'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                              : previewCalc.category === 'Warning'
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-800'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {previewCalc.category}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#090d16] p-2 rounded">
                        <div>
                          TempScore: <strong className="text-orange-400">{previewCalc.temperatureScore}</strong> (100 - {tempVal})
                        </div>
                        <div>
                          VibScore: <strong className="text-cyan-400">{previewCalc.vibrationScore}</strong> (100 - {vibVal}*10)
                        </div>
                        <div>
                          Score: <strong className="text-emerald-400 text-xs">{previewCalc.healthScore}</strong> / 100
                        </div>
                      </div>
                    </div>
                  )}

                  {readingError && (
                    <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                      {readingError}
                    </div>
                  )}

                  {readingSuccess && (
                    <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs">
                      {readingSuccess}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      Calculates & persists to database via SensorReadingService
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmittingReading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 disabled:opacity-50"
                    >
                      {isSubmittingReading ? 'Saving Reading...' : '+ Submit Sensor Reading'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Trend Charts for selected machine */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TrendChart
                  readings={machineReadings}
                  field="temperature"
                  label="Temperature"
                  unit="°C"
                  color="#f97316"
                  height={150}
                />
                <TrendChart
                  readings={machineReadings}
                  field="vibration"
                  label="Vibration"
                  unit=" mm/s"
                  color="#38bdf8"
                  height={150}
                />
              </div>

              {/* Sensor Reading History Table */}
              <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e293b]">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                      Sensor Reading History ({machineReadings.length})
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    GET /api/machines/{activeMachine.id}/readings
                  </span>
                </div>

                {machineReadings.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 border border-dashed border-[#1e293b] rounded-lg">
                    <p className="text-xs">No sensor readings recorded for this machine yet.</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Use the form above to record the initial temperature and vibration measurements.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#1e293b] text-slate-400 text-[11px] uppercase tracking-wider font-mono">
                          <th className="pb-2 pl-2">#ID</th>
                          <th className="pb-2">Timestamp</th>
                          <th className="pb-2">Temp (°C)</th>
                          <th className="pb-2">Vib (mm/s)</th>
                          <th className="pb-2">Hours</th>
                          <th className="pb-2">Health Score</th>
                          <th className="pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1a2333] font-mono">
                        {machineReadings.map((reading) => {
                          const status = getHealthStatus(reading.healthScore);
                          return (
                            <tr key={reading.id} className="hover:bg-[#151e33] transition-colors">
                              <td className="py-2.5 pl-2 font-bold text-slate-300">#{reading.id}</td>
                              <td className="py-2.5 text-slate-400 font-sans text-[11px]">
                                {new Date(reading.readingTime).toLocaleString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td className="py-2.5 text-orange-300 font-bold">
                                {reading.temperature}°C
                              </td>
                              <td className="py-2.5 text-cyan-300 font-bold">
                                {reading.vibration}
                              </td>
                              <td className="py-2.5 text-slate-300">
                                {reading.operatingHours}h
                              </td>
                              <td className="py-2.5 font-bold text-slate-100">
                                {reading.healthScore}
                              </td>
                              <td className="py-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                                    status === 'Healthy'
                                      ? 'bg-emerald-950/60 text-emerald-400'
                                      : status === 'Warning'
                                      ? 'bg-amber-950/60 text-amber-400'
                                      : 'bg-rose-950/60 text-rose-400'
                                  }`}
                                >
                                  {status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-12 text-center text-slate-500">
              <Cpu className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <h4 className="text-sm font-semibold text-slate-300">No machine selected</h4>
              <p className="text-xs text-slate-500 mt-1">
                Select a machine from the left list or register a new one to view and submit readings.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Register Machine */}
      {showAddMachineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-slate-100">Register New Machine</h3>
              </div>
              <button
                onClick={() => setShowAddMachineModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterMachine} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Machine Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Hydraulic Press HP-200"
                  value={newMachine.machineName}
                  onChange={(e) => setNewMachine({ ...newMachine, machineName: e.target.value })}
                  className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-slate-100 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Machine Code *</label>
                <input
                  type="text"
                  placeholder="e.g. MC-HP200"
                  value={newMachine.machineCode}
                  onChange={(e) => setNewMachine({ ...newMachine, machineCode: e.target.value })}
                  className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-slate-100 font-mono outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Machine Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Hydraulic Press"
                    value={newMachine.machineType}
                    onChange={(e) => setNewMachine({ ...newMachine, machineType: e.target.value })}
                    className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location / Bay</label>
                  <input
                    type="text"
                    placeholder="e.g. Bay 3"
                    value={newMachine.location}
                    onChange={(e) => setNewMachine({ ...newMachine, location: e.target.value })}
                    className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Status</label>
                  <select
                    value={newMachine.status}
                    onChange={(e) => setNewMachine({ ...newMachine, status: e.target.value })}
                    className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-slate-100 outline-none"
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="Warning">Warning</option>
                    <option value="Critical">Critical</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Installation Date</label>
                  <input
                    type="date"
                    value={newMachine.installationDate}
                    onChange={(e) => setNewMachine({ ...newMachine, installationDate: e.target.value })}
                    className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-slate-100 outline-none"
                  />
                </div>
              </div>

              {machineFormError && (
                <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                  {machineFormError}
                </div>
              )}

              {machineFormSuccess && (
                <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs">
                  {machineFormSuccess}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setShowAddMachineModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#1a2333] hover:bg-[#222f45] text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMachine}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {isSubmittingMachine ? 'Registering...' : 'Register Machine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Machine */}
      {editingMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-slate-100">Edit Machine #{editingMachine.id}</h3>
              </div>
              <button onClick={() => setEditingMachine(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMachine} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Machine Name</label>
                <input
                  type="text"
                  value={editingMachine.machineName}
                  onChange={(e) => setEditingMachine({ ...editingMachine, machineName: e.target.value })}
                  className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-slate-100 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Machine Code</label>
                <input
                  type="text"
                  value={editingMachine.machineCode}
                  onChange={(e) => setEditingMachine({ ...editingMachine, machineCode: e.target.value })}
                  className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-slate-100 font-mono outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Type</label>
                  <input
                    type="text"
                    value={editingMachine.machineType || ''}
                    onChange={(e) => setEditingMachine({ ...editingMachine, machineType: e.target.value })}
                    className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={editingMachine.location || ''}
                    onChange={(e) => setEditingMachine({ ...editingMachine, location: e.target.value })}
                    className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={editingMachine.status || 'Healthy'}
                    onChange={(e) => setEditingMachine({ ...editingMachine, status: e.target.value })}
                    className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-slate-100 outline-none"
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="Warning">Warning</option>
                    <option value="Critical">Critical</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Installation Date</label>
                  <input
                    type="date"
                    value={editingMachine.installationDate || ''}
                    onChange={(e) => setEditingMachine({ ...editingMachine, installationDate: e.target.value })}
                    className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setEditingMachine(null)}
                  className="px-4 py-2 rounded-lg bg-[#1a2333] hover:bg-[#222f45] text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingMachine}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {isUpdatingMachine ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
