import { Bell, AlertTriangle, Info, XCircle } from 'lucide-react';

const MOCK_ALERTS = [
  { id: '1', type: 'rate_move', severity: 'warning', message: 'Capesize rates on Australia→Paradip route surged +8.2% in 3 days. Consider fixing early.', is_read: false, created_at: '2026-09-10T14:30:00Z' },
  { id: '2', type: 'laycan_risk', severity: 'critical', message: 'Laycan window for Contract #CTR-2024-015 expires in 2 days. Vessel MV Sagar has not confirmed.', is_read: false, created_at: '2026-09-10T09:15:00Z' },
  { id: '3', type: 'congestion_spike', severity: 'info', message: 'Paradip Port congestion increased to 4.2 days average wait. Consider routing via Gangavaram.', is_read: false, created_at: '2026-09-09T16:45:00Z' },
  { id: '4', type: 'system', severity: 'info', message: 'Forecasting model retrained successfully. MAPE improved to 8.4% (from 9.1%).', is_read: true, created_at: '2026-09-08T11:00:00Z' },
  { id: '5', type: 'rate_move', severity: 'warning', message: 'Panamax rates on Indonesia→Vizag route dropped -5.1%. Favorable chartering window open.', is_read: true, created_at: '2026-09-07T08:30:00Z' },
];

export default function Alerts() {
  const severityConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
    critical: { color: '#D64545', bg: 'rgba(214,69,69,0.06)', icon: XCircle },
    warning: { color: '#E0A106', bg: 'rgba(224,161,6,0.06)', icon: AlertTriangle },
    info: { color: '#4A6572', bg: 'rgba(74,101,114,0.06)', icon: Info },
  };

  const today = MOCK_ALERTS.filter((a) => a.created_at.startsWith('2026-09-10'));
  const thisWeek = MOCK_ALERTS.filter((a) => !a.created_at.startsWith('2026-09-10') && a.created_at >= '2026-09-07');
  const earlier = MOCK_ALERTS.filter((a) => a.created_at < '2026-09-07');

  const renderGroup = (title: string, alerts: typeof MOCK_ALERTS) => {
    if (alerts.length === 0) return null;
    return (
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#8A96A4' }}>{title}</h3>
        <div className="space-y-2">
          {alerts.map((alert) => {
            const config = severityConfig[alert.severity] || severityConfig.info;
            const Icon = config.icon;
            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-4 rounded-xl transition-all hover:shadow-sm"
                style={{
                  backgroundColor: alert.is_read ? '#fff' : config.bg,
                  border: '1px solid #E2E6EA',
                  borderLeft: `4px solid ${config.color}`,
                }}
              >
                <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: config.color }} />
                <div className="flex-1">
                  <p className="text-sm" style={{ color: '#1A2332', fontWeight: alert.is_read ? 400 : 500 }}>
                    {alert.message}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#8A96A4' }}>
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
                {!alert.is_read && (
                  <div className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ backgroundColor: config.color }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderGroup('Today', today)}
      {renderGroup('This Week', thisWeek)}
      {renderGroup('Earlier', earlier)}
    </div>
  );
}
