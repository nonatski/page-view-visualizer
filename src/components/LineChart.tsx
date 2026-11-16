import { useId, useMemo, useState } from 'react';
import { formatK, formatNumber, monthShort, type DayRecord } from '@/data/stats';

interface LineChartProps {
  data: DayRecord[];
}

const W = 1000;
const H = 480;
const M = { top: 24, right: 28, bottom: 52, left: 68 };
const IW = W - M.left - M.right;
const IH = H - M.top - M.bottom;

export default function LineChart({ data }: LineChartProps) {
  const gradientId = useId().replace(/:/g, '');
  const [hover, setHover] = useState<DayRecord | null>(null);

  const { path, areaPath, xTicks, yTicks, scale } = useMemo(() => {
    const t0 = data[0].date.getTime();
    const t1 = data[data.length - 1].date.getTime();
    const vMin = Math.min(...data.map((d) => d.value));
    const vMax = Math.max(...data.map((d) => d.value));
    const pad = (vMax - vMin) * 0.05;
    const lo = vMin - pad;
    const hi = vMax + pad;

    const x = (t: number) => M.left + ((t - t0) / (t1 - t0)) * IW;
    const y = (v: number) => M.top + IH - ((v - lo) / (hi - lo)) * IH;

    let d = '';
    for (let i = 0; i < data.length; i++) {
      d += (i === 0 ? 'M' : 'L') + x(data[i].date.getTime()).toFixed(2) + ' ' + y(data[i].value).toFixed(2);
    }
    const area =
      d +
      `L${x(t1).toFixed(2)} ${(M.top + IH).toFixed(2)}L${x(t0).toFixed(2)} ${(M.top + IH).toFixed(2)}Z`;

    const xt: { x: number; label: string }[] = [];
    const seenYear = new Set<number>();
    for (const rec of data) {
      const yr = rec.date.getUTCFullYear();
      if (!seenYear.has(yr)) {
        seenYear.add(yr);
        xt.push({ x: x(rec.date.getTime()), label: yr.toString() });
      }
    }

    const yt: { y: number; label: string }[] = [];
    const step = niceStep((hi - lo) / 5);
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
      yt.push({ y: y(v), label: formatK(v) });
    }

    return { path: d, areaPath: area, xTicks: xt, yTicks: yt, scale: { x, y, t0, t1 } };
  }, [data]);

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const t = scale.t0 + ((px - M.left) / IW) * (scale.t1 - scale.t0);
    const idx = Math.min(
      data.length - 1,
      Math.max(0, Math.round(((t - data[0].date.getTime()) / (scale.t1 - scale.t0)) * (data.length - 1)))
    );
    setHover(data[idx]);
  };

  const hx = hover ? scale.x(hover.date.getTime()) : 0;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto cursor-crosshair"
        role="img"
        aria-label="Daily freeCodeCamp Forum Page Views 5/2016-12/2019 line chart"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={M.left} x2={W - M.right} y1={t.y} y2={t.y} stroke="#262626" strokeWidth="1" />
            <text x={M.left - 10} y={t.y + 4} textAnchor="end" fill="#8f8f8f" fontSize="13" fontFamily="'IBM Plex Mono', monospace">
              {t.label}
            </text>
          </g>
        ))}
        {xTicks.map((t, i) => (
          <g key={i}>
            <line x1={t.x} x2={t.x} y1={M.top} y2={M.top + IH} stroke="#262626" strokeWidth="1" />
            <text x={t.x} y={M.top + IH + 26} textAnchor="middle" fill="#8f8f8f" fontSize="14" fontFamily="'IBM Plex Mono', monospace">
              {t.label}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path
          d={path}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="1.6"
          strokeLinejoin="round"
          className="animate-draw-line"
          style={{ ['--dash' as string]: '4200', strokeDasharray: 4200 }}
        />

        {hover && (
          <g pointerEvents="none">
            <line x1={hx} x2={hx} y1={M.top} y2={M.top + IH} stroke="#525252" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx={hx} cy={scale.y(hover.value)} r="4.5" fill="#22d3ee" stroke="#0a0a0a" strokeWidth="2" />
          </g>
        )}

        <text x={M.left + IW / 2} y={H - 6} textAnchor="middle" fill="#a3a3a3" fontSize="15" fontFamily="'IBM Plex Mono', monospace">
          Date
        </text>
        <text
          x={18}
          y={M.top + IH / 2}
          textAnchor="middle"
          fill="#a3a3a3"
          fontSize="15"
          fontFamily="'IBM Plex Mono', monospace"
          transform={`rotate(-90 18 ${M.top + IH / 2})`}
        >
          Page Views
        </text>
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-lg border border-neutral-700 bg-neutral-900/95 px-3 py-2 text-xs shadow-xl whitespace-nowrap"
          style={{ left: `${(hx / W) * 100}%`, top: `${((scale.y(hover.value) - 14) / H) * 100}%` }}
        >
          <div className="font-mono-plex text-neutral-400">
            {hover.date.getUTCFullYear()}-{String(hover.date.getUTCMonth() + 1).padStart(2, '0')}-
            {String(hover.date.getUTCDate()).padStart(2, '0')}
          </div>
          <div className="font-mono-plex font-semibold text-cyan-300">{formatNumber(hover.value)} views</div>
        </div>
      )}
    </div>
  );
}

function niceStep(raw: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / pow;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return nice * pow;
}
