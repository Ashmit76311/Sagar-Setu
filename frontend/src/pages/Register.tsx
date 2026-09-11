import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Anchor, Eye, EyeOff } from 'lucide-react';
import api from '../lib/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('viewer');
  const [org, setOrg] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/register', {
        name,
        email,
        password,
        role,
        organization: org,
      });
      // Registration successful, redirect to login
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        </div>
      </div>

      {/* Right Panel — Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm border border-[#E2E6EA]">
              <img src="/logo.png" alt="Sagar Setu" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#1A2332' }}>Sagar Setu</h1>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: '#1A2332' }}>Create an account</h2>
          <p className="text-sm mb-8" style={{ color: '#8A96A4' }}>Sign up to access the platform</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm font-medium"
                 style={{ backgroundColor: 'rgba(214,69,69,0.08)', color: '#D64545', border: '1px solid rgba(214,69,69,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2332' }}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all focus:ring-2"
                style={{ border: '1px solid #E2E6EA', color: '#1A2332', backgroundColor: '#fff' }}
                onFocus={(e) => e.target.style.borderColor = '#0B3D5C'}
                onBlur={(e) => e.target.style.borderColor = '#E2E6EA'}
                placeholder="John Doe"
                required
              />
            </div>

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
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#8A96A4' }}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2332' }}>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all focus:ring-2"
                style={{ border: '1px solid #E2E6EA', color: '#1A2332', backgroundColor: '#fff' }}
                onFocus={(e) => e.target.style.borderColor = '#0B3D5C'}
                onBlur={(e) => e.target.style.borderColor = '#E2E6EA'}
              >
                <option value="viewer">Ministry Viewer</option>
                <option value="chartering_officer">Chartering Officer</option>
                <option value="procurement_planner">Procurement Planner</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2332' }}>Organization</label>
              <input
                type="text"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all focus:ring-2"
                style={{ border: '1px solid #E2E6EA', color: '#1A2332', backgroundColor: '#fff' }}
                onFocus={(e) => e.target.style.borderColor = '#0B3D5C'}
                onBlur={(e) => e.target.style.borderColor = '#E2E6EA'}
                placeholder="Ministry of Steel / SAIL"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-lg text-white font-semibold text-sm transition-all disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #0B3D5C, #0E4D73)',
                boxShadow: '0 4px 14px rgba(11,61,92,0.3)',
              }}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: '#8A96A4' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: '#0B3D5C' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
