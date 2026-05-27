import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminOnlyRoute() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 text-center">
        <div className="text-red-400 font-mono text-sm tracking-widest mb-3">ACCESS DENIED</div>
        <div className="text-[#e8e4da] text-lg font-semibold mb-1">403 — Insufficient Clearance</div>
        <div className="text-stone-500 text-sm">This area requires Admin-level authorization.</div>
        <button
          onClick={() => window.history.back()}
          className="mt-6 text-[#bc993c] font-mono text-xs tracking-wider underline"
        >
          ← RETURN TO PREVIOUS SCREEN
        </button>
      </div>
    );
  }

  return <Outlet />;
}
