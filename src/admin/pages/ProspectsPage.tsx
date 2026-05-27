import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProspects, type ProspectIndex, type ProspectStatus } from '../services/api';

const STATUSES: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'briefing_scheduled', label: 'Briefing Scheduled' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'dna_sold', label: 'DNA Sold' },
  { value: 'disqualified', label: 'Disqualified' },
];

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

export default function ProspectsPage() {
  const [items, setItems] = useState<ProspectIndex[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 15;

  useEffect(() => {
    setLoading(true);
    fetchProspects({ page, pageSize: PAGE_SIZE, search, status })
      .then((r) => { setItems(r.items); setTotal(r.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, status]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-[#e8e4da]">Prospects</h1>
          <div className="text-stone-500 font-mono text-xs tracking-widest mt-0.5">
            {total} TOTAL
          </div>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput); }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Search name, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-[#12151c] border border-[#1c1e26] rounded px-3 py-1.5 text-[#e8e4da] font-mono text-sm focus:outline-none focus:border-[#bc993c] w-48 transition-colors"
          />
          <button
            type="submit"
            className="bg-[#bc993c]/20 hover:bg-[#bc993c]/30 text-[#bc993c] font-mono text-xs tracking-widest px-3 py-1.5 rounded transition-colors"
          >
            SEARCH
          </button>
        </form>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 flex-wrap mb-4">
        {STATUSES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setStatus(value); setPage(1); }}
            className={`font-mono text-xs px-3 py-1 rounded transition-colors ${
              status === value
                ? 'bg-[#bc993c]/20 text-[#bc993c] border border-[#bc993c]/30'
                : 'text-stone-500 border border-[#1c1e26] hover:text-[#e8e4da] hover:border-stone-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-[#12151c] border border-[#1c1e26] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1c1e26]">
              {['Name', 'Email', 'Status', 'Assigned To', 'Date'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-mono text-[10px] tracking-[0.2em] text-stone-500 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c1e26]">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-stone-500 font-mono text-xs animate-pulse">
                  LOADING...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-stone-500 font-mono text-xs">
                  No prospects found.
                </td>
              </tr>
            )}
            {!loading && items.map((p) => (
              <tr key={p.id} className="hover:bg-[#1c1e26] transition-colors">
                <td className="px-4 py-3">
                  <Link to={`/admin/prospects/${p.id}`} className="text-[#e8e4da] hover:text-[#bc993c] text-sm transition-colors">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-stone-400 text-sm">{p.email}</td>
                <td className="px-4 py-3">
                  <span className={`font-mono text-xs uppercase tracking-wide ${STATUS_COLORS[p.status] ?? 'text-stone-400'}`}>
                    {p.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-500 text-sm">{p.assignedTo ?? '—'}</td>
                <td className="px-4 py-3 text-stone-500 font-mono text-xs">{formatDate(p.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-stone-500 font-mono text-xs">Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="font-mono text-xs px-3 py-1.5 border border-[#1c1e26] rounded text-stone-400 hover:text-[#e8e4da] disabled:opacity-40 transition-colors">
              ← Prev
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="font-mono text-xs px-3 py-1.5 border border-[#1c1e26] rounded text-stone-400 hover:text-[#e8e4da] disabled:opacity-40 transition-colors">
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
