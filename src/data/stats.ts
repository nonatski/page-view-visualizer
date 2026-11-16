import raw from './pageviews.csv?raw';

export interface DayRecord {
  date: Date;
  value: number;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function parseCsv(): DayRecord[] {
  const lines = raw.trim().split('\n');
  const records: DayRecord[] = [];
  for (const line of lines.slice(1)) {
    const comma = line.indexOf(',');
    const dateStr = line.slice(0, comma);
    const value = Number(line.slice(comma + 1));
    if (!dateStr || !Number.isFinite(value)) continue;
    const [y, m, d] = dateStr.split('-').map(Number);
    records.push({ date: new Date(Date.UTC(y, m - 1, d)), value });
  }
  return records;
}

export const pageViews: DayRecord[] = parseCsv();

export const rawCount = 1304;
export const trimmedCount = rawCount - pageViews.length;

export function monthShort(month: number): string {
  return MONTHS_SHORT[month];
}

export function monthLong(month: number): string {
  return MONTHS_LONG[month];
}

export interface YearMonthPoint {
  year: number;
  month: number;
  avg: number;
}

export const monthlyAverages: YearMonthPoint[] = (() => {
  const buckets = new Map<string, { sum: number; n: number }>();
  for (const { date, value } of pageViews) {
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    const b = buckets.get(key) ?? { sum: 0, n: 0 };
    b.sum += value;
    b.n += 1;
    buckets.set(key, b);
  }
  return [...buckets.entries()]
    .map(([key, b]) => {
      const [year, month] = key.split('-').map(Number);
      return { year, month, avg: b.sum / b.n };
    })
    .sort((a, b) => a.year - b.year || a.month - b.month);
})();

export const years: number[] = [...new Set(monthlyAverages.map((p) => p.year))];

export interface BoxStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
}

export function boxStats(values: number[]): BoxStats {
  const sorted = [...values].sort((a, b) => a - b);
  const q = (p: number) => {
    const idx = (sorted.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  };
  const sum = values.reduce((acc, v) => acc + v, 0);
  return {
    min: sorted[0],
    q1: q(0.25),
    median: q(0.5),
    q3: q(0.75),
    max: sorted[sorted.length - 1],
    mean: sum / values.length,
  };
}

export const yearBoxes: { year: number; stats: BoxStats }[] = years.map((year) => ({
  year,
  stats: boxStats(pageViews.filter((r) => r.date.getUTCFullYear() === year).map((r) => r.value)),
}));

export const monthBoxes: { month: number; stats: BoxStats }[] = MONTHS_SHORT.map((_, month) => ({
  month,
  stats: boxStats(pageViews.filter((r) => r.date.getUTCMonth() === month).map((r) => r.value)),
}));

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

export function formatK(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `${Math.round(n)}`;
}
