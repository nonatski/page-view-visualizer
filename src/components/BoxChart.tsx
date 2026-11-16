import { useState } from 'react';
import { formatK, formatNumber, monthBoxes, monthShort, monthLong, yearBoxes } from '@/data/stats';import type { BoxStats } from '@/data/stats';

interface BoxChartProps {
  mode: 'year' | 'month';
}

const W = 1000;
const H = 500;
const M = { top: 28, right: 24, bottom: 64, left: 72 };
const IW = W - M.left - M.right;
const IH = H - M.top - M.bottom;

const V_MIN = 15000;
const V_MAX = 185000;

export default function BoxChart({ mode }: BoxChartProps) {
  const [hover, setHover] = useState<number | null>(null);

  const groups = mode === 'year' ? yearBoxes.map((b) => ({ key: b.year, stats: b.stats })) : monthBoxes.map((b) => ({ key: b.month, stats: b.stats }));

  const y = (v: number) => M.top + IH - ((v - V_MIN) / (V_MAX - V_MIN)) * IH;
  const groupWidth = IW / groups.length;

  const yTicks: { y: number; label: string }[] = [];
  const step = 20000;
  for (let v = 20000; v <= V_MAX; v += step) {
    yTicks.push({ y: y(v), label: formatK(v) });
  }

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={mode === 'year' ? 'Year-wise box plot showing trend' : 'Month-wise box plot showing seasonality'}>
        <title>{mode === 'year' ? 'Year-wise Box Plot (Trend)' : 'Month-wise Box Plot (Seasonality)'}</title>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={M.left} x2={W - M.right} y1={t.y} y2={t.y} stroke="#262626" strokeWidth="1" />
            <text x={M.left - 10} y={t.y + 4} textAnchor="end" fill="#8f8f8f" fontSize="13" fontFamily="'IBM Plex Mono', monospace">
              {t.label}
            </text>
          </g>
        ))}

        {groups.map((g, i) => {
          const cx = M.left + (i + 0.5) * groupWidth;
          const boxW = Math.min(46, groupWidth * 0.42);
          const s: BoxStats = g.stats;
          const isHover = hover === i;
          const color = isHover ? '#22d3ee' : '#34d399';

          return (
            <g
              key={g.key}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="cursor-pointer"
            >
              <rect x={cx - groupWidth / 2} y={M.top} width={groupWidth} height={IH} fill="transparent" />
              <line x1={cx} x2={cx} y1={y(s.min)} y2={y(s.max)} stroke={color} strokeWidth="1.4" opacity="0.55" />
              <line x1={cx - boxW * 0.35} x2={cx + boxW * 0.35} y1={y(s.min)} y2={y(s.min)} stroke={color} strokeWidth="1.6" />
              <line x1={cx - boxW * 0.35} x2={cx + boxW * 0.35} y1={y(s.max)} y2={y(s.max)} stroke={color} strokeWidth="1.6" />
              <rect
                x={cx - boxW / 2}
                y={y(s.q3)}
                width={boxW}
                height={Math.max(2, y(s.q1) - y(s.q3))}
                fill={isHover ? 'rgba(34,211,238,0.18)' : 'rgba(52,211,153,0.14)'}
                stroke={color}
                strokeWidth="1.6"
                rx="3"
                className="transition-all duration-150"
              />
              <line x1={cx - boxW / 2} x2={cx + boxW / 2} y1={y(s.median)} y2={y(s.median)} stroke={color} strokeWidth="2.4" />
              <text
                x={cx}
                y={M.top + IH + 26}
                textAnchor="middle"
                fill={isHover ? '#ffffff' : '#a3a3a3'}
                fontSize="14"
                fontFamily="'IBM Plex Mono', monospace"
              >
                {mode === 'year' ? g.key : monthShort(g.key)}
              </text>
            </g>
          );
        })}

        <text x={M.left + IW / 2} y={H - 4} textAnchor="middle" fill="#a3a3a3" fontSize="15" fontWeight="600">
          {mode === 'year' ? 'Year' : 'Month'}
        </text>
        <text
          x={16}
          y={M.top + IH / 2}
          textAnchor="middle"
          fill="#a3a3a3"
          fontSize="15"
          fontWeight="600"
          transform={`rotate(-90 16 ${M.top + IH / 2})`}
        >
          Page Views
        </text>
      </svg>

      {hover !== null && (
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="mb-3 text-sm font-semibold text-cyan-300">
            {mode === 'year' ? yearBoxes[hover].year : monthLong(monthBoxes[hover].month)}
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-5">
            {[
              ['Max', groups[hover].stats.max],
              ['Q3', groups[hover].stats.q3],
              ['Median', groups[hover].stats.median],
              ['Q1', groups[hover].stats.q1],
              ['Min', groups[hover].stats.min],
            ].map(([label, v]) => (
              <div key={label as string}>
                <div className="text-xs uppercase tracking-wider text-neutral-500">{label}</div>
                <div className="font-mono-plex text-neutral-100">{formatNumber(v as number)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
