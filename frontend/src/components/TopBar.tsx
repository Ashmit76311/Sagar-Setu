import { Bell, LogOut, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview & analytics' },
  '/forecast': { title: 'Freight Rate Forecast', subtitle: 'AI-powered predictions' },
  '/cargo-orders': { title: 'Cargo Orders', subtitle: 'Manage shipments' },
  '/optimizer': { title: 'Procurement Optimizer', subtitle: 'Cost minimization' },
  '/scenario-simulator': { title: 'Scenario Simulator', subtitle: 'What-if analysis' },
  '/contracts': { title: 'Charter Contracts', subtitle: 'Contract lifecycle' },
  '/alerts': { title: 'Alerts & Notifications', subtitle: 'Rate & risk alerts' },
  '/admin': { title: 'Admin Panel', subtitle: 'System management' },
};

export default function TopBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'Sagar Setu', subtitle: '' };

  const roleLabels: Record<string, string> = {
    admin: 'Administrator',
    chartering_officer: 'Chartering Officer',
    procurement_planner: 'Procurement Planner',
    viewer: 'Ministry Analyst',
  };

  const roleColors: Record<string, string> = {
    admin: '#D64545',
    chartering_officer: '#0B3D5C',
    procurement_planner: '#1E8E6E',
    viewer: '#4A6572',
  };

  const avatarColor = roleColors[user?.role || ''] || '#4A6572';

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b border-[#E2E6EA] sticky top-0 z-30">
      {/* Left: Page title */}
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-lg font-bold leading-tight" style={{ color: '#1A2332' }}>
            {pageInfo.title}
          </h2>
          <p className="text-[11px] font-medium" style={{ color: '#8A96A4' }}>{pageInfo.subtitle}</p>
        </div>
      </div>

      {/* Right: Search + Alerts + Profile */}
      <div className="flex items-center gap-2">
        {/* Alert Bell */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2.5 rounded-xl transition-all duration-200 hover:bg-[#F7F8FA] group"
        >
          <Bell className="w-5 h-5 transition-colors group-hover:text-[#0B3D5C]" style={{ color: '#8A96A4' }} />
          <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold text-white rounded-full shadow-sm"
                style={{ backgroundColor: '#D64545', minWidth: '18px', height: '18px' }}>
            3
          </span>
        </button>

        {/* Divider */}
        <div className="w-px h-8 mx-1" style={{ backgroundColor: '#E2E6EA' }} />

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-200 hover:bg-[#F7F8FA]"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
              style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}dd)` }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold leading-tight" style={{ color: '#1A2332' }}>
                {user?.name}
              </p>
              <p className="text-[11px] font-medium" style={{ color: '#8A96A4' }}>
                {roleLabels[user?.role || ''] || user?.role}
              </p>
            </div>
          </button>

          {showProfile && (
            <>
              {/* Backdrop to close */}
              <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 top-14 w-52 rounded-xl shadow-xl border py-2 z-50 animate-fade-in bg-white/95 backdrop-blur-md"
                   style={{ borderColor: '#E2E6EA' }}>
                <div className="px-4 py-2.5 border-b border-[#F0F2F4]">
                  <p className="text-xs font-semibold" style={{ color: '#8A96A4' }}>Signed in as</p>
                  <p className="text-sm font-bold truncate" style={{ color: '#1A2332' }}>{user?.email}</p>
                </div>
                <button
                  onClick={() => { logout(); navigate('/login'); setShowProfile(false); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium hover:bg-red-50 transition-colors mt-1"
                  style={{ color: '#D64545' }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
