'use client';

import { useEffect, useMemo, useState } from 'react';

type TopMover = {
  stockSymbol: string;
  companyName: string;
  closingPrice: number;
  percentChange: number;
  amount?: number;
  asOfDateString?: string;
};

const fmt = new Intl.NumberFormat();
const fmtMoney = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
const fmtPct = (v?: number) =>
  typeof v === 'number' && !Number.isNaN(v) ? `${v.toFixed(2)}%` : '-';

export default function Home() {
  const [indicator, setIndicator] = useState<'gainers' | 'losers'>('gainers');
  const [sectorCode, setSectorCode] = useState<string>(''); // keep blank to match API
  const [items, setItems] = useState<TopMover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        indicator,
        sectorCode, // may be empty string
      });
      const res = await fetch(`/api/nepalipaisa/top-movers?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setItems(data.items ?? []);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indicator, sectorCode]);

  const kpis = useMemo(() => {
    const count = items.length;
    const avgPct =
      count > 0
        ? items.reduce((acc, i) => acc + (i.percentChange ?? 0), 0) / count
        : 0;
    const totalAmt = items.reduce((acc, i) => acc + (i.amount ?? 0), 0);
    return { count, avgPct, totalAmt };
  }, [items]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Market Movers
            </h1>
            <p className="text-sm text-neutral-400">
              Live snapshot of {indicator} from Manoj Khadka Mind. let build growth.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="rounded-xl border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800 active:scale-[0.99]"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <div className="inline-flex rounded-2xl border border-neutral-800 p-1">
            {(['gainers', 'losers'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setIndicator(key)}
                className={`px-4 py-2 text-sm rounded-xl transition
                  ${indicator === key ? 'bg-green-600/20 text-green-400 border border-green-700' : 'text-neutral-300 hover:bg-neutral-900'}`}
              >
                {key[0].toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              value={sectorCode}
              onChange={(e) => setSectorCode(e.target.value)}
              placeholder="Sector code (optional)"
              className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-green-700"
            />
          </div>

          <div className="ml-auto text-xs text-neutral-400">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : '—'}
          </div>
        </div>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <KpiCard label="Symbols" value={kpis.count.toString()} />
          <KpiCard
            label="Avg % Change"
            value={fmtPct(kpis.avgPct)}
            accent={kpis.avgPct >= 0 ? 'up' : 'down'}
          />
          <KpiCard
            label="Turnover (Amt)"
            value={kpis.totalAmt ? `Rs ${fmtMoney.format(kpis.totalAmt)}` : '-'}
          />
        </section>

        {/* Table / Loader / Error */}
        {error && (
          <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-300 mb-4">
            Error: {error}
          </div>
        )}

        {loading ? (
          <SkeletonTable />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-neutral-800">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-900/40">
                <tr className="text-left">
                  <Th>Symbol</Th>
                  <Th>Company</Th>
                  <Th className="text-right">Close</Th>
                  <Th className="text-right">% Change</Th>
                  <Th className="text-right">Amount</Th>
                  <Th>As of</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr
                    key={s.stockSymbol}
                    className="border-t border-neutral-800 hover:bg-neutral-900/30"
                  >
                    <Td>
                      <span className="font-semibold">{s.stockSymbol}</span>
                    </Td>
                    <Td className="max-w-[300px] truncate">{s.companyName}</Td>
                    <Td className="text-right">
                      {s.closingPrice ? fmtMoney.format(s.closingPrice) : '-'}
                    </Td>
                    <Td className="text-right">
                      <span
                        className={`inline-flex items-center justify-end gap-1 rounded-lg px-2 py-1
                          ${badgeTone(s.percentChange)}`}
                      >
                        {fmtPct(s.percentChange)}
                      </span>
                    </Td>
                    <Td className="text-right">
                      {typeof s.amount === 'number'
                        ? fmt.format(s.amount)
                        : '-'}
                    </Td>
                    <Td>{s.asOfDateString ?? '-'}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------- UI bits ---------- */

function Th({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={`px-4 py-3 font-medium text-neutral-300 ${className}`}>
      {children}
    </th>
  );
}
function Td({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function badgeTone(pct?: number) {
  if (typeof pct !== 'number' || Number.isNaN(pct)) return 'bg-neutral-800 text-neutral-300';
  if (pct > 0) return 'bg-green-700/20 text-green-400 border border-green-800';
  if (pct < 0) return 'bg-red-700/20 text-red-400 border border-red-800';
  return 'bg-neutral-800 text-neutral-300';
}

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'up' | 'down';
}) {
  const ring =
    accent === 'up'
      ? 'ring-1 ring-green-800/60 bg-gradient-to-b from-green-900/20 to-transparent'
      : accent === 'down'
      ? 'ring-1 ring-red-800/60 bg-gradient-to-b from-red-900/20 to-transparent'
      : 'ring-1 ring-neutral-800/60 bg-gradient-to-b from-neutral-900/20 to-transparent';

  return (
    <div className={`rounded-2xl border border-neutral-800 p-4 ${ring}`}>
      <div className="text-xs uppercase tracking-wide text-neutral-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800">
      <div className="animate-pulse divide-y divide-neutral-900">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4 px-4 py-3">
            {[...Array(6)].map((__, j) => (
              <div
                key={j}
                className="h-4 rounded bg-neutral-800"
                style={{ width: j === 1 ? '70%' : '40%' }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
