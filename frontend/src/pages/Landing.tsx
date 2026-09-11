import { Link } from 'react-router-dom';
import { Anchor, BarChart2, Ship, Zap, ArrowRight, CheckCircle2, Shield, Globe } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-[#1A2332] font-sans overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-[#E2E6EA]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm border border-[#E2E6EA]">
              <img src="/logo.png" alt="Sagar Setu" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0B3D5C]">Sagar Setu</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4A6572]">
            <a href="#features" className="hover:text-[#0B3D5C] transition-colors">Features</a>
            <a href="#forecast" className="hover:text-[#0B3D5C] transition-colors">Forecasting</a>
            <a href="#optimization" className="hover:text-[#0B3D5C] transition-colors">Optimization</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-[#0B3D5C] hover:text-[#1E8E6E] transition-colors">
              Sign In
            </Link>
            <Link to="/login" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-br from-[#0B3D5C] to-[#0E4D73] shadow-md hover:shadow-lg transition-all flex items-center gap-2">
              Live Demo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section (Page 1) */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E8E6E]/10 border border-[#1E8E6E]/20 text-[#1E8E6E] text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#1E8E6E] animate-pulse" /> Live for SIH 2026
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-[#0B3D5C] leading-[1.1]">
            Intelligent <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E8E6E] to-[#0B3D5C]">
              Freight & Chartering
            </span>
          </h1>
          <p className="text-lg text-[#5A6978] max-w-lg leading-relaxed">
            The next-generation platform for the Ministry of Steel. Leverage machine learning to forecast Baltic Dry Index rates, optimize cargo shipments, and minimize landed costs.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-8 py-4 rounded-xl text-base font-semibold text-white bg-[#0B3D5C] shadow-[0_10px_30px_rgba(11,61,92,0.3)] hover:bg-[#0E4D73] hover:-translate-y-1 transition-all flex items-center gap-2">
              Start Live Demo
            </Link>
            <Link to="/register" className="px-8 py-4 rounded-xl text-base font-semibold text-[#0B3D5C] bg-[#F7F8FA] border border-[#E2E6EA] hover:bg-gray-100 transition-all">
              Create Account
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2 w-full relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#1E8E6E]/20 to-[#0B3D5C]/20 blur-3xl rounded-full" />
          <div className="relative bg-white border border-[#E2E6EA] rounded-2xl shadow-2xl p-4 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <img src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80" alt="Dashboard Preview" className="w-full rounded-xl opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Features Overview (Page 2) */}
      <section id="features" className="py-24 bg-[#F7F8FA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-[#0B3D5C] mb-4">Command your supply chain.</h2>
            <p className="text-[#5A6978]">Comprehensive tools designed specifically for bulk cargo procurement and maritime logistics.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BarChart2, title: 'AI Rate Forecasting', desc: 'Ensemble ML models (SARIMA, Prophet, XGBoost) predict freight rates up to 90 days out with confidence bands.' },
              { icon: Ship, title: 'Smart Vessel Matching', desc: 'Automatically match cargo lot sizes and port drafts to the optimal vessel class (Capesize, Panamax, etc).' },
              { icon: Zap, title: 'Procurement Optimizer', desc: 'Linear programming solver balances inventory carrying costs against freight market volatility.' }
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-[#E2E6EA] shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-[#0B3D5C]/5 flex items-center justify-center mb-6">
                  <f.icon className="w-6 h-6 text-[#0B3D5C]" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#1A2332]">{f.title}</h3>
                <p className="text-[#5A6978] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep Dive: Forecasting (Page 3) */}
      <section id="forecast" className="py-24 px-6 max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center gap-16">
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-4xl font-bold text-[#0B3D5C] leading-tight">Predict the unpredictable.</h2>
          <p className="text-lg text-[#5A6978]">
            Maritime freight rates are notoriously volatile. Our AI engine ingests Baltic Dry Index data, bunker prices, and macroeconomic indicators to generate highly accurate time-series forecasts.
          </p>
          <ul className="space-y-4 pt-4">
            {['8.4% Mean Absolute Percentage Error (MAPE)', '80% & 95% Confidence Intervals', 'Multi-route dynamic simulation'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-[#1A2332] font-medium">
                <CheckCircle2 className="w-5 h-5 text-[#1E8E6E]" /> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="md:w-1/2 w-full p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden group transition-all duration-500 hover:shadow-[0_20px_50px_rgba(11,61,92,0.4)] hover:-translate-y-2"
             style={{ background: 'linear-gradient(135deg, rgba(11,61,92,0.95), rgba(14,77,115,0.85))', backdropFilter: 'blur(12px)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1E8E6E] rounded-full blur-[100px] opacity-40 transition-opacity duration-500 group-hover:opacity-60" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-[80px] opacity-0 transition-opacity duration-500 group-hover:opacity-30" />
          
          <BarChart2 className="w-16 h-16 text-white/20 mb-6 relative z-10 transition-transform duration-500 group-hover:scale-110" />
          <h3 className="text-2xl font-bold mb-2 relative z-10">Ensemble Model Architecture</h3>
          <p className="text-white/70 mb-8 relative z-10 font-medium tracking-wide">Advanced Time-Series Predictive Engine</p>
          <div className="h-40 flex items-end gap-3 relative z-10 px-2">
            {[30, 45, 25, 60, 75, 50, 85, 65, 95].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md transition-all duration-700 ease-out group-hover:brightness-125 group-hover:shadow-[0_0_15px_rgba(30,142,110,0.5)]" 
                   style={{ height: `${h}%`, background: 'linear-gradient(to top, #1E8E6E, rgba(30,142,110,0.3))' }} />
            ))}
          </div>
        </div>
      </section>

      {/* Deep Dive: Optimization (Page 4) */}
      <section id="optimization" className="py-24 bg-[#F7F8FA]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-4xl font-bold text-[#0B3D5C] leading-tight">Mathematics meets shipping.</h2>
            <p className="text-lg text-[#5A6978]">
              When should you charter? Our Procurement Optimizer uses PuLP (Linear Programming) to calculate the exact window that minimizes total landed cost, generating a Gantt-style chartering schedule.
            </p>
            <Link to="/login" className="inline-flex items-center gap-2 text-[#1E8E6E] font-bold hover:gap-3 transition-all">
              Try the Optimizer <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="md:w-1/2 grid grid-cols-2 gap-6">
            <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-white/50 hover:shadow-xl hover:-translate-y-2 hover:border-[#1E8E6E]/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#0B3D5C]/5 flex items-center justify-center mb-5 group-hover:bg-[#0B3D5C]/10 transition-colors">
                <Shield className="w-6 h-6 text-[#0B3D5C]" />
              </div>
              <div className="text-3xl font-extrabold text-[#1A2332] mb-1">7.0%</div>
              <div className="text-sm font-medium text-[#8A96A4]">Average Cost Savings</div>
            </div>
            <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-white/50 hover:shadow-xl hover:-translate-y-2 hover:border-[#1E8E6E]/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#1E8E6E]/10 flex items-center justify-center mb-5 group-hover:bg-[#1E8E6E]/20 transition-colors">
                <Globe className="w-6 h-6 text-[#1E8E6E]" />
              </div>
              <div className="text-3xl font-extrabold text-[#1A2332] mb-1">14</div>
              <div className="text-sm font-medium text-[#8A96A4]">Global Routes Monitored</div>
            </div>
          </div>
        </div>
      </section>

      {/* Scenario Simulator (Page 5) */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-[#0B3D5C] mb-6">Stress-test your supply chain.</h2>
        <p className="text-lg text-[#5A6978] mb-12">
          Use the Scenario Simulator to inject macro shocks—like bunker price spikes or port congestion—and instantly see the financial delta against your baseline procurement plan.
        </p>
        <div className="p-1 bg-gradient-to-r from-[#1E8E6E] to-[#0B3D5C] rounded-2xl">
          <div className="bg-white rounded-xl p-8 flex items-center justify-between">
            <div className="text-left">
              <div className="text-sm font-bold text-[#8A96A4] uppercase tracking-wider mb-1">Baseline Cost</div>
              <div className="text-3xl font-bold text-[#1A2332]">$12.50M</div>
            </div>
            <ArrowRight className="w-8 h-8 text-[#E2E6EA]" />
            <div className="text-right">
              <div className="text-sm font-bold text-[#D64545] uppercase tracking-wider mb-1">Scenario Cost</div>
              <div className="text-3xl font-bold text-[#D64545]">$14.25M</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action (Page 6) */}
      <section className="bg-[#0B3D5C] py-24 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to optimize your fleet?</h2>
          <p className="text-lg text-white/80 mb-10">
            Experience the full platform live. Log in with our pre-configured demo accounts to explore the dashboards, forecasting, and optimization tools.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-[#0B3D5C] bg-white hover:bg-gray-100 transition-all flex justify-center items-center gap-2">
              Access Live Demo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A2332] py-8 text-center text-sm text-[#8A96A4] border-t border-white/10">
        <p>© 2026 Sagar Setu Platform. Built for the Smart India Hackathon.</p>
      </footer>
    </div>
  );
}
