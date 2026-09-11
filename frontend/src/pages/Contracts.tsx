import { useEffect, useState } from 'react';
import api from '../lib/api';

const CONTRACT_STEPS = ['draft', 'confirmed', 'laycan_active', 'loading', 'in_transit', 'discharged', 'completed'];

export default function Contracts() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/charter-contracts');
        setContracts(res.data);
      } catch {
        // Mock
        setContracts([
          { id: '1', charter_type: 'voyage', rate_agreed_usd_per_ton: 12.50, laycan_start: '2026-10-01', laycan_end: '2026-10-06', status: 'confirmed', created_at: '2026-09-05' },
          { id: '2', charter_type: 'time_charter', rate_agreed_usd_per_ton: 11.20, laycan_start: '2026-10-10', laycan_end: '2026-10-15', status: 'draft', created_at: '2026-09-08' },
          { id: '3', charter_type: 'voyage', rate_agreed_usd_per_ton: 16.80, laycan_start: '2026-09-15', laycan_end: '2026-09-20', status: 'in_transit', created_at: '2026-08-20' },
        ]);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up rounded-2xl overflow-hidden bg-white border border-[#E2E6EA] hover:shadow-md transition-shadow duration-300">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#F7F8FA' }}>
              {['Charter Type', 'Rate', 'Laycan', 'Status', 'Progress'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8A96A4' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => {
              const stepIndex = CONTRACT_STEPS.indexOf(c.status);
              return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors" style={{ borderTop: '1px solid #F0F2F4' }}>
                  <td className="px-4 py-3 text-sm font-medium capitalize" style={{ color: '#1A2332' }}>
                    {c.charter_type?.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#5A6978' }}>${c.rate_agreed_usd_per_ton}/t</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#5A6978' }}>{c.laycan_start} → {c.laycan_end}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full capitalize"
                          style={{ color: '#0B3D5C', backgroundColor: 'rgba(11,61,92,0.08)' }}>
                      {c.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {/* Mini stepper */}
                    <div className="flex items-center gap-0.5">
                      {CONTRACT_STEPS.slice(0, 5).map((step, i) => (
                        <div key={step} className="flex items-center">
                          <div className="w-2 h-2 rounded-full"
                               style={{ backgroundColor: i <= stepIndex ? '#1E8E6E' : '#E2E6EA' }} />
                          {i < 4 && (
                            <div className="w-4 h-0.5" style={{ backgroundColor: i < stepIndex ? '#1E8E6E' : '#E2E6EA' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
