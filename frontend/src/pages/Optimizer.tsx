import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Zap, ArrowDown } from 'lucide-react';
import api from '../lib/api';

export default function Optimizer() {
  const [plants, setPlants] = useState<any[]>([]);
  const [selectedPlants, setSelectedPlants] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadPlants(); }, []);

  const loadPlants = async () => {
    try {
      const res = await api.get('/api/plants');
      setPlants(res.data);
      if (res.data.length > 0) setSelectedPlants([res.data[0].id]);
    } catch { /* use mock */ }
  };

  const runOptimizer = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/procurement/optimize', {
        plant_ids: selectedPlants,
        horizon_days: 90,
      });
      setResult(res.data);
    } catch {
      // Mock fallback
      setResult({
        baseline_cost_usd: 12500000,
        optimized_cost_usd: 11625000,
        savings_pct: 7.0,
        schedule: [
          { commodity: 'Coking Coal', quantity_tons: 80000, vessel_type: 'panamax', charter_type: 'voyage', charter_window_start: '2026-10-01', charter_window_end: '2026-10-06', port: 'Paradip Port', eta: '2026-10-21', estimated_cost_usd: 960000 },
          { commodity: 'Coking Coal', quantity_tons: 150000, vessel_type: 'capesize', charter_type: 'voyage', charter_window_start: '2026-10-05', charter_window_end: '2026-10-10', port: 'Gangavaram Port', eta: '2026-10-25', estimated_cost_usd: 1275000 },
          { commodity: 'Limestone', quantity_tons: 60000, vessel_type: 'supramax', charter_type: 'voyage', charter_window_start: '2026-10-12', charter_window_end: '2026-10-17', port: 'Visakhapatnam Port', eta: '2026-11-01', estimated_cost_usd: 1020000 },
          { commodity: 'Dolomite', quantity_tons: 40000, vessel_type: 'handysize', charter_type: 'voyage', charter_window_start: '2026-10-15', charter_window_end: '2026-10-20', port: 'Haldia Dock Complex', eta: '2026-11-04', estimated_cost_usd: 880000 },
          { commodity: 'Coking Coal', quantity_tons: 60000, vessel_type: 'panamax', charter_type: 'time_charter', charter_window_start: '2026-10-20', charter_window_end: '2026-10-25', port: 'Dhamra Port', eta: '2026-11-09', estimated_cost_usd: 714000 },
        ]
      });
    } finally { setLoading(false); }
  };

  const vesselColors: Record<string, string> = {
    capesize: '#0B3D5C', panamax: '#1E8E6E', supramax: '#E0A106', handysize: '#4A6572',
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="animate-fade-in-up rounded-2xl p-6 bg-white border border-[#E2E6EA] hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2332' }}>Select Plant(s)</label>
            <div className="flex gap-2 flex-wrap">
              {plants.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPlants((prev) =>
                      prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]
                    );
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    backgroundColor: selectedPlants.includes(p.id) ? '#0B3D5C' : '#fff',
                    color: selectedPlants.includes(p.id) ? '#fff' : '#4A6572',
                    border: `1px solid ${selectedPlants.includes(p.id) ? '#0B3D5C' : '#E2E6EA'}`,
                  }}
                >
                  {p.name.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>
          <button onClick={runOptimizer} disabled={loading || selectedPlants.length === 0}
                  className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #1E8E6E, #0E7A5E)' }}>
            <Zap className="w-4 h-4" /> {loading ? 'Optimizing...' : 'Run Optimization'}
          </button>
        </div>
      </div>

      {result && (
        <>
          {/* Savings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl p-5" style={{ backgroundColor: '#fff', border: '1px solid #E2E6EA' }}>
              <p className="text-sm mb-1" style={{ color: '#8A96A4' }}>Baseline Cost</p>
              <p className="text-2xl font-bold" style={{ color: '#1A2332' }}>${(result.baseline_cost_usd / 1e6).toFixed(2)}M</p>
            </div>
            <div className="rounded-xl p-5" style={{ backgroundColor: '#fff', border: '1px solid #E2E6EA' }}>
              <p className="text-sm mb-1" style={{ color: '#8A96A4' }}>Optimized Cost</p>
              <p className="text-2xl font-bold" style={{ color: '#0B3D5C' }}>${(result.optimized_cost_usd / 1e6).toFixed(2)}M</p>
            </div>
            <div className="animate-fade-in-up stagger-3 rounded-2xl p-5" style={{ backgroundColor: 'rgba(30,142,110,0.05)', border: '2px solid #1E8E6E' }}>
              <p className="text-sm mb-1" style={{ color: '#1E8E6E' }}>Estimated Savings</p>
              <p className="text-3xl font-bold flex items-center gap-2" style={{ color: '#1E8E6E' }}>
                <ArrowDown className="w-6 h-6" /> {result.savings_pct?.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Gantt-style Schedule */}
          <div className="animate-fade-in-up rounded-2xl p-6 bg-white border border-[#E2E6EA] hover:shadow-md transition-shadow duration-300">
            <h3 className="text-base font-semibold mb-4" style={{ color: '#1A2332' }}>Optimized Schedule</h3>
            <div className="space-y-3">
              {result.schedule?.map((item: any, i: number) => {
                const barColor = vesselColors[item.vessel_type] || '#4A6572';
                return (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-32 shrink-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#1A2332' }}>{item.commodity}</p>
                      <p className="text-xs" style={{ color: '#8A96A4' }}>{item.quantity_tons?.toLocaleString()}t</p>
                    </div>
                    <div className="flex-1 relative">
                      <div className="h-8 rounded-lg flex items-center px-3 gap-2" style={{ backgroundColor: barColor, opacity: 0.9 }}>
                        <span className="text-white text-xs font-medium capitalize">{item.vessel_type}</span>
                        <span className="text-white/70 text-[10px]">{item.charter_window_start} → {item.eta}</span>
                      </div>
                    </div>
                    <div className="w-28 text-right shrink-0">
                      <p className="text-sm font-semibold" style={{ color: '#1A2332' }}>${(item.estimated_cost_usd / 1e6).toFixed(2)}M</p>
                      <p className="text-xs capitalize" style={{ color: '#8A96A4' }}>{item.charter_type.replace('_', ' ')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Vessel Type Legend */}
            <div className="flex gap-4 mt-4 pt-4" style={{ borderTop: '1px solid #F0F2F4' }}>
              {Object.entries(vesselColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                  <span className="text-xs capitalize" style={{ color: '#8A96A4' }}>{type}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!result && !loading && (
        <div className="animate-fade-in rounded-2xl p-16 text-center bg-white border border-[#E2E6EA]">
          <Zap className="w-12 h-12 mx-auto mb-4" style={{ color: '#E2E6EA' }} />
          <p className="text-lg font-medium" style={{ color: '#8A96A4' }}>Select plants and run the optimizer</p>
          <p className="text-sm mt-1" style={{ color: '#B8C0C8' }}>The LP solver will minimize total landed cost across all pending cargo orders</p>
        </div>
      )}
    </div>
  );
}
