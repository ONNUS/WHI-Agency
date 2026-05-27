import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchUser, createUser, patchUser, type UserPublic } from '../services/api';
import Toast from '../components/Toast';

export default function StaffFormPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('analyst');
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isNew || !id) return;
    fetchUser(id)
      .then((u: UserPublic) => {
        setName(u.name);
        setUsername(u.username);
        setEmail(u.email ?? '');
        setRole(u.role);
        setIsActive(u.isActive);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isNew) {
        if (!password) { setError('Password is required for new staff.'); setSaving(false); return; }
        await createUser({ username, name, email: email || undefined, password, role });
        navigate('/admin/staff');
      } else {
        const patch: Record<string, unknown> = { name, email: email || undefined, role, isActive };
        if (password) patch.password = password;
        await patchUser(id!, patch as any);
        setToast({ message: 'Staff updated.', type: 'success' });
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-stone-500 font-mono text-xs animate-pulse">LOADING...</div>;

  return (
    <div className="p-6 max-w-xl">
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <Link to="/admin/staff" className="text-stone-500 font-mono text-xs tracking-wide hover:text-[#bc993c] transition-colors">
        ← BACK TO STAFF
      </Link>

      <h1 className="text-xl font-semibold text-[#e8e4da] mt-4 mb-6">
        {isNew ? 'New Operative' : 'Edit Operative'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-[#12151c] border border-[#1c1e26] rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] tracking-[0.2em] text-stone-500 uppercase mb-1.5">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full bg-[#0b0c0f] border border-[#1c1e26] rounded px-3 py-2 text-[#e8e4da] font-mono text-sm focus:outline-none focus:border-[#bc993c] transition-colors" />
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-[0.2em] text-stone-500 uppercase mb-1.5">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={!isNew}
              className="w-full bg-[#0b0c0f] border border-[#1c1e26] rounded px-3 py-2 text-[#e8e4da] font-mono text-sm focus:outline-none focus:border-[#bc993c] disabled:opacity-50 transition-colors" />
          </div>
        </div>

        <div>
          <label className="block font-mono text-[10px] tracking-[0.2em] text-stone-500 uppercase mb-1.5">Email (optional)</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#0b0c0f] border border-[#1c1e26] rounded px-3 py-2 text-[#e8e4da] font-mono text-sm focus:outline-none focus:border-[#bc993c] transition-colors" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] tracking-[0.2em] text-stone-500 uppercase mb-1.5">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#0b0c0f] border border-[#1c1e26] rounded px-3 py-2 text-[#e8e4da] font-mono text-sm focus:outline-none focus:border-[#bc993c] transition-colors">
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {!isNew && (
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                  className="accent-[#bc993c]" />
                <span className="font-mono text-xs text-stone-400">Active Account</span>
              </label>
            </div>
          )}
        </div>

        <div>
          <label className="block font-mono text-[10px] tracking-[0.2em] text-stone-500 uppercase mb-1.5">
            {isNew ? 'Password' : 'New Password (leave blank to keep current)'}
          </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            required={isNew} autoComplete="new-password"
            className="w-full bg-[#0b0c0f] border border-[#1c1e26] rounded px-3 py-2 text-[#e8e4da] font-mono text-sm focus:outline-none focus:border-[#bc993c] transition-colors" />
        </div>

        {error && <div className="text-[#b13b3f] font-mono text-xs">{error}</div>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="bg-[#bc993c] hover:bg-[#d4ad4a] disabled:opacity-50 text-[#0b0c0f] font-mono font-bold text-xs tracking-widest uppercase rounded px-5 py-2.5 transition-colors">
            {saving ? 'SAVING...' : isNew ? 'CREATE OPERATIVE' : 'SAVE CHANGES'}
          </button>
          <Link to="/admin/staff"
            className="font-mono text-xs text-stone-500 hover:text-[#e8e4da] border border-[#1c1e26] rounded px-4 py-2.5 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
