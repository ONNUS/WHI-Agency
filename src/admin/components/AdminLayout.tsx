import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, UserCog, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/briefings', icon: FileText, label: 'Recon Briefings' },
  { to: '/admin/prospects', icon: Users, label: 'Prospects' },
];

const adminItems = [
  { to: '/admin/staff', icon: UserCog, label: 'Staff' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-[#0b0c0f] text-[#e8e4da]">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-[#1c1e26] flex flex-col">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-[#1c1e26]">
          <div className="text-[#bc993c] font-mono text-xs tracking-[0.2em] uppercase font-bold">
            WHI AGENCY
          </div>
          <div className="text-stone-500 font-mono text-[10px] tracking-widest mt-0.5">
            COMMAND CENTER
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded text-sm font-mono tracking-wide transition-colors ${
                  isActive
                    ? 'bg-[#bc993c]/15 text-[#bc993c]'
                    : 'text-stone-400 hover:text-[#e8e4da] hover:bg-[#1c1e26]'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="pt-3 pb-1 px-3 text-[10px] font-mono tracking-[0.2em] text-stone-600 uppercase">
                Admin
              </div>
              {adminItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded text-sm font-mono tracking-wide transition-colors ${
                      isActive
                        ? 'bg-[#bc993c]/15 text-[#bc993c]'
                        : 'text-stone-400 hover:text-[#e8e4da] hover:bg-[#1c1e26]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="border-t border-[#1c1e26] p-4">
          <div className="text-xs font-mono text-stone-400 mb-0.5 truncate">{user?.username}</div>
          <div className="text-[10px] text-stone-600 uppercase tracking-widest mb-2">
            {user?.role}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#b13b3f] font-mono tracking-wide transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
