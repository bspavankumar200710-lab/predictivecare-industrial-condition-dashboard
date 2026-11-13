import React from 'react';
import { SensorReading } from '../types';

interface TrendChartProps {
  readings: SensorReading[];
  field: 'temperature' | 'vibration' | 'healthScore';
  label: string;
  unit: string;
  color?: string;
  height?: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  readings,
  field,
  label,
  unit,
  color = '#3b82f6',
  height = 180,
}) => {
  // Sort oldest to newest for chronological left-to-right display, max 10 points
  const points = [...readings].sort((a, b) => a.id - b.id).slice(-10);
  const values = points.map((item) => Number(item[field] ?? 0));

  const width = 500;
  const padX = 35;
  const padY = 25;

  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 100;
  // Ensure some headroom so flat lines render centered
  const range = maxVal - minVal || 10;
  const graphMin = Math.max(0, Math.floor(minVal - range * 0.15));
  const graphMax = Math.ceil(maxVal + range * 0.15);
  const graphRange = graphMax - graphMin || 1;

  const coords = values.map((val, idx) => {
    const x = padX + (points.length <= 1 ? (width - padX * 2) / 2 : (idx * (width - padX * 2)) / (points.length - 1));
    const y = height - padY - ((val - graphMin) / graphRange) * (height - padY * 2);
    return { x, y, val };
  });

  const path = coords.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
  const areaPath = coords.length > 1
    ? `${path} L ${coords[coords.length - 1].x} ${height - padY} L ${coords[0].x} ${height - padY} Z`
    : '';

  const latestVal = values.length > 0 ? values[values.length - 1] : null;

  return (
    <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-400">{label} Trend</h4>
          <p className="text-[11px] text-slate-500">
            {points.length > 0 ? `Latest ${points.length} recorded readings` : 'No reading data yet'}
          </p>
        </div>
        {latestVal !== null && (
          <div className="text-right">
            <span className="text-lg font-bold text-slate-100 font-mono">
              {latestVal}
              <span className="text-xs text-slate-400 font-normal ml-0.5">{unit}</span>
            </span>
          </div>
        )}
      </div>

      {points.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-xs text-slate-500 border border-dashed border-[#1e293b] rounded-lg">
          Add sensor readings to generate chronological telemetry curve
        </div>
      ) : (
        <div className="w-full relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible" role="img" aria-label={`${label} trend`}>
            <defs>
              <linearGradient id={`grad-${field}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={color} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal guide lines */}
            {[0, 0.33, 0.66, 1].map((pct, idx) => {
              const y = padY + pct * (height - padY * 2);
              const val = Math.round(graphMax - pct * graphRange);
              return (
                <g key={idx}>
                  <line
                    x1={padX}
                    x2={width - padX}
                    y1={y}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={padX - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            {areaPath && <path d={areaPath} fill={`url(#grad-${field})`} />}

            {/* Main line */}
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {coords.map((pt, idx) => (
              <g key={idx} className="group cursor-pointer">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#0f172a"
                  stroke={color}
                  strokeWidth="2"
                  className="transition-transform duration-150 hover:scale-150"
                />
                <title>{`#${points[idx].id}: ${pt.val}${unit} @ ${new Date(points[idx].readingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</title>
              </g>
            ))}
          </svg>
        </div>
      )}
    </div>
  );
};
