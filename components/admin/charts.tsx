"use client";

import type { SeriesPoint } from "@/lib/types";

interface LineChartProps {
  data: SeriesPoint[];
  height?: number;
  color?: string;
  className?: string;
}

export function LineChart({ data, height = 220, color = "#e3394e", className }: LineChartProps) {
  if (data.length === 0) {
    return <div className="chart-empty">No data for this period</div>;
  }

  const width = 640;
  const padding = { top: 16, right: 12, bottom: 28, left: 36 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const stepX = innerW / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + innerH - (d.value / max) * innerH,
    ...d,
  }));

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${path} L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const xStep = Math.max(1, Math.ceil(data.length / 6));

  return (
    <div className={`line-chart-wrap ${className ?? ""}`}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Trend chart">
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {yTicks.map((t) => {
          const y = padding.top + innerH - t * innerH;
          return (
            <g key={t}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
              <text x={padding.left - 6} y={y + 4} textAnchor="end" className="chart-tick">{Math.round(max * t)}</text>
            </g>
          );
        })}
        <path d={areaPath} fill={`url(#grad-${color.replace("#", "")})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) =>
          i % xStep === 0 ? (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
          ) : null
        )}
        {points.map((p, i) =>
          i % xStep === 0 ? (
            <text key={`lbl-${i}`} x={p.x} y={height - 8} textAnchor="middle" className="chart-tick chart-x">
              {p.label.slice(5)}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
}

interface BarChartProps {
  data: SeriesPoint[];
  height?: number;
  color?: string;
  className?: string;
}

export function BarChart({ data, height = 220, color = "#e3394e", className }: BarChartProps) {
  if (data.length === 0) {
    return <div className="chart-empty">No data for this period</div>;
  }

  const width = 640;
  const padding = { top: 16, right: 12, bottom: 28, left: 36 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const max = Math.max(...data.map((d) => d.value), 1);
  const barW = innerW / data.length;
  const stepX = barW;

  const yTicks = [0, 0.5, 1];

  return (
    <div className={`bar-chart-wrap ${className ?? ""}`}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Bar chart">
        {yTicks.map((t) => {
          const y = padding.top + innerH - t * innerH;
          return (
            <g key={t}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
              <text x={padding.left - 6} y={y + 4} textAnchor="end" className="chart-tick">{Math.round(max * t)}</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = (d.value / max) * innerH;
          const x = padding.left + i * stepX + stepX * 0.2;
          const w = stepX * 0.6;
          const y = padding.top + innerH - h;
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} fill={color} rx="2" opacity="0.85">
                <title>{`${d.label}: ${d.value}`}</title>
              </rect>
              {data.length <= 31 && (
                <text x={x + w / 2} y={y - 5} textAnchor="middle" className="chart-bar-value">{d.value}</text>
              )}
            </g>
          );
        })}
        {data.map((d, i) =>
          data.length <= 31 || i % 5 === 0 ? (
            <text key={`lbl-${i}`} x={padding.left + i * stepX + stepX / 2} y={height - 8} textAnchor="middle" className="chart-tick chart-x">
              {d.label.slice(5)}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
}