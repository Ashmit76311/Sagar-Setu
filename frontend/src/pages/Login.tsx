import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Anchor, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      // Clear state so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { label: 'Admin', email: 'admin@sagarsetu.gov.in', pw: 'admin123' },
    { label: 'Chartering', email: 'charter@sail.gov.in', pw: 'charter123' },
    { label: 'Planner', email: 'planner@sail.gov.in', pw: 'planner123' },
    { label: 'Viewer', email: 'viewer@steel.gov.in', pw: 'viewer123' },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F7F8FA' }}>
      {/* Left Panel — Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #082D44 0%, #0B3D5C 40%, #0E4D73 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-5"
             style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full overflow-hidden mb-8 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <img src="/logo.png" alt="Sagar Setu" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Sagar Setu</h1>
          <p className="text-lg mb-2" style={{ color: 'rgba(232,236,240,0.8)' }}>
            Intelligent Freight Forecasting &amp; Vessel Chartering
          </p>
          <p className="text-sm" style={{ color: 'rgba(232,236,240,0.5)' }}>
            Ministry of Steel, Government of India — SIH 2026
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 text-left max-w-sm mx-auto">
            {[
              { n: '7/30/90d', l: 'Rate Forecasting' },
              { n: 'LP-Based', l: 'Schedule Optimization' },
              { n: 'Ensemble', l: 'SARIMA+Prophet+XGBoost' },
              { n: 'Real-time', l: 'Decision Support' },
            ].map((item) => (
              <div key={item.l} className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <p className="text-white font-semibold text-sm">{item.n}</p>
                <p className="text-[11px]" style={{ color: 'rgba(232,236,240,0.5)' }}>{item.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md my-auto">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm border border-[#E2E6EA]">
              <img src="/logo.png" alt="Sagar Setu" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#1A2332' }}>Sagar Setu</h1>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: '#1A2332' }}>Welcome back</h2>
          <p className="text-sm mb-8" style={{ color: '#8A96A4' }}>Sign in to access the platform</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm font-medium"
                 style={{ backgroundColor: 'rgba(214,69,69,0.08)', color: '#D64545', border: '1px solid rgba(214,69,69,0.2)' }}>
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 rounded-lg text-sm font-medium"
                 style={{ backgroundColor: 'rgba(30,142,110,0.08)', color: '#1E8E6E', border: '1px solid rgba(30,142,110,0.2)' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2332' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all focus:ring-2"
                style={{ border: '1px solid #E2E6EA', color: '#1A2332', backgroundColor: '#fff' }}
                onFocus={(e) => e.target.style.borderColor = '#0B3D5C'}
                onBlur={(e) => e.target.style.borderColor = '#E2E6EA'}
                placeholder="you@ministry.gov.in"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2332' }}>Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none pr-10 transition-all focus:ring-2"
                  style={{ border: '1px solid #E2E6EA', color: '#1A2332', backgroundColor: '#fff' }}
                  onFocus={(e) => e.target.style.borderColor = '#0B3D5C'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E6EA'}
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#8A96A4' }}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-all disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #0B3D5C, #0E4D73)',
                boxShadow: '0 4px 14px rgba(11,61,92,0.3)',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo quick-login */}
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid #E2E6EA' }}>
            <p className="text-xs font-medium mb-3" style={{ color: '#8A96A4' }}>DEMO QUICK LOGIN</p>
            <div className="grid grid-cols-2 gap-2">
              {demoCredentials.map((cred) => (
                <button
                  key={cred.label}
                  type="button"
                  onClick={() => { setEmail(cred.email); setPassword(cred.pw); }}
                  className="px-3 py-2 rounded-lg text-xs font-medium transition-all hover:shadow-sm"
                  style={{ border: '1px solid #E2E6EA', color: '#4A6572', backgroundColor: '#fff' }}
                >
                  {cred.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center text-sm" style={{ color: '#8A96A4' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: '#0B3D5C' }}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
