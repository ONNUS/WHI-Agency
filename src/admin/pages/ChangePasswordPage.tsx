import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/api';

export default function ChangePasswordPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (next !== confirm) {
      setError('New passwords do not match.');
      return;
    }
    if (next.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await changePassword(current, next);
      // Patch the user in context to clear requirePasswordChange
      setUser((u) => u ? { ...u, requirePasswordChange: false } : u);
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-[#bc993c] font-mono text-xs tracking-[0.3em] uppercase font-bold mb-1">
            Security Protocol
          </div>
          <div className="text-[#e8e4da] text-xl font-semibold">Update Credentials</div>
          <div className="text-stone-500 text-sm mt-1 font-mono">
            First-login password change required.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#12151c] border border-[#1c1e26] rounded-lg p-6 space-y-4">
          <div>
            <label className="block font-mono text-xs text-stone-400 tracking-widest uppercase mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full bg-[#0b0c0f] border border-[#1c1e26] rounded px-3 py-2 text-[#e8e4da] font-mono text-sm focus:outline-none focus:border-[#bc993c] transition-colors"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-stone-400 tracking-widest uppercase mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full bg-[#0b0c0f] border border-[#1c1e26] rounded px-3 py-2 text-[#e8e4da] font-mono text-sm focus:outline-none focus:border-[#bc993c] transition-colors"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-stone-400 tracking-widest uppercase mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full bg-[#0b0c0f] border border-[#1c1e26] rounded px-3 py-2 text-[#e8e4da] font-mono text-sm focus:outline-none focus:border-[#bc993c] transition-colors"
            />
          </div>

          {error && (
            <div className="text-[#b13b3f] font-mono text-xs tracking-wide">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#bc993c] hover:bg-[#d4ad4a] disabled:opacity-50 text-[#0b0c0f] font-mono font-bold text-sm tracking-widest uppercase rounded py-2.5 transition-colors"
          >
            {loading ? 'UPDATING...' : 'CONFIRM CHANGE'}
          </button>
        </form>
      </div>
    </div>
  );
}
