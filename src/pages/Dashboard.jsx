import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';

const calculators = [
  // Hydraulics
  { id: 'pump', title: 'Pump Calculator', desc: 'Flow, pressure & power calculations', icon: '⚙️', cat: 'Hydraulics', path: '/calc/pump' },
  { id: 'filter', title: 'Filter Selection', desc: 'Micron rating, ΔP & service life', icon: '🔵', cat: 'Hydraulics', path: '/calc/filter' },
  { id: 'pipe', title: 'Pipe & Hose Sizing', desc: 'ID/OD auto-selection with velocity check', icon: '📐', cat: 'Hydraulics', path: '/calc/pipe' },
  { id: 'cooler', title: 'Oil Cooler Sizing', desc: 'LMTD, area & thermal equilibrium', icon: '🌡️', cat: 'Hydraulics', path: '/calc/cooler' },
  { id: 'pressure-drop', title: 'Pressure Drop', desc: 'Full routing with bends & fittings', icon: '📉', cat: 'Hydraulics', path: '/calc/pressure-drop' },
  { id: 'hyd-summary', title: 'System Summary', desc: 'Complete hydraulic system dashboard', icon: '✅', cat: 'Hydraulics', path: '/calc/hyd-summary' },
  // Linkages
  { id: 'fnr', title: 'FNR Mechanism', desc: 'Forward-Neutral-Reverse lever rotation', icon: '🔄', cat: 'Linkages', path: '/calc/fnr' },
  { id: 'cable', title: 'Cable Calculator', desc: 'Cable strength & selection guide', icon: '🔗', cat: 'Linkages', path: '/calc/cable' },
  { id: 'fourbar', title: '4-Bar Linkage', desc: 'Position analysis with animation', icon: '📎', cat: 'Linkages', path: '/calc/fourbar' },
  // Sheet Metal
  { id: 'bend', title: 'Bend Allowance', desc: 'BA, BD, K-factor & flat pattern', icon: '📏', cat: 'Sheet Metal', path: '/calc/bend' },
  { id: 'blank', title: 'Blank Size', desc: 'Cylindrical draw blank diameter', icon: '⭕', cat: 'Sheet Metal', path: '/calc/blank' },
  { id: 'tonnage', title: 'Press Tonnage', desc: 'Bending force for V-die & air bend', icon: '🏗️', cat: 'Sheet Metal', path: '/calc/tonnage' },
  { id: 'springback', title: 'Springback', desc: 'Springback angle & correction factor', icon: '↩️', cat: 'Sheet Metal', path: '/calc/springback' },
  // CAE
  { id: 'vonmises', title: 'Von Mises Stress', desc: 'Principal stresses & Mohr\'s circle', icon: '🔬', cat: 'CAE', path: '/calc/vonmises' },
  { id: 'beam', title: 'Beam Deflection', desc: 'Simply supported & cantilever beams', icon: '📏', cat: 'CAE', path: '/calc/beam' },
  { id: 'nvh', title: 'Natural Frequency', desc: 'Spring-mass vibration & damping', icon: '〰️', cat: 'CAE', path: '/calc/nvh' },
  { id: 'reynolds', title: 'Reynolds Number', desc: 'Flow regime & transition analysis', icon: '🌊', cat: 'CAE', path: '/calc/reynolds' },
  { id: 'heat', title: 'Heat Transfer', desc: 'Conduction, convection & radiation', icon: '🔥', cat: 'CAE', path: '/calc/heat' },
];

const tabs = ['All', 'Hydraulics', 'Linkages', 'Sheet Metal', 'CAE'];
const tabColors = { All: '#00e5ff', Hydraulics: '#00e5ff', Linkages: '#7c4dff', 'Sheet Metal': '#ff6d00', CAE: '#00e676' };

export default function Dashboard() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return calculators.filter(c => {
      const matchTab = activeTab === 'All' || c.cat === activeTab;
      const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [activeTab, search]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className={`text-2xl md:text-3xl font-bold font-[var(--font-display)] mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Engineering Calculators
        </h1>
        <p className={`text-sm mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {calculators.length} interactive calculators with real-time animations
        </p>

        {/* Search */}
        <div className="relative max-w-lg mb-6">
          <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <input type="text" placeholder="Search calculators..." value={search} onChange={e => setSearch(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-2xl text-sm outline-none transition-all border
              ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-[var(--color-primary)] placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 focus:border-[var(--color-primary-dark)] placeholder-gray-400'}`} />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all
                ${activeTab === tab
                  ? 'text-white shadow-lg'
                  : isDark ? 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'
                }`}
              style={activeTab === tab ? { background: tabColors[tab], boxShadow: `0 4px 15px ${tabColors[tab]}40` } : {}}>
              {tab}
            </button>
          ))}
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((calc, i) => (
            <motion.div key={calc.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link to={calc.path} className="glass-card p-5 block group">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{calc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full`}
                        style={{ background: `${tabColors[calc.cat]}15`, color: tabColors[calc.cat] }}>
                        {calc.cat}
                      </span>
                    </div>
                    <h3 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{calc.title}</h3>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{calc.desc}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] group-hover:gap-2 transition-all">
                  Open Calculator <ArrowRight size={12} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className={`text-center py-20 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            No calculators found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
