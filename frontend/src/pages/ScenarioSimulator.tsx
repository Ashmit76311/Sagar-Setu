import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import api from '../lib/api';

export default function ScenarioSimulator() {
  const [bunkerDelta, setBunkerDelta] = useState(0);
  const [congestionDelta, setCongestionDelta] = useState(0);
  const [rateShock, setRateShock] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/scenarios/simulate', {
        bunker_price_delta_pct: bunkerDelta,
        congestion_delta_days: congestionDelta,
        rate_shock_pct: rateShock,
        horizon_days: 90,
      });
      setResult(res.data);
    } catch {
      // Mock fallback
      const base = 11625000;
      const impact = (1 + rateShock / 100) * (1 + bunkerDelta / 100 * 0.2);
      const scenCost = base * impact;
      setResult({
        baseline: { optimized_cost_usd: base, savings_pct: 7.0 },
        scenario: { optimized_cost_usd: scenCost, savings_pct: 7.0 * (base / scenCost) },
        cost_delta_usd: scenCost - base,
        cost_delta_pct: ((scenCost - base) / base) * 100,
      });
    } finally { setLoading(false); }
  };

  const sliders = [
    { label: 'Bunker Price Change', value: bunkerDelta, set: setBunkerDelta, min: -30, max: 50, unit: '%', color: '#0B3D5C' },
    { label: 'Port Congestion Change', value: congestionDelta, set: setCongestionDelta, min: -5, max: 15, unit: ' days', color: '#E0A106' },
    { label: 'Freight Rate Shock', value: rateShock, set: setRateShock, min: -30, max: 50, unit: '%', color: '#D64545' },
  ];

  return (
    <div className="space-y-6">
      {/* Sliders */}
      <div className="animate-fade-in-up rounded-2xl p-6 bg-white border border-[#E2E6EA] hover:shadow-md transition-shadow duration-300">
        <h3 className="text-base font-semibold mb-5" style={{ color: '#1A2332' }}>Scenario Parameters</h3>
        <div className="space-y-6">
          {sliders.map((s) => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium" style={{ color: '#1A2332' }}>{s.label}</label>
                <span className="text-sm font-bold px-3 py-1 rounded-lg"
                      style={{ color: s.color, backgroundColor: `${s.color}10` }}>
                  {s.value > 0 ? '+' : ''}{s.value}{s.unit}
                </span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                value={s.value}
                onChange={(e) => s.set(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${s.color} 0%, ${s.color} ${((s.value - s.min) / (s.max - s.min)) * 100}%, #E2E6EA ${((s.value - s.min) / (s.max - s.min)) * 100}%, #E2E6EA 100%)`,
                }}
              />
              <div className="flex justify-between text-[10px] mt-1" style={{ color: '#8A96A4' }}>
                <span>{s.min}{s.unit}</span><span>{s.max}{s.unit}</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={runSimulation} disabled={loading}
                className="mt-6 w-full py-2.5 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #0B3D5C, #0E4D73)' }}>
          <SlidersHorizontal className="w-4 h-4" /> {loading ? 'Simulating...' : 'Run Simulation'}
        </button>
      </div>

      {/* Results: Side-by-side */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Baseline */}
          <div className="rounded-xl p-6" style={{ backgroundColor: '#fff', border: '1px solid #E2E6EA' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8A96A4' }} />
              <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#8A96A4' }}>Baseline</h4>
            </div>
            <p className="text-3xl font-bold mb-2" style={{ color: '#1A2332' }}>
              ${(result.baseline.optimized_cost_usd / 1e6).toFixed(2)}M
            </p>
            <p className="text-sm" style={{ color: '#8A96A4' }}>Optimized cost at current rates</p>
          </div>

          {/* Scenario */}
          <div className="rounded-xl p-6" style={{
            backgroundColor: result.cost_delta_pct > 0 ? 'rgba(214,69,69,0.03)' : 'rgba(30,142,110,0.03)',
            border: `2px solid ${result.cost_delta_pct > 0 ? '#D64545' : '#1E8E6E'}`,
          }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0B3D5C' }} />
              <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#0B3D5C' }}>Scenario</h4>
            </div>
            <p className="text-3xl font-bold mb-2" style={{ color: '#1A2332' }}>
              ${(result.scenario.optimized_cost_usd / 1e6).toFixed(2)}M
            </p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold"
                    style={{ color: result.cost_delta_pct > 0 ? '#D64545' : '#1E8E6E' }}>
                {result.cost_delta_pct > 0 ? '+' : ''}{result.cost_delta_pct.toFixed(1)}%
              </span>
              <span className="text-sm" style={{ color: '#8A96A4' }}>
                ({result.cost_delta_usd > 0 ? '+' : ''}${(result.cost_delta_usd / 1e6).toFixed(2)}M)
              </span>
            </div>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="animate-fade-in rounded-2xl p-16 text-center bg-white border border-[#E2E6EA]">
          <SlidersHorizontal className="w-12 h-12 mx-auto mb-4" style={{ color: '#E2E6EA' }} />
          <p className="text-lg font-medium" style={{ color: '#8A96A4' }}>Adjust parameters and simulate</p>
          <p className="text-sm mt-1" style={{ color: '#B8C0C8' }}>Compare baseline vs. scenario costs to stress-test your procurement plan</p>
        </div>
      )}
    </div>
  );
}
