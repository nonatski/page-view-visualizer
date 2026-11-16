import { useMemo, useState } from 'react';
import { formatK, formatNumber, monthLong, monthlyAverages, years } from '@/data/stats';

const MONTH_KEYS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const W = 1000;
const H = 500;
const M = { top: 32, right: 24, bottom: 76, left: 72 };
const IW = W - M.left - M.right;
const IH = H - M.top - M.bottom;

const PALETTE = [
  '#22d3ee',
  '#34d399',
  '#a3e635',
  '#fbbf24',
  '#fb923c',
  '#f87171',
  '#f472b6',
  '#c084fc',
  '#60a5fa',
  '#38bdf8',
  '#2dd4bf',
  '#a78bfa',
];

export default function BarChart() {
  const [active, setActive] = useState<number | null>(null);

  const { vMax, yTicks, xTickPositions } = useMemo(() => {
    const max = Math.max(...monthlyAverages.map((p) => p.avg));
    const top = Math.ceil(max / 10000) * 10000;
    const ticks: { y: number; label: string }[] = [];
    const step = top / 5;
    for (let v = 0; v <= top; v += step) {
      ticks.push({ y: M.top + IH - (v / top) * IH, label: formatK(v) });
    }
    const xpos = new Map<number, number>();
    years.forEach((year, i) => {
      xpos.set(year, M.left + ((i + 0.5) / years.length) * IW);
    });
    return { vMax: top, yTicks: ticks, xTickPositions: xpos };
  }, []);

  const groupWidth = IW / years.length;
  const barWidth = (groupWidth * 0.78) / 12;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Average daily page views per month grouped by year">
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={M.left} x2={W - M.right} y1={t.y} y2={t.y} stroke={i === 0 ? '#404040' : '#262626'} strokeWidth="1" />
            <text x={M.left - 10} y={t.y + 4} textAnchor="end" fill="#8f8f8f" fontSize="13" fontFamily="'IBM Plex Mono', monospace">
              {t.label}
            </text>
          </g>
        ))}

        {years.map((year, gi) => {
          const points = monthlyAverages.filter((p) => p.year === year);
          const gx = M.left + gi * groupWidth;
          return (
            <g key={year}>
              {points.map((p) => {
                const bi = p.month;
                const bx = gx + groupWidth * 0.11 + bi * barWidth;
                const bh = (p.avg / vMax) * IH;
                const by = M.top + IH - bh;
                const isActive = active === bi;
                return (
                  <rect
                    key={bi}
                    x={bx}
                    y={by}
                    width={barWidth - 1.5}
                    height={bh}
                    fill={MONTH_KEYS[bi]}
                    opacity={active === null || isActive ? 1 : 0.25}
                    rx="2"
                    onMouseEnter={() => setActive(bi)}
                    onMouseLeave={() => setActive(null)}
                    className="cursor-pointer transition-opacity duration-150"
                  />
                );
              })}
              <text x={gx + groupWidth / 2} y={M.top + IH + 26} textAnchor="middle" fill="#a3a3a3" fontSize="15" fontFamily="'IBM Plex Mono', monospace">
                {year}
              </text>
            </g>
          );
        })}

        <text x={M.left + IW / 2} y={H - 10} textAnchor="middle" fill="#a3a3a3" fontSize="16" fontWeight="600">
          Years
        </text>
        <text
          x={18}
          y={M.top + IH / 2}
          textAnchor="middle"
          fill="#a3a3a3"
          fontSize="16"
          fontWeight="600"
          transform={`rotate(-90 18 ${M.top + IH / 2})`}
        >
          Average Page Views
        </text>
      </svg>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <span className="text-sm font-semibold text-neutral-300">Months</span>
        {MONTH_KEYS.map((label, i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              className={`flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-sm transition-colors ${
                active === i ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-sm bg-neutral-400/70" />
              {label}
            </button>
          ))}
      </div>

      {active !== null && (
        <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm font-mono-plex">
          {years.map((year) => {
            const p = monthlyAverages.find((x) => x.year === year && x.month === active);
            if (!p) return null;
            return (
              <span key={year} className="text-neutral-400">
                {year}: <span className="font-semibold text-neutral-100">{formatNumber(p.avg)}</span>
              </span>
            );
          })}
          <span className="text-neutral-500">({monthLong(active)})</span>
        </div>
      )}
    </div>
  );
}
