import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchBriefing, deleteBriefing, type Briefing } from '../services/api';
import ScoreBadge from '../components/ScoreBadge';
import { useAuth } from '../context/AuthContext';

const PILLAR_LABELS: Record<string, string> = {
  blue: 'BLUE FORCE',
  red: 'RED FORCE',
  green: 'GREEN FORCE',
  battlespace: 'BATTLESPACE',
  gap: 'STRATEGIC GAP',
};

const ANSWER_LABELS: Array<{ key: keyof Briefing; label: string }> = [
  { key: 'blueForceAnswers', label: 'BLUE FORCE — Capabilities & Talent' },
  { key: 'redForceAnswers', label: 'RED FORCE — Competitive Position' },
  { key: 'greenForceAnswers', label: 'GREEN FORCE — Scalability & Fulfillment' },
  { key: 'battlespaceAnswers', label: 'BATTLESPACE — AI & Tech Infrastructure' },
  { key: 'gapAnswers', label: 'STRATEGIC GAP — Margins & Cash Velocity' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export default function BriefingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { document.title = 'Briefing Detail | WHI Agency'; return () => { document.title = 'WHI Agency'; }; }, []);
  const [rawOpen, setRawOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchBriefing(id)
      .then(setBriefing)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!briefing || !window.confirm(`Delete briefing for "${briefing.businessName}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteBriefing(briefing.id);
      navigate('/admin/briefings');
    } catch (e: any) {
      setError(e.message);
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-8 text-stone-500 font-mono text-xs animate-pulse">LOADING BRIEF...</div>;
  if (error) return <div className="p-8 text-[#b13b3f] font-mono text-sm">{error}</div>;
  if (!briefing) return null;

  return (
    <div className="p-6 max-w-4xl">
      {/* Back */}
      <Link to="/admin/briefings" className="text-stone-500 font-mono text-xs tracking-wide hover:text-[#bc993c] transition-colors">
        ← BACK TO BRIEFINGS
      </Link>

      {/* Header */}
      <div className="mt-4 mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#e8e4da]">{briefing.businessName}</h1>
          <div className="text-stone-500 font-mono text-xs mt-0.5">
            {briefing.industry} · {briefing.location} · {formatDate(briefing.submittedAt)}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <ScoreBadge score={briefing.overallScore} size="lg" />
            <span className={`font-mono text-xs ${briefing.isGeminiLive ? 'text-[#308c5f]' : 'text-stone-500'}`}>
              {briefing.isGeminiLive ? '✦ GEMINI LIVE' : 'FALLBACK ANALYSIS'}
            </span>
          </div>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-[#b13b3f] border border-[#b13b3f]/30 font-mono text-xs tracking-wide px-3 py-1.5 rounded hover:bg-[#b13b3f]/10 disabled:opacity-40 transition-colors"
          >
            {deleting ? 'DELETING...' : 'DELETE BRIEF'}
          </button>
        )}
      </div>

      {/* Pillar Scores */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {Object.entries(briefing.scores).map(([key, val]) => (
          <div key={key} className="bg-[#12151c] border border-[#1c1e26] rounded-lg p-3 text-center">
            <div className="font-mono text-[9px] tracking-[0.15em] text-stone-500 uppercase mb-1.5">
              {PILLAR_LABELS[key]}
            </div>
          <ScoreBadge score={val as number} size="md" />
          </div>
        ))}
      </div>

      {/* Executive Summary */}
      <section className="bg-[#12151c] border border-[#1c1e26] rounded-lg p-5 mb-4">
        <div className="font-mono text-[10px] tracking-[0.2em] text-[#bc993c] uppercase mb-2">
          Executive Summary
        </div>
        <p className="text-[#e8e4da] text-sm leading-relaxed">{briefing.executiveSummary}</p>
      </section>

      {/* Critical Vulnerability */}
      <section className="bg-[#12151c] border border-[#b13b3f]/20 rounded-lg p-5 mb-4">
        <div className="font-mono text-[10px] tracking-[0.2em] text-[#b13b3f] uppercase mb-2">
          Critical Vulnerability
        </div>
        <p className="text-[#e8e4da] text-sm leading-relaxed">{briefing.criticalVulnerability}</p>
      </section>

      {/* Asymmetric Leverage */}
      <section className="bg-[#12151c] border border-[#308c5f]/20 rounded-lg p-5 mb-4">
        <div className="font-mono text-[10px] tracking-[0.2em] text-[#308c5f] uppercase mb-2">
          Asymmetric Leverage
        </div>
        <p className="text-[#e8e4da] text-sm leading-relaxed">{briefing.asymmetricLeverage}</p>
      </section>

      {/* 90-Day Combat Plan */}
      <section className="bg-[#12151c] border border-[#1c1e26] rounded-lg p-5 mb-4">
        <div className="font-mono text-[10px] tracking-[0.2em] text-[#bc993c] uppercase mb-4">
          90-Day Combat Plan
        </div>
        <div className="space-y-3">
          {[
            { label: 'Phase 1 · Days 1–30 · Immediate Hardening', text: briefing.combatPlan90Days.phase1 },
            { label: 'Phase 2 · Days 31–60 · Operational Alignment', text: briefing.combatPlan90Days.phase2 },
            { label: 'Phase 3 · Days 61–90 · Velocity Generation', text: briefing.combatPlan90Days.phase3 },
          ].map(({ label, text }) => (
            <div key={label}>
              <div className="font-mono text-[10px] tracking-wide text-stone-500 uppercase mb-1">{label}</div>
              <p className="text-[#e8e4da] text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Raw Answers — collapsible */}
      <section className="bg-[#12151c] border border-[#1c1e26] rounded-lg overflow-hidden mb-4">
        <button
          onClick={() => setRawOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-[#1c1e26] transition-colors"
        >
          <span className="font-mono text-[10px] tracking-[0.2em] text-stone-400 uppercase">
            Raw Survey Answers
          </span>
          <span className="text-stone-500 font-mono text-xs">{rawOpen ? '▲' : '▼'}</span>
        </button>
        {rawOpen && (
          <div className="border-t border-[#1c1e26] p-5 space-y-4">
            {ANSWER_LABELS.map(({ key, label }) => (
              <div key={key}>
                <div className="font-mono text-[10px] tracking-widest text-stone-500 uppercase mb-1">{label}</div>
                <p className="text-[#e8e4da] text-sm leading-relaxed whitespace-pre-wrap">
                  {(briefing[key] as string) || <span className="text-stone-600 italic">No response provided.</span>}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Linked Prospect */}
      {briefing.prospectId && (
        <div className="text-stone-400 font-mono text-xs">
          Linked Prospect:{' '}
          <Link to={`/admin/prospects/${briefing.prospectId}`} className="text-[#bc993c] hover:underline">
            {briefing.prospectId}
          </Link>
        </div>
      )}
    </div>
  );
}
