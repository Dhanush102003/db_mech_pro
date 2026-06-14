import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { Droplets, Cog, Wrench, Cpu, ArrowRight, Zap, BarChart3, Shield, Gauge, Sparkles } from 'lucide-react';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const categories = [
  { icon: Gauge, title: 'Simulators', desc: 'Hydraulic circuit builder & cylinder sizing with live simulation', color: '#ff4081', count: 2, isNew: true },
  { icon: Droplets, title: 'Hydraulics', desc: 'Pump, filter, pipe sizing, oil cooler & pressure drop', color: '#00e5ff', count: 6 },
  { icon: Cog, title: 'Linkages', desc: 'FNR mechanism, cable calculator & 4-bar linkage', color: '#7c4dff', count: 3 },
  { icon: Wrench, title: 'Sheet Metal', desc: 'Bend allowance, blank size, shearing, deep draw & more', color: '#ff6d00', count: 6 },
  { icon: Cpu, title: 'CAE', desc: 'FEA, NVH vibration, CFD Reynolds & heat transfer', color: '#00e676', count: 5 },
];

const features = [
  { icon: Zap, title: 'Real-Time Animation', desc: 'See calculations come alive with dynamic 2D animations that respond instantly to your inputs' },
  { icon: BarChart3, title: 'Verified Formulas', desc: 'All formulas cross-verified against industry standards and engineering reference sheets' },
  { icon: Shield, title: 'Engineering Accurate', desc: 'Professional-grade calculations for hydraulics, sheet metal, FEA, NVH, and CFD analysis' },
];

export default function Landing() {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated particle background */}
        <AnimatedBackground particleCount={50} />

        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 rounded-full opacity-10 animate-float" style={{ background: 'radial-gradient(circle, var(--color-primary), transparent)', top: '10%', left: '10%' }} />
          <div className="absolute w-72 h-72 rounded-full opacity-10 animate-float" style={{ background: 'radial-gradient(circle, var(--color-accent), transparent)', top: '50%', right: '10%', animationDelay: '2s' }} />
          <div className="absolute w-48 h-48 rounded-full opacity-8 animate-float" style={{ background: 'radial-gradient(circle, #ff4081, transparent)', bottom: '10%', left: '40%', animationDelay: '4s' }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 ${isDark ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20' : 'bg-[var(--color-primary-dark)]/10 text-[var(--color-primary-dark)] border border-[var(--color-primary-dark)]/20'}`}>
              <Zap size={12} /> 22+ Interactive Tools & Simulators
            </div>

            <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold font-[var(--font-display)] leading-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Engineering
              <br />
              <span className="glow-text">Simulations</span>
              <br />
              Made Dynamic
            </h1>

            <p className={`text-base md:text-lg max-w-2xl mx-auto mb-10 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Interactive mechanical engineering simulators & calculators with real-time animated simulations.
              Hydraulic circuits, cylinder sizing, sheet metal forming — all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard" className="btn-primary text-base px-8 py-3 flex items-center gap-2">
                Open Tools <ArrowRight size={16} />
              </Link>
              <Link to="/sim/hydraulic-circuit" className="btn-ghost text-base px-8 py-3 flex items-center gap-2"
                style={{ borderColor: 'rgba(255, 64, 129, 0.3)', color: '#ff4081' }}>
                <Sparkles size={14} /> Try Circuit Simulator
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className={`text-2xl md:text-3xl font-bold font-[var(--font-display)] text-center mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Calculation & Simulation Modules
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {categories.map((cat, i) => (
              <motion.div key={cat.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 30 }}>
                <Link to="/dashboard" className="glass-card p-6 block group relative overflow-hidden">
                  {cat.isNew && (
                    <div className="absolute top-3 right-3">
                      <span className="neon-badge pink"><Sparkles size={8} className="mr-0.5" /> NEW</span>
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                    style={{ background: `${cat.color}15`, color: cat.color }}>
                    <cat.icon size={22} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{cat.title}</h3>
                  <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{cat.desc}</p>
                  <div className="flex items-center gap-1 text-xs font-medium" style={{ color: cat.color }}>
                    {cat.count} {cat.title === 'Simulators' ? 'Simulators' : 'Calculators'} <ArrowRight size={12} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div key={feat.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="glass-card p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto mb-4">
                  <feat.icon size={22} />
                </div>
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{feat.title}</h3>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
