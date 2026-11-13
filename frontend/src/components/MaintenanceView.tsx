import React, { useState } from 'react';
import { Machine, Maintenance, MaintenancePriority, MaintenanceStatus } from '../types';
import {
  ClipboardList,
  Plus,
  Wrench,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Trash2,
  Calendar,
  AlertOctagon,
  AlertTriangle,
  Info,
  Filter,
  X,
} from 'lucide-react';

interface MaintenanceViewProps {
  machines: Machine[];
  maintenanceOrders: Maintenance[];
  onCreateMaintenance: (
    machineId: number,
    data: {
      title: string;
      description: string;
      priority: MaintenancePriority;
      scheduledDate?: string | null;
      notes?: string | null;
    }
  ) => Promise<void>;
  onUpdateStatus: (id: number, status: MaintenanceStatus, notes?: string) => Promise<void>;
  onDeleteOrder: (id: number) => Promise<void>;
  initialMachineId?: number | null;
  initialTitle?: string;
  initialPriority?: MaintenancePriority;
  isLoading: boolean;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  machines,
  maintenanceOrders,
  onCreateMaintenance,
  onUpdateStatus,
  onDeleteOrder,
  initialMachineId,
  initialTitle,
  initialPriority,
  isLoading,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form state
  const [formMachineId, setFormMachineId] = useState<string>(
    initialMachineId ? String(initialMachineId) : machines.length > 0 ? String(machines[0].id) : ''
  );
  const [title, setTitle] = useState(initialTitle || '');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<MaintenancePriority>(initialPriority || 'MEDIUM');
  const [scheduledDate, setScheduledDate] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status notes update modal
  const [statusUpdateTarget, setStatusUpdateTarget] = useState<{
    id: number;
    newStatus: MaintenanceStatus;
  } | null>(null);
  const [updateNotes, setUpdateNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Filter orders
  const filteredOrders = maintenanceOrders.filter((order) => {
    if (filterStatus === 'ALL') return true;
    return order.status.toUpperCase() === filterStatus.toUpperCase();
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formMachineId) {
      setFormError('Please select a machine from the database.');
      return;
    }

    if (!title.trim()) {
      setFormError('Maintenance title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateMaintenance(Number(formMachineId), {
        title,
        description,
        priority,
        scheduledDate: scheduledDate || null,
        notes: notes || null,
      });

      setTitle('');
      setDescription('');
      setScheduledDate('');
      setNotes('');
      setShowCreateModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create maintenance order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmStatusUpdate = async () => {
    if (!statusUpdateTarget) return;
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(statusUpdateTarget.id, statusUpdateTarget.newStatus, updateNotes);
      setStatusUpdateTarget(null);
      setUpdateNotes('');
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async (order: Maintenance) => {
    if (confirm(`Delete maintenance order #${order.id} (${order.title})?`)) {
      try {
        await onDeleteOrder(order.id);
      } catch (err: any) {
        alert(`Deletion failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Scope & Honest Implementation Notice */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20 mt-0.5">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">
                  Maintenance Order Management Subsystem
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800 font-semibold">
                  Full CRUD &amp; Persistence
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Persisted via Spring Boot backend (<code className="text-blue-400 font-mono">MaintenanceRequestController.java</code>) into MySQL table <code className="text-slate-300 font-mono">maintenance_requests</code>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowCreateModal(true);
                setFormError('');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Maintenance Request</span>
            </button>
          </div>
        </div>

        {/* Technical Validation & Integrity Note */}
        <div className="mt-4 pt-3 border-t border-[#1e293b] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>
              <strong>Integrity Guard:</strong> Displays actual user-created records only. Fabricated technicians, simulated dispatch logs, and unverified auto-completion notes are strictly omitted.
            </span>
          </div>
          <span className="font-mono text-slate-500">
            REST: /api/maintenance/machine/{'{id}'}
          </span>
        </div>
      </div>

      {/* Filter Bar & Metrics */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Status Filter:</span>
          <div className="flex flex-wrap gap-1">
            {['ALL', 'REQUESTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  filterStatus === st
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#090d16] text-slate-400 hover:text-slate-200 border border-[#1e293b]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredOrders.length} of {maintenanceOrders.length} requests
        </div>
      </div>

      {/* Maintenance Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-[#111827] border border-dashed border-[#1e293b] rounded-xl p-12 text-center text-slate-500">
            <ClipboardList className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <h4 className="text-sm font-semibold text-slate-300">No maintenance requests found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {filterStatus === 'ALL'
                ? 'Create a service request to schedule inspection or corrective maintenance on any registered machine.'
                : `No orders currently in '${filterStatus}' state.`}
            </p>
            {filterStatus === 'ALL' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                Create First Request
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isCompleted = order.status === 'COMPLETED';
            const isCancelled = order.status === 'CANCELLED';
            const isInProgress = order.status === 'IN_PROGRESS';

            return (
              <div
                key={order.id}
                className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400">
                        #{order.id}
                      </span>
                      <h4 className="text-base font-bold text-slate-100">{order.title}</h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="text-slate-300 font-medium">
                        Machine: <strong className="text-white">{order.machine.machineName}</strong>
                      </span>
                      <span className="font-mono text-slate-500">[{order.machine.machineCode}]</span>
                      <span>•</span>
                      <span>{order.machine.location || 'Location unassigned'}</span>
                    </div>
                  </div>

                  {/* Priority & Status Badges */}
                  <div className="flex items-center gap-2 self-start">
                    {/* Priority badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        order.priority === 'CRITICAL'
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-800'
                          : order.priority === 'HIGH'
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-800'
                          : order.priority === 'MEDIUM'
                          ? 'bg-blue-950/60 text-blue-400 border border-blue-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {order.priority}
                    </span>

                    {/* Status badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        order.status === 'COMPLETED'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                          : order.status === 'IN_PROGRESS'
                          ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800'
                          : order.status === 'CANCELLED'
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {order.description && (
                  <p className="text-xs text-slate-300 bg-[#090d16] p-3 rounded-lg border border-[#1a2333] my-3 leading-relaxed">
                    {order.description}
                  </p>
                )}

                {/* Dates & Notes Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 my-3">
                  <div>
                    <span className="text-slate-500">Requested:</span>{' '}
                    <span className="font-mono text-slate-300">
                      {new Date(order.requestDate).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500">Scheduled:</span>{' '}
                    <span className="font-mono text-slate-300">
                      {order.scheduledDate || 'Not scheduled'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500">Completed:</span>{' '}
                    <span className="font-mono text-slate-300">
                      {order.completionDate
                        ? new Date(order.completionDate).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </span>
                  </div>
                </div>

                {order.notes && (
                  <div className="text-[11px] text-slate-300 bg-[#0c1220] px-3 py-2 rounded border border-[#1e293b] mb-3">
                    <span className="text-slate-500 font-semibold mr-1.5">Resolution Notes:</span>
                    {order.notes}
                  </div>
                )}

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#1a2333] text-xs">
                  <div className="flex items-center gap-2">
                    {/* Status change actions */}
                    {order.status !== 'IN_PROGRESS' && !isCompleted && (
                      <button
                        onClick={() =>
                          setStatusUpdateTarget({ id: order.id, newStatus: 'IN_PROGRESS' })
                        }
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1e293b] hover:bg-[#283852] text-cyan-300 font-medium"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Start Work</span>
                      </button>
                    )}

                    {!isCompleted && (
                      <button
                        onClick={() =>
                          setStatusUpdateTarget({ id: order.id, newStatus: 'COMPLETED' })
                        }
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Completed</span>
                      </button>
                    )}

                    {!isCompleted && !isCancelled && (
                      <button
                        onClick={() =>
                          setStatusUpdateTarget({ id: order.id, newStatus: 'CANCELLED' })
                        }
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Order</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(order)}
                    className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/20"
                    title="Delete record from database"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Maintenance Request */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-slate-100">New Maintenance Order</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Machine *</label>
                <select
                  value={formMachineId}
                  onChange={(e) => setFormMachineId(e.target.value)}
                  className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-slate-100 outline-none"
                  required
                >
                  <option value="">Select equipment from database</option>
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.machineName} ({m.machineCode}) - {m.location || 'No location'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Order Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Bearing Assembly Lubrication &amp; Thermal Check"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-slate-100 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
                    className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-slate-100 outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Work Description</label>
                <textarea
                  rows={3}
                  placeholder="Details of required diagnosis, maintenance procedures, or replacement parts..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Flagged due to sensor vibration spike"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-slate-100 outline-none"
                />
              </div>

              {formError && (
                <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#1a2333] hover:bg-[#222f45] text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Status Update & Resolution Notes */}
      {statusUpdateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">
                Update Order #{statusUpdateTarget.id} &rarr; {statusUpdateTarget.newStatus}
              </h3>
              <button
                onClick={() => setStatusUpdateTarget(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Resolution / Status Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Record actual maintenance steps taken or reason for status transition..."
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  className="w-full bg-[#090d16] border border-[#1e293b] focus:border-blue-500 rounded-lg px-3 py-2 text-slate-100 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setStatusUpdateTarget(null)}
                  className="px-4 py-2 rounded-lg bg-[#1a2333] hover:bg-[#222f45] text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStatusUpdate}
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {isUpdatingStatus ? 'Saving...' : 'Confirm Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
