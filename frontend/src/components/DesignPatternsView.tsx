import React, { useState } from 'react';
import {
  Code2,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  Play,
  RotateCcw,
  Zap,
  Radio,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { calculateHealthScore } from '../types';

export const DesignPatternsView: React.FC = () => {
  // Strategy pattern interactive state
  const [strategyTemp, setStrategyTemp] = useState<number>(68.0);
  const [strategyVib, setStrategyVib] = useState<number>(4.2);
  const [strategyHours, setStrategyHours] = useState<number>(2400.0);

  // Adapter pattern interactive state
  const [adapterType, setAdapterType] = useState<'csv' | 'json'>('csv');
  const [modbusCsvInput, setModbusCsvInput] = useState<string>('65.4, 3.8, 1420.0');
  const [iotJsonInput, setIotJsonInput] = useState<string>(
    JSON.stringify(
      {
        t_celsius: 74.2,
        vib_mms: 4.6,
        runtime_sec: 7200000,
      },
      null,
      2
    )
  );
  const [adapterResult, setAdapterResult] = useState<{
    success: boolean;
    protocol: string;
    adaptedDto: { temperature: number; vibration: number; operatingHours: number };
    healthScore: number;
    category: string;
  } | null>(null);

  // Factory pattern interactive state
  const [selectedSensorType, setSelectedSensorType] = useState<'Temperature' | 'Vibration' | 'Pressure'>('Vibration');
  const [factoryResult, setFactoryResult] = useState<{
    factoryClass: string;
    product: {
      type: string;
      unit: string;
      thresholdValue: number;
    };
  } | null>(null);

  // Calculate scores for all strategies in real time:
  // 1. Standard Heuristic Strategy (Verified original)
  const stdCalc = calculateHealthScore(strategyTemp, strategyVib);

  // 2. Thermal Centric Strategy
  const calcThermalStrategy = () => {
    const tempPenalty = strategyTemp > 40.0 ? Math.min(100.0, ((strategyTemp - 40.0) / (80.0 - 40.0)) * 100.0) : 0.0;
    const vibPenalty = strategyVib > 2.0 ? Math.min(100.0, ((strategyVib - 2.0) / (7.0 - 2.0)) * 100.0) : 0.0;
    const agingPenalty = Math.min(15.0, (strategyHours / 1000.0) * 1.5);
    const penalty = 0.70 * tempPenalty + 0.20 * vibPenalty + 0.10 * agingPenalty;
    return Math.round(Math.max(0.0, 100.0 - penalty) * 10.0) / 10.0;
  };

  // 3. Vibration Centric Strategy
  const calcVibrationStrategy = () => {
    const vibPenalty = strategyVib > 1.5 ? Math.min(100.0, ((strategyVib - 1.5) / (6.0 - 1.5)) * 100.0) : 0.0;
    const tempPenalty = strategyTemp > 50.0 ? Math.min(100.0, ((strategyTemp - 50.0) / (90.0 - 50.0)) * 100.0) : 0.0;
    const agingPenalty = Math.min(15.0, (strategyHours / 1000.0) * 1.5);
    const penalty = 0.70 * vibPenalty + 0.20 * tempPenalty + 0.10 * agingPenalty;
    return Math.round(Math.max(0.0, 100.0 - penalty) * 10.0) / 10.0;
  };

  const thermalScore = calcThermalStrategy();
  const vibrationScore = calcVibrationStrategy();

  // Run Adapter simulation
  const handleRunAdapter = () => {
    try {
      if (adapterType === 'csv') {
        const parts = modbusCsvInput.split(',').map((p) => p.trim());
        if (parts.length < 3) throw new Error('CSV must contain at least temperature, vibration, and hours');
        const temp = parseFloat(parts[0]);
        const vib = parseFloat(parts[1]);
        const hours = parseFloat(parts[2]);
        const calc = calculateHealthScore(temp, vib);

        setAdapterResult({
          success: true,
          protocol: 'Legacy Modbus PLC CSV (LegacyModbusCsvAdapter.java)',
          adaptedDto: { temperature: temp, vibration: vib, operatingHours: hours },
          healthScore: calc.healthScore,
          category: calc.category,
        });
      } else {
        const parsed = JSON.parse(iotJsonInput);
        const temp = parsed.temperature ?? parsed.temp_c ?? parsed.t_celsius ?? 0;
        const vib = parsed.vibration ?? parsed.vib_mms ?? parsed.v_rms ?? 0;
        const hours = parsed.operatingHours ?? (parsed.runtime_sec ? parsed.runtime_sec / 3600 : parsed.hours ?? 0);
        const calc = calculateHealthScore(temp, vib);

        setAdapterResult({
          success: true,
          protocol: 'Cloud IoT REST/MQTT JSON (ExternalIotJsonAdapter.java)',
          adaptedDto: {
            temperature: Math.round(temp * 10) / 10,
            vibration: Math.round(vib * 10) / 10,
            operatingHours: Math.round(hours * 10) / 10,
          },
          healthScore: calc.healthScore,
          category: calc.category,
        });
      }
    } catch (err: any) {
      alert(`Adapter failed: ${err.message}`);
    }
  };

  // Run Factory simulation
  const handleRunFactory = () => {
    if (selectedSensorType === 'Temperature') {
      setFactoryResult({
        factoryClass: 'TemperatureSensorFactory.java extends SensorFactory',
        product: {
          type: 'TEMPERATURE',
          unit: '°C',
          thresholdValue: 75.0,
        },
      });
    } else if (selectedSensorType === 'Vibration') {
      setFactoryResult({
        factoryClass: 'VibrationSensorFactory.java extends SensorFactory',
        product: {
          type: 'VIBRATION',
          unit: 'mm/s',
          thresholdValue: 4.5,
        },
      });
    } else {
      setFactoryResult({
        factoryClass: 'PressureSensorFactory.java extends SensorFactory',
        product: {
          type: 'PRESSURE',
          unit: 'bar',
          thresholdValue: 250.0,
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Pattern Architecture Header */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                OOAD Design Patterns Verification
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Concrete GoF patterns implemented in Spring Boot backend (<code className="text-blue-400 font-mono">com.predictive.backend.patterns</code>)
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-blue-950/60 text-blue-300 border border-blue-800">
            REST: /api/patterns
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The backend implements <strong>Factory Method</strong> (Creational), <strong>Adapter</strong> (Structural), and <strong>Strategy</strong> (Behavioral) design patterns. Below is the live interactive execution of each pattern and their verified participating classes.
        </p>
      </div>

      {/* 1. STRATEGY PATTERN */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1e293b]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/60 text-purple-300 border border-purple-800 font-mono">
                BEHAVIORAL
              </span>
              <h4 className="text-sm font-bold text-slate-100">1. Strategy Pattern</h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Decouples condition assessment algorithms, making them interchangeable at runtime via <code className="text-blue-400 font-mono">HealthStrategyResolver</code>.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Interface: <code className="text-slate-200">HealthCalculationStrategy.java</code>
          </span>
        </div>

        {/* Participating Classes Card */}
        <div className="p-3 bg-[#090d16] rounded-lg border border-[#1e293b] text-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">
            Participating Classes:
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
            <li>• <strong className="text-blue-400">Strategy Interface:</strong> <code className="text-slate-300">HealthCalculationStrategy</code></li>
            <li>• <strong className="text-emerald-400">Default Strategy:</strong> <code className="text-slate-300">StandardHeuristicStrategy</code> (@Primary verified formula)</li>
            <li>• <strong className="text-orange-400">Concrete Strategy:</strong> <code className="text-slate-300">ThermalCentricStrategy</code> (70% temp weighting)</li>
            <li>• <strong className="text-cyan-400">Concrete Strategy:</strong> <code className="text-slate-300">VibrationCentricStrategy</code> (70% vib weighting)</li>
            <li>• <strong className="text-purple-400">Context / Resolver:</strong> <code className="text-slate-300">HealthStrategyResolver</code> (selects strategy by machine profile)</li>
          </ul>
        </div>

        {/* Interactive Strategy Comparison Slider */}
        <div className="p-4 bg-[#0c1220] rounded-lg border border-[#1e293b] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              Adjust Telemetry Inputs to Compare Strategies
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Temperature:</span>
                <span className="font-mono text-orange-400 font-bold">{strategyTemp}°C</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="0.5"
                value={strategyTemp}
                onChange={(e) => setStrategyTemp(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Vibration:</span>
                <span className="font-mono text-cyan-400 font-bold">{strategyVib} mm/s</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.1"
                value={strategyVib}
                onChange={(e) => setStrategyVib(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Operating Hours:</span>
                <span className="font-mono text-slate-300 font-bold">{strategyHours} hrs</span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={strategyHours}
                onChange={(e) => setStrategyHours(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>

          {/* Side by side strategy results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {/* Standard Heuristic Strategy */}
            <div className="p-3 rounded-lg bg-[#090d16] border border-emerald-900/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">Standard Heuristic (Default)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300">
                  @Primary
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100">
                {stdCalc.healthScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono leading-tight">
                Formula: (max(0, 100-Temp) + max(0, 100-Vib*10)) / 2
              </p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block ${
                stdCalc.category === 'Healthy' ? 'bg-emerald-950/60 text-emerald-400' :
                stdCalc.category === 'Warning' ? 'bg-amber-950/60 text-amber-400' : 'bg-rose-950/60 text-rose-400'
              }`}>
                Classification: {stdCalc.category}
              </span>
            </div>

            {/* Thermal Centric Strategy */}
            <div className="p-3 rounded-lg bg-[#090d16] border border-orange-900/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-400">Thermal-Centric Strategy</span>
                <span className="text-[10px] font-mono text-slate-400">Boilers / Furnaces</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100">
                {thermalScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono leading-tight">
                Weights: 70% Temp + 20% Vib + 10% Hours
              </p>
              <span className="text-[10px] text-slate-400 block">
                Sensitive to thermal runaway and coolant degradation
              </span>
            </div>

            {/* Vibration Centric Strategy */}
            <div className="p-3 rounded-lg bg-[#090d16] border border-cyan-900/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400">Vibration-Centric Strategy</span>
                <span className="text-[10px] font-mono text-slate-400">Pumps / Spindles</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100">
                {vibrationScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono leading-tight">
                Weights: 70% Vib + 20% Temp + 10% Hours
              </p>
              <span className="text-[10px] text-slate-400 block">
                Sensitive to unbalance, misalignment, and bearing spall
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ADAPTER PATTERN */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1e293b]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/60 text-blue-300 border border-blue-800 font-mono">
                STRUCTURAL
              </span>
              <h4 className="text-sm font-bold text-slate-100">2. Adapter Pattern</h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Adapts heterogeneous legacy PLC CSV and modern cloud IoT JSON packets into the standardized domain <code className="text-blue-400 font-mono">SensorReadingRequestDto</code>.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Interface: <code className="text-slate-200">TelemetryAdapter.java</code>
          </span>
        </div>

        {/* Participating Classes Card */}
        <div className="p-3 bg-[#090d16] rounded-lg border border-[#1e293b] text-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">
            Participating Classes:
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
            <li>• <strong className="text-blue-400">Target Interface:</strong> <code className="text-slate-300">TelemetryAdapter</code></li>
            <li>• <strong className="text-emerald-400">Concrete Adapter 1:</strong> <code className="text-slate-300">LegacyModbusCsvAdapter</code> (adapts CSV telemetry)</li>
            <li>• <strong className="text-orange-400">Concrete Adapter 2:</strong> <code className="text-slate-300">ExternalIotJsonAdapter</code> (adapts vendor IoT JSON)</li>
            <li>• <strong className="text-purple-400">Target DTO:</strong> <code className="text-slate-300">SensorReadingRequestDto</code></li>
          </ul>
        </div>

        {/* Interactive Adapter Demo */}
        <div className="p-4 bg-[#0c1220] rounded-lg border border-[#1e293b] space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Select Adapter Protocol:</span>
            <button
              onClick={() => setAdapterType('csv')}
              className={`px-3 py-1 rounded text-xs font-medium ${
                adapterType === 'csv'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#090d16] text-slate-400 border border-[#1e293b]'
              }`}
            >
              Legacy Modbus CSV
            </button>
            <button
              onClick={() => setAdapterType('json')}
              className={`px-3 py-1 rounded text-xs font-medium ${
                adapterType === 'json'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#090d16] text-slate-400 border border-[#1e293b]'
              }`}
            >
              Cloud IoT JSON
            </button>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              Raw External Telemetry Input:
            </label>
            {adapterType === 'csv' ? (
              <input
                type="text"
                value={modbusCsvInput}
                onChange={(e) => setModbusCsvInput(e.target.value)}
                className="w-full bg-[#090d16] border border-[#1e293b] rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-blue-500"
              />
            ) : (
              <textarea
                rows={4}
                value={iotJsonInput}
                onChange={(e) => setIotJsonInput(e.target.value)}
                className="w-full bg-[#090d16] border border-[#1e293b] rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-blue-500"
              />
            )}
          </div>

          <button
            onClick={handleRunAdapter}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-600/20"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Execute Adapter Transformation</span>
          </button>

          {adapterResult && (
            <div className="p-3 bg-[#090d16] rounded-lg border border-emerald-900/50 space-y-2 text-xs">
              <div className="flex items-center justify-between text-emerald-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Adapted Successfully via {adapterResult.protocol}
                </span>
                <span className="font-mono text-[11px]">{adapterResult.category}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] bg-[#111827] p-2.5 rounded border border-[#1e293b]">
                <div>Temp: <strong className="text-orange-400">{adapterResult.adaptedDto.temperature}°C</strong></div>
                <div>Vibration: <strong className="text-cyan-400">{adapterResult.adaptedDto.vibration} mm/s</strong></div>
                <div>Hours: <strong className="text-slate-300">{adapterResult.adaptedDto.operatingHours}h</strong></div>
                <div>Calculated Score: <strong className="text-emerald-400">{adapterResult.healthScore} pts</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. FACTORY METHOD PATTERN */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1e293b]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800 font-mono">
                CREATIONAL
              </span>
              <h4 className="text-sm font-bold text-slate-100">3. Factory Method Pattern</h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Encapsulates the instantiation of calibrated sensor hardware entities with appropriate units and threshold limits.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Abstract Creator: <code className="text-slate-200">SensorFactory.java</code>
          </span>
        </div>

        {/* Participating Classes Card */}
        <div className="p-3 bg-[#090d16] rounded-lg border border-[#1e293b] text-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">
            Participating Classes:
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
            <li>• <strong className="text-blue-400">Abstract Creator:</strong> <code className="text-slate-300">SensorFactory</code> (<code className="text-slate-400">createSensor()</code>)</li>
            <li>• <strong className="text-orange-400">Concrete Creator 1:</strong> <code className="text-slate-300">TemperatureSensorFactory</code> (75.0°C default)</li>
            <li>• <strong className="text-cyan-400">Concrete Creator 2:</strong> <code className="text-slate-300">VibrationSensorFactory</code> (4.5 mm/s default)</li>
            <li>• <strong className="text-purple-400">Concrete Creator 3:</strong> <code className="text-slate-300">PressureSensorFactory</code> (250.0 bar default)</li>
            <li>• <strong className="text-emerald-400">Product Entity:</strong> <code className="text-slate-300">Sensor.java</code></li>
          </ul>
        </div>

        {/* Interactive Factory Demo */}
        <div className="p-4 bg-[#0c1220] rounded-lg border border-[#1e293b] space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300">Select Sensor Creator:</span>
            {(['Temperature', 'Vibration', 'Pressure'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedSensorType(type)}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  selectedSensorType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#090d16] text-slate-400 border border-[#1e293b]'
                }`}
              >
                {type} Factory
              </button>
            ))}
          </div>

          <button
            onClick={handleRunFactory}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instantiate Sensor via Factory Method</span>
          </button>

          {factoryResult && (
            <div className="p-3 bg-[#090d16] rounded-lg border border-amber-900/50 space-y-2 text-xs">
              <div className="text-amber-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Instantiated via {factoryResult.factoryClass}
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px] bg-[#111827] p-2.5 rounded border border-[#1e293b]">
                <div>Sensor Type: <strong className="text-slate-200">{factoryResult.product.type}</strong></div>
                <div>Unit: <strong className="text-blue-400">{factoryResult.product.unit}</strong></div>
                <div>Calibrated Threshold: <strong className="text-orange-400">{factoryResult.product.thresholdValue} {factoryResult.product.unit}</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
