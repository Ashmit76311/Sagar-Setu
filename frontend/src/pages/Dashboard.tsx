import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { FileText, TrendingUp, CalendarClock, Bell, Package, Zap, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import api from '../lib/api';

interface KPI {
  label: string;
  value: string | number;
  trend?: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  gradient: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [ordersRes] = await Promise.all([api.get('/api/cargo-orders')]);
      setOrders(ordersRes.data);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
      const mockChart = months.map((m, i) => ({
        month: m,
        capesize: 8.5 + Math.sin(i * 0.8) * 2 + Math.random() * 0.5,
        panamax: 12 + Math.sin(i * 0.6) * 1.8 + Math.random() * 0.4,
        supramax: 16 + Math.sin(i * 0.7) * 1.5 + Math.random() * 0.3,
      }));
      setChartData(mockChart);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  const kpis: KPI[] = [
    { label: 'Active Contracts', value: 12, trend: 8.3, icon: FileText, color: '#0B3D5C', bgColor: 'rgba(11,61,92,0.08)', gradient: 'linear-gradient(135deg, rgba(11,61,92,0.05), rgba(14,77,115,0.02))' },
    { label: 'Avg. Freight Trend', value: '$12.40/t', trend: -3.2, icon: TrendingUp, color: '#1E8E6E', bgColor: 'rgba(30,142,110,0.08)', gradient: 'linear-gradient(135deg, rgba(30,142,110,0.05), rgba(36,168,127,0.02))' },
    { label: 'Upcoming Laycans', value: 5, trend: 0, icon: CalendarClock, color: '#E0A106', bgColor: 'rgba(224,161,6,0.08)', gradient: 'linear-gradient(135deg, rgba(224,161,6,0.05), rgba(240,180,23,0.02))' },
    { label: 'Open Alerts', value: 3, trend: 15, icon: Bell, color: '#D64545', bgColor: 'rgba(214,69,69,0.08)', gradient: 'linear-gradient(135deg, rgba(214,69,69,0.05), rgba(226,85,85,0.02))' },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl p-5 bg-white border border-[#E2E6EA]">
              <div className="skeleton w-10 h-10 mb-4" />
              <div className="skeleton w-20 h-7 mb-2" />
              <div className="skeleton w-28 h-4" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl p-6 bg-white border border-[#E2E6EA]">
          <div className="skeleton w-48 h-5 mb-2" />
          <div className="skeleton w-64 h-4 mb-6" />
          <div className="skeleton w-full h-[320px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="animate-fade-in-up rounded-2xl p-6 relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #0B3D5C, #0E4D73)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-30"
             style={{ background: '#1E8E6E' }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#1E8E6E]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/60">Intelligence Overview</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}!</h2>
            <p className="text-sm text-white/70">Here's what's happening across your maritime supply chain today.</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate('/forecast')} className="px-4 py-2 rounded-xl text-sm font-semibold text-white/90 border border-white/20 hover:bg-white/10 transition-all">
              View Forecast →
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`animate-fade-in-up stagger-${i + 1} rounded-2xl p-5 cursor-pointer group transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
            style={{ background: kpi.gradient, border: '1px solid #E2E6EA' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: kpi.bgColor }}
              >
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              {kpi.trend !== undefined && kpi.trend !== 0 && (
                <span
                  className="flex items-center gap-0.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    color: kpi.trend > 0 ? '#1E8E6E' : '#D64545',
                    backgroundColor: kpi.trend > 0 ? 'rgba(30,142,110,0.08)' : 'rgba(214,69,69,0.08)',
                  }}
                >
                  {kpi.trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(kpi.trend)}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold mb-1" style={{ color: '#1A2332' }}>{kpi.value}</p>
            <p className="text-sm font-medium" style={{ color: '#8A96A4' }}>{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="animate-fade-in-up stagger-5 rounded-2xl p-6 bg-white border border-[#E2E6EA] hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold" style={{ color: '#1A2332' }}>Freight Rate Trends</h3>
            <p className="text-sm mt-0.5" style={{ color: '#8A96A4' }}>Multi-route freight rate index (USD/ton)</p>
          </div>
          <span className="simulated-data-badge">⚡ Simulated</span>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCape" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0B3D5C" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0B3D5C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPana" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E8E6E" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#1E8E6E" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSupra" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E0A106" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#E0A106" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F4" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8A96A4' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#8A96A4' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #E2E6EA', fontSize: '13px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
              formatter={(value: number) => [`$${value.toFixed(2)}/t`]}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
            <Area type="monotone" dataKey="capesize" name="Capesize" stroke="#0B3D5C" strokeWidth={2.5} fill="url(#colorCape)" dot={false} activeDot={{ r: 5, fill: '#0B3D5C', stroke: '#fff', strokeWidth: 2 }} />
            <Area type="monotone" dataKey="panamax" name="Panamax" stroke="#1E8E6E" strokeWidth={2.5} fill="url(#colorPana)" dot={false} activeDot={{ r: 5, fill: '#1E8E6E', stroke: '#fff', strokeWidth: 2 }} />
            <Area type="monotone" dataKey="supramax" name="Supramax" stroke="#E0A106" strokeWidth={2.5} fill="url(#colorSupra)" dot={false} activeDot={{ r: 5, fill: '#E0A106', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <div className="animate-fade-in-up rounded-2xl p-6 bg-white border border-[#E2E6EA]">
          <h3 className="text-base font-bold mb-4" style={{ color: '#1A2332' }}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'New Cargo Order', icon: Package, path: '/cargo-orders', color: '#0B3D5C' },
              { label: 'Run Optimizer', icon: Zap, path: '/optimizer', color: '#1E8E6E' },
              { label: 'View Forecast', icon: TrendingUp, path: '/forecast', color: '#4A6572' },
              { label: 'View Alerts', icon: Bell, path: '/alerts', color: '#E0A106' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 text-left group"
                style={{ border: '1px solid #E2E6EA', background: 'linear-gradient(135deg, #FAFBFC, #fff)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                     style={{ backgroundColor: `${action.color}10` }}>
                  <action.icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: '#1A2332' }}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Cargo Orders */}
        <div className="animate-fade-in-up rounded-2xl p-6 bg-white border border-[#E2E6EA]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold" style={{ color: '#1A2332' }}>Recent Cargo Orders</h3>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ color: '#E0A106', backgroundColor: 'rgba(224,161,6,0.08)' }}>
              {pendingOrders} pending
            </span>
          </div>
          <div className="space-y-1">
            {orders.slice(0, 5).map((order: any, idx: number) => {
              const statusColors: Record<string, { bg: string; text: string }> = {
                pending: { bg: 'rgba(138,150,164,0.1)', text: '#8A96A4' },
                recommended: { bg: 'rgba(11,61,92,0.08)', text: '#0B3D5C' },
                contracted: { bg: 'rgba(30,142,110,0.08)', text: '#1E8E6E' },
                in_transit: { bg: 'rgba(224,161,6,0.08)', text: '#E0A106' },
                delivered: { bg: 'rgba(30,142,110,0.15)', text: '#1E8E6E' },
              };
              const sc = statusColors[order.status] || statusColors.pending;
              return (
                <div key={order.id}
                     className={`flex items-center justify-between py-3 px-3.5 rounded-xl table-row-hover animate-fade-in-up`}
                     style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1A2332' }}>
                      {order.commodity?.name || 'Commodity'} — {order.quantity_tons?.toLocaleString()}t
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#8A96A4' }}>
                      {order.origin_country} → {order.plant?.name?.split('(')[0] || 'Plant'}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ color: sc.text, backgroundColor: sc.bg }}>
                    {order.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
