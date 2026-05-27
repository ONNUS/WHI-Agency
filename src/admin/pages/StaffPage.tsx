import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchUsers, type UserPublic } from '../services/api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function StaffPage() {
  const [users, setUsers] = useState<UserPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <div className="p-8 text-[#b13b3f] font-mono text-sm">{error}</div>;

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#e8e4da]">Staff</h1>
          <div className="text-stone-500 font-mono text-xs tracking-widest mt-0.5">
            OPERATIVE ACCOUNTS
          </div>
        </div>
        <Link
          to="/admin/staff/new"
          className="bg-[#bc993c]/20 hover:bg-[#bc993c]/30 border border-[#bc993c]/30 text-[#bc993c] font-mono text-xs tracking-widest px-4 py-2 rounded transition-colors"
        >
          + NEW OPERATIVE
        </Link>
      </div>

      <div className="bg-[#12151c] border border-[#1c1e26] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1c1e26]">
              {['Name', 'Username', 'Role', 'Status', 'Created', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-mono text-[10px] tracking-[0.2em] text-stone-500 uppercase">
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
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-stone-500 font-mono text-xs">
                  No staff accounts.
                </td>
              </tr>
            )}
            {!loading && users.map((u) => (
              <tr key={u.id} className="hover:bg-[#1c1e26] transition-colors">
                <td className="px-4 py-3 text-[#e8e4da] text-sm">{u.name}</td>
                <td className="px-4 py-3 text-stone-400 font-mono text-sm">{u.username}</td>
                <td className="px-4 py-3">
                  <span className={`font-mono text-xs uppercase tracking-wide ${u.role === 'admin' ? 'text-[#bc993c]' : 'text-stone-400'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`font-mono text-xs ${u.isActive ? 'text-[#308c5f]' : 'text-[#b13b3f]'}`}>
                    {u.isActive ? '● Active' : '● Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-500 font-mono text-xs">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/admin/staff/${u.id}`}
                    className="text-[#bc993c] font-mono text-xs hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
