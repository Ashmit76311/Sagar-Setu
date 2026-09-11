import { Shield, Users, Database, Cpu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DEMO_USERS = [
  { name: 'Admin User', email: 'admin@sagarsetu.gov.in', role: 'admin', org: 'Ministry of Steel', active: true },
  { name: 'Chartering Officer', email: 'charter@sail.gov.in', role: 'chartering_officer', org: 'SAIL', active: true },
  { name: 'Procurement Planner', email: 'planner@sail.gov.in', role: 'procurement_planner', org: 'SAIL', active: true },
  { name: 'Ministry Viewer', email: 'viewer@steel.gov.in', role: 'viewer', org: 'Ministry of Steel', active: true },
];

const DATA_SOURCES = [
  { name: 'Freight Rate Index (BDI)', status: 'synced', lastSync: '2026-09-10 18:00 UTC' },
  { name: 'Vessel Position (AIS)', status: 'synced', lastSync: '2026-09-10 17:45 UTC' },
  { name: 'Bunker Prices', status: 'synced', lastSync: '2026-09-10 16:30 UTC' },
  { name: 'Port Congestion Data', status: 'error', lastSync: '2026-09-09 12:00 UTC' },
];

export default function Admin() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div className="animate-fade-in rounded-2xl p-16 text-center bg-white border border-[#E2E6EA]">
        <Shield className="w-12 h-12 mx-auto mb-4" style={{ color: '#D64545' }} />
        <p className="text-lg font-medium" style={{ color: '#1A2332' }}>Access Denied</p>
        <p className="text-sm mt-1" style={{ color: '#8A96A4' }}>Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Management */}
      <div className="animate-fade-in-up rounded-2xl p-6 bg-white border border-[#E2E6EA] hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" style={{ color: '#0B3D5C' }} />
          <h3 className="text-base font-semibold" style={{ color: '#1A2332' }}>User Management</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#F7F8FA' }}>
              {['Name', 'Email', 'Role', 'Organization', 'Status'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8A96A4' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEMO_USERS.map((u) => (
              <tr key={u.email} style={{ borderTop: '1px solid #F0F2F4' }}>
                <td className="px-4 py-3 text-sm font-medium" style={{ color: '#1A2332' }}>{u.name}</td>
                <td className="px-4 py-3 text-sm" style={{ color: '#5A6978' }}>{u.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full capitalize" style={{ color: '#0B3D5C', backgroundColor: 'rgba(11,61,92,0.08)' }}>
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: '#5A6978' }}>{u.org}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#1E8E6E' }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1E8E6E' }} /> Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Data Sources */}
      <div className="animate-fade-in-up rounded-2xl p-6 bg-white border border-[#E2E6EA] hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5" style={{ color: '#0B3D5C' }} />
          <h3 className="text-base font-semibold" style={{ color: '#1A2332' }}>Data Source Status</h3>
        </div>
        <div className="space-y-3">
          {DATA_SOURCES.map((ds) => (
            <div key={ds.name} className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{ backgroundColor: '#F7F8FA' }}>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ds.status === 'synced' ? '#1E8E6E' : '#D64545' }} />
                <span className="text-sm font-medium" style={{ color: '#1A2332' }}>{ds.name}</span>
              </div>
              <span className="text-xs" style={{ color: '#8A96A4' }}>Last sync: {ds.lastSync}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Model Config */}
      <div className="animate-fade-in-up rounded-2xl p-6 bg-white border border-[#E2E6EA] hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-5 h-5" style={{ color: '#0B3D5C' }} />
          <h3 className="text-base font-semibold" style={{ color: '#1A2332' }}>Forecast Model</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Model Version', value: 'ensemble_v1' },
            { label: 'MAPE (holdout)', value: '8.4%' },
            { label: 'Last Retrained', value: '2026-09-10' },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-lg" style={{ backgroundColor: '#F7F8FA' }}>
              <p className="text-xs mb-1" style={{ color: '#8A96A4' }}>{item.label}</p>
              <p className="text-sm font-semibold" style={{ color: '#1A2332' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
