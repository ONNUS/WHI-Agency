import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProspect, patchProspect, type Prospect, type ProspectStatus } from '../services/api';
import Toast from '../components/Toast';

const STATUSES: Array<{ value: ProspectStatus; label: string }> = [
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
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function ProspectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Editable fields
  const [status, setStatus] = useState<ProspectStatus>('new');
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchProspect(id)
      .then((p) => {
        setProspect(p);
        setStatus(p.status);
        setNotes(p.notes ?? '');
        setAssignedTo(p.assignedTo ?? '');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!prospect) return;
    setSaving(true);
    try {
      const updated = await patchProspect(prospect.id, {
        status,
        notes,
        assignedTo: assignedTo.trim() || undefined,
      });
      setProspect(updated);
      setToast({ message: 'Prospect updated.', type: 'success' });
    } catch (e: any) {
      setToast({ message: e.message || 'Update failed.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-stone-500 font-mono text-xs animate-pulse">LOADING...</div>;
  if (error) return <div className="p-8 text-[#b13b3f] font-mono text-sm">{error}</div>;
  if (!prospect) return null;

  return (
    <div className="p-6 max-w-3xl">
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <Link to="/admin/prospects" className="text-stone-500 font-mono text-xs tracking-wide hover:text-[#bc993c] transition-colors">
        ← BACK TO PROSPECTS
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-xl font-semibold text-[#e8e4da]">{prospect.name}</h1>
        <div className="text-stone-500 font-mono text-xs mt-0.5">Added {formatDate(prospect.createdAt)}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Contact Info */}
        <div className="bg-[#12151c] border border-[#1c1e26] rounded-lg p-5">
          <div className="font-mono text-[10px] tracking-[0.2em] text-stone-500 uppercase mb-3">Contact Info</div>
          <div className="space-y-2">
            <div>
              <span className="text-stone-500 text-xs">Email: </span>
              <a href={`mailto:${prospect.email}`} className="text-[#bc993c] text-sm hover:underline">
                {prospect.email}
              </a>
            </div>
            {prospect.phone && (
              <div>
                <span className="text-stone-500 text-xs">Phone: </span>
                <span className="text-[#e8e4da] text-sm">{prospect.phone}</span>
              </div>
            )}
            {prospect.briefingId && (
              <div>
                <span className="text-stone-500 text-xs">Linked Brief: </span>
                <Link to={`/admin/briefings/${prospect.briefingId}`} className="text-[#bc993c] text-sm hover:underline">
                  View Recon Brief →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Status & Assignment */}
        <div className="bg-[#12151c] border border-[#1c1e26] rounded-lg p-5 space-y-4">
          <div>
            <label className="block font-mono text-[10px] tracking-[0.2em] text-stone-500 uppercase mb-1.5">
              Pipeline Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProspectStatus)}
              className="w-full bg-[#0b0c0f] border border-[#1c1e26] rounded px-3 py-2 text-[#e8e4da] font-mono text-sm focus:outline-none focus:border-[#bc993c] transition-colors"
            >
              {STATUSES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <div className={`mt-1 font-mono text-xs uppercase tracking-wide ${STATUS_COLORS[status] ?? 'text-stone-400'}`}>
              ● {status.replace(/_/g, ' ')}
            </div>
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-[0.2em] text-stone-500 uppercase mb-1.5">
              Assigned Operative
            </label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Username or name..."
              className="w-full bg-[#0b0c0f] border border-[#1c1e26] rounded px-3 py-2 text-[#e8e4da] font-mono text-sm focus:outline-none focus:border-[#bc993c] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-[#12151c] border border-[#1c1e26] rounded-lg p-5 mb-4">
        <label className="block font-mono text-[10px] tracking-[0.2em] text-stone-500 uppercase mb-2">
          Operative Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          placeholder="Internal notes, follow-up details, observations..."
          className="w-full bg-[#0b0c0f] border border-[#1c1e26] rounded px-3 py-2 text-[#e8e4da] font-mono text-sm focus:outline-none focus:border-[#bc993c] transition-colors resize-y"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#bc993c] hover:bg-[#d4ad4a] disabled:opacity-50 text-[#0b0c0f] font-mono font-bold text-xs tracking-widest uppercase rounded px-5 py-2.5 transition-colors"
        >
          {saving ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </div>
    </div>
  );
}
