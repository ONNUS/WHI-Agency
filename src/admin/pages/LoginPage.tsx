import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname ?? '/admin/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message === 'Invalid credentials.' ? 'Invalid credentials.' : 'Login failed. Check credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-[#bc993c] font-mono text-xs tracking-[0.3em] uppercase font-bold mb-1">
            WHI Agency
          </div>
          <div className="text-[#e8e4da] text-xl font-semibold">Command Center</div>
          <div className="text-stone-500 text-sm mt-1 font-mono">Operative Authentication Required</div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#12151c] border border-[#1c1e26] rounded-lg p-6 space-y-4">
          <div>
            <label className="block font-mono text-xs text-stone-400 tracking-widest uppercase mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full bg-[#0b0c0f] border border-[#1c1e26] rounded px-3 py-2 text-[#e8e4da] font-mono text-sm focus:outline-none focus:border-[#bc993c] transition-colors"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-stone-400 tracking-widest uppercase mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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
            {loading ? 'AUTHENTICATING...' : 'AUTHORIZE ACCESS'}
          </button>
        </form>

        <div className="mt-4 text-center text-stone-600 font-mono text-xs tracking-wide">
          WHI AGENCY · CLASSIFIED OPERATIONS
        </div>
      </div>
    </div>
  );
}
