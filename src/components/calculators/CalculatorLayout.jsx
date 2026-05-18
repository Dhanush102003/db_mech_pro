import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function CalculatorLayout({ title, description, formula, children, inputs, results }) {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link to="/dashboard" className={`inline-flex items-center gap-1.5 text-sm mb-6 transition-colors ${isDark ? 'text-gray-400 hover:text-[var(--color-primary)]' : 'text-gray-500 hover:text-[var(--color-primary-dark)]'}`}>
          <ArrowLeft size={14} /> Back to Calculators
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-2xl md:text-3xl font-bold font-[var(--font-display)] mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
        </div>

        {/* Formula display */}
        {formula && (
          <div className={`glass-card px-5 py-4 mb-6 font-mono text-sm ${isDark ? 'text-[var(--color-primary)]' : 'text-[var(--color-primary-dark)]'}`}>
            <span className={`text-xs font-sans font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Formula</span>
            <div className="mt-1">{formula}</div>
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs sidebar */}
          <div className="lg:col-span-3">
            <div className="glass-card p-5 space-y-5 sticky top-24">
              <h2 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Inputs</h2>
              {inputs}
            </div>
          </div>

          {/* Animation / Visualization */}
          <div className="lg:col-span-5">
            <div className="glass-card p-4 overflow-hidden" style={{ minHeight: 380 }}>
              {children}
            </div>
          </div>

          {/* Results panel */}
          <div className="lg:col-span-4">
            <div className="glass-card p-5 space-y-4 sticky top-24">
              <h2 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Results</h2>
              {results}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Reusable result row */
export function ResultRow({ label, value, unit, status }) {
  const { isDark } = useTheme();
  return (
    <div className={`flex items-center justify-between py-2 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-mono font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {typeof value === 'number' ? value.toFixed(2) : value}
        </span>
        {unit && <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{unit}</span>}
        {status && <span className={`text-xs font-medium ${status.cls}`}>{status.text}</span>}
      </div>
    </div>
  );
}
