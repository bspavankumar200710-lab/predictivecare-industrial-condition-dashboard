import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Server, Database, CheckCircle2, AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';

interface BackendModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBackendConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
  onResetData: () => void;
}

export const BackendModal: React.FC<BackendModalProps> = ({
  isOpen,
  onClose,
  isBackendConnected,
  onConnectionChange,
  onResetData,
}) => {
  const [url, setUrl] = useState(api.getBackendUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ connected: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    api.setBackendUrl(url);
    const res = await api.pingBackend();
    setTestResult(res);
    onConnectionChange(res.connected);
    setTesting(false);
  };

  const handleResetUrl = () => {
    const defaultUrl = api.resetBackendUrl();
    setUrl(defaultUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Backend & Database Settings</h3>
              <p className="text-xs text-slate-400">Spring Boot REST API & MySQL Connectivity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#1a243b]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-slate-300">
          <div>
            <label className="block font-medium text-slate-200 mb-1">
              Spring Boot REST API Endpoint
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:8080/api"
                className="flex-1 bg-[#090d16] border border-[#1e293b] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:border-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={handleResetUrl}
                className="px-3 py-2 rounded-lg bg-[#1a2333] hover:bg-[#222f45] border border-[#1e293b] text-slate-300 text-xs"
                title="Reset to default (http://localhost:8080/api)"
              >
                Reset
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Default is <code className="text-blue-400">http://localhost:8080/api</code> matching <code className="text-slate-400">application.properties</code>.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#0c1220] border border-[#1e293b] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                Backend Configuration
              </span>
              <span className="font-mono text-[11px] text-slate-400">Java 21 · Spring Boot</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div><strong className="text-slate-300">MySQL Database:</strong> <span className="font-mono">predictive_maintenance</span></div>
              <div><strong className="text-slate-300">CORS Origins:</strong> <span className="font-mono">http://localhost:5173, http://localhost:3000, *</span></div>
              <div><strong className="text-slate-300">Active Persistence:</strong> {isBackendConnected ? 'Direct Spring Boot REST API' : 'Contract-Compatible In-Browser Mirror'}</div>
            </div>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                testResult.connected
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-amber-950/30 border-amber-800 text-amber-300'
              }`}
            >
              {testResult.connected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">
                <strong>{testResult.connected ? 'Connected!' : 'Note:'}</strong> {testResult.message}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={onResetData}
              className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 text-[11px] py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Local Database Cache
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#1a2333] hover:bg-[#222f45] text-slate-300 text-xs font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
