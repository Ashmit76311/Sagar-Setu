import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, TrendingUp, Package,
  CalendarClock, SlidersHorizontal, FileText,
  Bell, Shield, ChevronLeft, ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: null },
  { path: '/forecast', label: 'Forecast', icon: TrendingUp, roles: null },
  { path: '/cargo-orders', label: 'Cargo Orders', icon: Package, roles: null },
  { path: '/optimizer', label: 'Optimizer', icon: CalendarClock, roles: ['admin', 'procurement_planner'] },
  { path: '/scenario-simulator', label: 'Simulator', icon: SlidersHorizontal, roles: null },
  { path: '/contracts', label: 'Contracts', icon: FileText, roles: null },
  { path: '/alerts', label: 'Alerts', icon: Bell, roles: null },
  { path: '/admin', label: 'Admin', icon: Shield, roles: ['admin'] },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const filteredItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
      style={{
        background: 'linear-gradient(180deg, #082D44 0%, #0B3D5C 50%, #0E4D73 100%)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-white shadow-md">
          <img src="/logo.png" alt="Sagar Setu" className="w-full h-full object-cover" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-white font-bold text-base tracking-tight leading-tight">Sagar Setu</h1>
            <p className="text-[10px] leading-tight font-medium" style={{ color: 'rgba(232,236,240,0.4)' }}>
              Freight Intelligence
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                    isActive ? 'text-white' : 'hover:bg-white/8'
                  }`}
                  style={isActive ? {
                    backgroundColor: 'rgba(30, 142, 110, 0.2)',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(30, 142, 110, 0.15)',
                  } : { color: 'rgba(232, 236, 240, 0.65)' }}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#1E8E6E]" />
                  )}
                  <item.icon className={`w-[18px] h-[18px] shrink-0 transition-all duration-200 ${
                    isActive ? 'text-[#1E8E6E]' : 'group-hover:text-white/90'
                  }`} />
                  {!collapsed && (
                    <span className={`transition-colors duration-200 ${isActive ? 'font-semibold' : 'group-hover:text-white/90'}`}>
                      {item.label}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-white/10 transition-all duration-200 hover:bg-white/5"
        style={{ color: 'rgba(232,236,240,0.4)' }}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
