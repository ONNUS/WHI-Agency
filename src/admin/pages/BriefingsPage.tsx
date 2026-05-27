import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchBriefings, type BriefingIndex } from '../services/api';
import ScoreBadge from '../components/ScoreBadge';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BriefingsPage() {
  const [items, setItems] = useState<BriefingIndex[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => { document.title = 'Recon Briefings | WHI Agency'; return () => { document.title = 'WHI Agency'; }; }, []);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 15;

  useEffect(() => {
    setLoading(true);
    fetchBriefings({ page, pageSize: PAGE_SIZE, search, sortBy: 'submittedAt', sortOrder: 'desc' })
      .then((r) => { setItems(r.items); setTotal(r.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#e8e4da]">Recon Briefings</h1>
          <div className="text-stone-500 font-mono text-xs tracking-widest mt-0.5">
            {total} TOTAL BRIEFS
          </div>
        </div>
        {/* Search */}
        <form
          onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput); }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Search business, industry..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-[#12151c] border border-[#1c1e26] rounded px-3 py-1.5 text-[#e8e4da] font-mono text-sm focus:outline-none focus:border-[#bc993c] w-56 transition-colors"
          />
          <button
            type="submit"
            className="bg-[#bc993c]/20 hover:bg-[#bc993c]/30 text-[#bc993c] font-mono text-xs tracking-widest px-3 py-1.5 rounded transition-colors"
          >
            SEARCH
          </button>
        </form>
      </div>

      <div className="bg-[#12151c] border border-[#1c1e26] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1c1e26]">
              {['Business', 'Industry', 'Location', 'Score', 'Date', 'AI'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-mono text-[10px] tracking-[0.2em] text-stone-500 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c1e26]">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-stone-500 font-mono text-xs animate-pulse">
                  LOADING...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-stone-500 font-mono text-xs">
                  No briefings found.
                </td>
              </tr>
            )}
            {!loading &&
              items.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-[#1c1e26] transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link to={`/admin/briefings/${b.id}`} className="text-[#e8e4da] hover:text-[#bc993c] text-sm transition-colors">
                      {b.businessName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-400 text-sm">{b.industry}</td>
                  <td className="px-4 py-3 text-stone-500 text-sm">{b.location || '—'}</td>
                  <td className="px-4 py-3">
                    <ScoreBadge score={b.overallScore} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-stone-500 font-mono text-xs">
                    {formatDate(b.submittedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-[10px] tracking-wide ${b.isGeminiLive ? 'text-[#308c5f]' : 'text-stone-600'}`}>
                      {b.isGeminiLive ? 'LIVE' : 'FALLBACK'}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-stone-500 font-mono text-xs">
            Page {page} of {totalPages} · {total} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="font-mono text-xs px-3 py-1.5 border border-[#1c1e26] rounded text-stone-400 hover:text-[#e8e4da] disabled:opacity-40 transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="font-mono text-xs px-3 py-1.5 border border-[#1c1e26] rounded text-stone-400 hover:text-[#e8e4da] disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
