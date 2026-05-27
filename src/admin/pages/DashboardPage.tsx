import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStats, type AdminStats } from '../services/api';
import ScoreBadge from '../components/ScoreBadge';

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[#12151c] border border-[#1c1e26] rounded-lg p-5">
      <div className="font-mono text-[10px] tracking-[0.2em] text-stone-500 uppercase mb-2">{label}</div>
      <div className="text-2xl font-bold text-[#e8e4da] tabular-nums">{value}</div>
      {sub && <div className="text-stone-500 text-xs mt-0.5">{sub}</div>}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  new: 'text-[#bc993c]',
  under_review: 'text-blue-400',
  briefing_scheduled: 'text-purple-400',
  qualified: 'text-[#308c5f]',
  dna_sold: 'text-emerald-300',
  disqualified: 'text-[#b13b3f]',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { document.title = 'Dashboard | WHI Agency'; return () => { document.title = 'WHI Agency'; }; }, []);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="p-8 text-[#b13b3f] font-mono text-sm">
        Failed to load dashboard: {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#e8e4da]">Dashboard</h1>
        <div className="text-stone-500 font-mono text-xs tracking-widest mt-0.5">
          OPERATIONAL OVERVIEW
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Recon Briefings"
          value={stats?.briefingCount ?? '—'}
          sub={stats ? `Avg Score: ${stats.avgScore}` : undefined}
        />
        <StatCard
          label="Prospects"
          value={stats?.prospectCount ?? '—'}
          sub={stats ? `${stats.newProspectCount} new` : undefined}
        />
        <StatCard
          label="Avg Readiness Score"
          value={stats?.avgScore ?? '—'}
          sub="Across all briefings"
        />
        <StatCard
          label="Active Operatives"
          value={stats?.activeStaffCount ?? '—'}
          sub="Staff accounts"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Briefings */}
        <section className="bg-[#12151c] border border-[#1c1e26] rounded-lg">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1c1e26]">
            <span className="font-mono text-xs tracking-widest text-stone-400 uppercase">
              Recent Briefings
            </span>
            <Link to="/admin/briefings" className="text-[#bc993c] font-mono text-xs tracking-wide hover:underline">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-[#1c1e26]">
            {!stats && (
              <div className="px-5 py-4 text-stone-500 font-mono text-xs animate-pulse">Loading...</div>
            )}
            {stats?.recentBriefings.length === 0 && (
              <div className="px-5 py-4 text-stone-500 font-mono text-xs">No briefings yet.</div>
            )}
            {stats?.recentBriefings.map((b) => (
              <Link
                key={b.id}
                to={`/admin/briefings/${b.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-[#1c1e26] transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-[#e8e4da] text-sm truncate">{b.businessName}</div>
                  <div className="text-stone-500 font-mono text-xs mt-0.5">{b.industry} · {formatDate(b.submittedAt)}</div>
                </div>
                <ScoreBadge score={b.overallScore} size="sm" />
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Prospects */}
        <section className="bg-[#12151c] border border-[#1c1e26] rounded-lg">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1c1e26]">
            <span className="font-mono text-xs tracking-widest text-stone-400 uppercase">
              Recent Prospects
            </span>
            <Link to="/admin/prospects" className="text-[#bc993c] font-mono text-xs tracking-wide hover:underline">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-[#1c1e26]">
            {!stats && (
              <div className="px-5 py-4 text-stone-500 font-mono text-xs animate-pulse">Loading...</div>
            )}
            {stats?.recentProspects.length === 0 && (
              <div className="px-5 py-4 text-stone-500 font-mono text-xs">No prospects yet.</div>
            )}
            {stats?.recentProspects.map((p) => (
              <Link
                key={p.id}
                to={`/admin/prospects/${p.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-[#1c1e26] transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-[#e8e4da] text-sm truncate">{p.name}</div>
                  <div className="text-stone-500 font-mono text-xs mt-0.5 truncate">{p.email}</div>
                </div>
                <span className={`font-mono text-xs uppercase tracking-wide ${STATUS_COLORS[p.status] ?? 'text-stone-400'}`}>
                  {p.status.replace('_', ' ')}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
