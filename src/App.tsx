import { useEffect, useRef, useState } from 'react';
import { BarChart3, Box, Activity, Layers, TrendingUp, Info } from 'lucide-react';
import LineChart from '@/components/LineChart';
import BarChart from '@/components/BarChart';
import BoxChart from '@/components/BoxChart';
import { formatNumber, pageViews, rawCount, trimmedCount } from '@/data/stats';

function useInView() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

function Section({
  id,
  icon,
  step,
  title,
  description,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  step: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const { ref, inView } = useInView();
  return (
    <section id={id} ref={ref} className="scroll-mt-24">
      <div className={`rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 shadow-2xl shadow-black/40 transition-all duration-700 sm:p-8 ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              {icon}
            </div>
            <div>
              <div className="mb-1 text-xs font-medium uppercase tracking-widest text-cyan-400/80">{step}</div>
              <h2 className="text-xl font-bold text-neutral-50 sm:text-2xl">{title}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-400">{description}</p>
            </div>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

export default function App() {
  const [boxMode, setBoxMode] = useState<'year' | 'month'>('year');

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden border-b border-neutral-800">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)',
            backgroundSize: '48px 36px',
            maskImage: 'radial-gradient(ellipse 70% 80% at 50% 0%, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 50% 0%, black 30%, transparent 75%)',
          }}
        />
        <div className="relative mx-auto max-w-5xl px-5 pb-16 pt-20 text-center sm:pb-20 sm:pt-28">
          <div className="animate-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-1.5 text-xs font-medium tracking-wide text-cyan-300">
            <Activity className="h-3.5 w-3.5" />
            Pandas · Matplotlib · Seaborn — reimagined for the web
          </div>
          <h1 className="animate-fade-up text-4xl font-bold leading-tight tracking-tight text-neutral-50 sm:text-6xl" style={{ animationDelay: '80ms' }}>
            Page View Time Series
            <span className="block bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
              Visualizer
            </span>
          </h1>
          <p className="animate-fade-up mx-auto mt-5 max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg" style={{ animationDelay: '160ms' }}>
            Daily page views on the freeCodeCamp.org forum from 5/2016 to 12/2019 — visualized as a line chart,
            bar chart, and box plots to reveal yearly growth and monthly seasonality.
          </p>
          <div className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '240ms' }}>
            {[
              { label: 'Raw records', value: rawCount.toLocaleString() },
              { label: 'After cleaning', value: pageViews.length.toLocaleString() },
              { label: 'Trimmed (2.5% each tail)', value: trimmedCount.toLocaleString() },
              { label: 'Peak day', value: formatNumber(Math.max(...pageViews.map((d) => d.value))) },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-left">
                <div className="font-mono-plex text-lg font-semibold text-neutral-50">{s.value}</div>
                <div className="text-xs text-neutral-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-14">
        <Section
          id="line"
          icon={<TrendingUp className="h-5 w-5" />}
          step="Task 1 — Line Plot"
          title="Daily freeCodeCamp Forum Page Views 5/2016-12/2019"
          description='Data imported with the date as the index, then filtered to drop days in the top and bottom 2.5% of page views. Hover the line to inspect any single day.'
        >
          <LineChart data={pageViews} />
        </Section>

        <Section
          id="bar"
          icon={<BarChart3 className="h-5 w-5" />}
          step="Task 2 — Bar Plot"
          title="Average daily page views, grouped by year"
          description='Average page views for each month, grouped by year. Hover a month in the legend or the bars themselves to compare that month across all years.'
        >
          <BarChart />
        </Section>

        <Section
          id="box"
          icon={<Box className="h-5 w-5" />}
          step="Task 3 — Box Plots"
          title="Year-wise Box Plot (Trend) · Month-wise Box Plot (Seasonality)"
          description='Two adjacent box plots showing how page views are distributed within a given year or month — and how the distributions compare over time. Hover a box for its five-number summary.'
        >
          <div className="mb-6 inline-flex rounded-xl border border-neutral-800 bg-neutral-950/60 p-1">
            <button
              type="button"
              onClick={() => setBoxMode('year')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                boxMode === 'year' ? 'bg-cyan-400/15 text-cyan-300' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="h-4 w-4" />
              Year-wise (Trend)
            </button>
            <button
              type="button"
              onClick={() => setBoxMode('month')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                boxMode === 'month' ? 'bg-emerald-400/15 text-emerald-300' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Box className="h-4 w-4" />
              Month-wise (Seasonality)
            </button>
          </div>
          <BoxChart key={boxMode} mode={boxMode} />
        </Section>

        <div className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 px-5 py-4 text-sm text-neutral-400">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
          <p>
            This page recreates the freeCodeCamp "Page View Time Series Visualizer" project in the browser: the same
            cleaning rule (trim days in the top and bottom 2.5% of views), the same three required charts, and the same
            axis titles. Every value is computed live from the source dataset.
          </p>
        </div>
      </main>

      <footer className="border-t border-neutral-800 py-8 text-center text-sm text-neutral-600">
        Data: freeCodeCamp.org forum page views · 2016-05-09 to 2019-12-03
      </footer>
    </div>
  );
}
