import { useEffect, useState } from 'react';
import { Plus, Ship } from 'lucide-react';
import api from '../lib/api';

export default function CargoOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const res = await api.get('/api/cargo-orders');
      setOrders(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getRecommendation = async (orderId: string) => {
    setRecLoading(true);
    setRecommendation(null);
    try {
      const res = await api.post('/api/vessels/recommend', { cargo_order_id: orderId });
      setRecommendation(res.data);
    } catch (err) {
      // Mock fallback
      setRecommendation({
        cargo_order_id: orderId,
        recommendations: [
          { vessel_type: 'panamax', charter_type: 'voyage', projected_rate_usd_per_ton: 12.5, total_estimated_cost_usd: 750000, confidence: 0.88, reasoning: 'Best value based on current rates.', is_best_value: true },
          { vessel_type: 'panamax', charter_type: 'time_charter', projected_rate_usd_per_ton: 11.9, total_estimated_cost_usd: 714000, confidence: 0.75, reasoning: 'Time charter slightly cheaper but higher bunker exposure.', is_best_value: false },
          { vessel_type: 'supramax', charter_type: 'voyage', projected_rate_usd_per_ton: 16.8, total_estimated_cost_usd: 1008000, confidence: 0.82, reasoning: 'Available if port draft is limited.', is_best_value: false },
        ]
      });
    } finally { setRecLoading(false); }
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'rgba(138,150,164,0.12)', text: '#8A96A4' },
    recommended: { bg: 'rgba(11,61,92,0.1)', text: '#0B3D5C' },
    contracted: { bg: 'rgba(30,142,110,0.1)', text: '#1E8E6E' },
    in_transit: { bg: 'rgba(224,161,6,0.1)', text: '#E0A106' },
    delivered: { bg: 'rgba(30,142,110,0.18)', text: '#1E8E6E' },
    delayed: { bg: 'rgba(214,69,69,0.1)', text: '#D64545' },
    closed: { bg: 'rgba(138,150,164,0.08)', text: '#8A96A4' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: '#8A96A4' }}>{orders.length} total orders</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #0B3D5C, #0E4D73)' }}>
          <Plus className="w-4 h-4" /> New Cargo Order
        </button>
      </div>

      {/* Orders Table */}
      <div className="animate-fade-in-up rounded-2xl overflow-hidden bg-white border border-[#E2E6EA] hover:shadow-md transition-shadow duration-300">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#F7F8FA' }}>
              {['Commodity', 'Quantity', 'Origin', 'Plant', 'Due Date', 'Status', 'Action'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8A96A4' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const sc = statusColors[order.status] || statusColors.pending;
              return (
                <tr key={order.id} className="transition-colors hover:bg-gray-50" style={{ borderTop: '1px solid #F0F2F4' }}>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: '#1A2332' }}>{order.commodity?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#5A6978' }}>{order.quantity_tons?.toLocaleString()} t</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#5A6978' }}>{order.origin_country}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#5A6978' }}>{order.plant?.name?.split('(')[0] || '—'}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#5A6978' }}>{order.required_by_date}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: sc.text, backgroundColor: sc.bg }}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => getRecommendation(order.id)}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:shadow-sm"
                      style={{ color: '#0B3D5C', border: '1px solid #E2E6EA' }}
                    >
                      <Ship className="w-3.5 h-3.5" /> Recommend
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vessel Recommendation Slide-over */}
      {recommendation && (
        <div className="animate-slide-in-right rounded-2xl p-6 bg-white border border-[#E2E6EA] shadow-lg">
          <h3 className="text-base font-semibold mb-4" style={{ color: '#1A2332' }}>Vessel Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendation.recommendations?.map((rec: any, i: number) => (
              <div
                key={i}
                className="rounded-xl p-5 transition-all hover:shadow-md relative"
                style={{
                  border: rec.is_best_value ? '2px solid #1E8E6E' : '1px solid #E2E6EA',
                  backgroundColor: rec.is_best_value ? 'rgba(30,142,110,0.03)' : '#fff',
                }}
              >
                {rec.is_best_value && (
                  <span className="absolute -top-2.5 left-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: '#1E8E6E' }}>
                    BEST VALUE
                  </span>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <Ship className="w-5 h-5" style={{ color: '#4A6572' }} />
                  <span className="text-sm font-semibold capitalize" style={{ color: '#1A2332' }}>{rec.vessel_type}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: 'rgba(74,101,114,0.08)', color: '#4A6572' }}>
                    {rec.charter_type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-2xl font-bold mb-1" style={{ color: '#1A2332' }}>
                  ${rec.total_estimated_cost_usd?.toLocaleString()}
                </p>
                <p className="text-xs mb-3" style={{ color: '#8A96A4' }}>${rec.projected_rate_usd_per_ton}/ton</p>

                {/* Confidence bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: '#8A96A4' }}>Confidence</span>
                    <span className="font-semibold" style={{ color: '#1A2332' }}>{Math.round(rec.confidence * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#F0F2F4' }}>
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${rec.confidence * 100}%`, backgroundColor: '#1E8E6E' }} />
                  </div>
                </div>

                <p className="text-xs mb-4" style={{ color: '#8A96A4' }}>{rec.reasoning}</p>
                <button className="w-full py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: rec.is_best_value ? '#0B3D5C' : '#fff',
                    color: rec.is_best_value ? '#fff' : '#0B3D5C',
                    border: `1px solid ${rec.is_best_value ? '#0B3D5C' : '#E2E6EA'}`,
                  }}>
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
