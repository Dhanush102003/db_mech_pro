import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wrench } from 'lucide-react';

export default function ComingSoon({ title, category }) {
  const { isDark } = useTheme();
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <Link to="/dashboard" className={`inline-flex items-center gap-1.5 text-sm mb-8 transition-colors ${isDark ? 'text-gray-400 hover:text-[var(--color-primary)]' : 'text-gray-500 hover:text-[var(--color-primary-dark)]'}`}>
          <ArrowLeft size={14} /> Back to Calculators
        </Link>
        <div className="glass-card p-12">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-6">
            <Wrench size={28} className="text-[var(--color-primary)]" />
          </div>
          <h1 className={`text-2xl font-bold font-[var(--font-display)] mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
          <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{category}</p>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            This calculator is under active development. Full interactive animation coming soon!
          </p>
          <div className="mt-8 animate-pulse-glow inline-block px-6 py-2 rounded-full text-xs font-semibold text-[var(--color-primary)] border border-[var(--color-primary)]/30">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
}
