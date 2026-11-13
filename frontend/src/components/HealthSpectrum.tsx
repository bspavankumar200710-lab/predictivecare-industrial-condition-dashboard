import React, { useState } from 'react';
import { calculateHealthScore } from '../types';
import { Calculator, CheckCircle2, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export const HealthSpectrum: React.FC = () => {
  const [testTemp, setTestTemp] = useState<number>(45);
  const [testVib, setTestVib] = useState<number>(2.5);

  const calc = calculateHealthScore(testTemp, testVib);

  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1e293b]">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Equipment Health Spectrum & Formula
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified calculation algorithm executed in Spring Boot backend (<code className="text-blue-400 font-mono">SensorReadingService.java</code>)
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-[#0b0f19] px-2.5 py-1 rounded border border-[#1e293b]">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>Rule-based heuristic condition monitoring (No unvalidated ISO claims)</span>
        </div>
      </div>

      {/* Visual Spectrum Bar */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>0.0 (Failure)</span>
          <span className="font-mono text-slate-300">Health Spectrum Ranges</span>
          <span>100.0 (Optimal)</span>
        </div>

        <div className="h-4 w-full rounded-full overflow-hidden flex bg-[#090d16] p-0.5 border border-[#1e293b]">
          {/* Critical zone: 0 to 40 (40%) */}
          <div className="h-full bg-gradient-to-r from-red-600 to-rose-500 w-[40%] rounded-l-full relative group">
            <div className="absolute inset-0 bg-red-400/20 animate-pulse"></div>
          </div>
          {/* Warning zone: 40 to 70 (30%) */}
          <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 w-[30%]"></div>
          {/* Healthy zone: 70 to 100 (30%) */}
          <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 w-[30%] rounded-r-full"></div>
        </div>

        {/* Legend labels */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="flex items-center justify-center gap-1.5 p-2 rounded bg-rose-950/20 border border-rose-900/30 text-rose-400 text-xs">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span className="font-semibold">Critical: &lt; 40.0</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2 rounded bg-amber-950/20 border border-amber-900/30 text-amber-400 text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="font-semibold">Warning: 40.0 – 69.9</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2 rounded bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="font-semibold">Healthy: ≥ 70.0</span>
          </div>
        </div>
      </div>

      {/* Mathematical Breakdown & Live Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-[#0c1220] p-4 rounded-lg border border-[#1e293b]">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
            <Calculator className="w-3.5 h-3.5 text-blue-400" />
            <span>Active Algorithm Specification</span>
          </div>
          <div className="font-mono text-xs bg-[#090d16] p-3 rounded border border-[#1e293b] text-slate-300 space-y-1">
            <div className="text-blue-400">// Java: SensorReadingService.java</div>
            <div>temperatureScore = Math.max(0, 100 - temperature);</div>
            <div>vibrationScore  = Math.max(0, 100 - (vibration * 10));</div>
            <div className="text-emerald-400 font-bold">
              healthScore     = (temperatureScore + vibrationScore) / 2;
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Both dimensions are normalized on a 0–100 scale before equal unweighted averaging. Temperature scale is 1:1 against 100°C ceiling, vibration scale is amplified by factor 10.
          </p>
        </div>

        {/* Live Interactive Verification Tester */}
        <div className="flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
            Verify Formula Output
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Temperature (°C)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="150"
                value={testTemp}
                onChange={(e) => setTestTemp(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#111827] border border-[#1e293b] focus:border-blue-500 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono outline-none"
              />
              <span className="text-[10px] text-slate-500">TempScore: {calc.temperatureScore}</span>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Vibration (mm/s)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="15"
                value={testVib}
                onChange={(e) => setTestVib(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#111827] border border-[#1e293b] focus:border-blue-500 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono outline-none"
              />
              <span className="text-[10px] text-slate-500">VibScore: {calc.vibrationScore}</span>
            </div>
          </div>

          <div className="bg-[#111827] p-2.5 rounded border border-[#1e293b] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">Calculated Health Score</span>
              <span className="text-xl font-bold font-mono text-slate-100">{calc.healthScore}</span>
              <span className="text-xs text-slate-400 font-mono"> / 100</span>
            </div>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full ${
                calc.category === 'Healthy'
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                  : calc.category === 'Warning'
                  ? 'bg-amber-950/60 text-amber-400 border border-amber-800'
                  : 'bg-rose-950/60 text-rose-400 border border-rose-800'
              }`}
            >
              {calc.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
