import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AnimatedBackground from '../ui/AnimatedBackground';

export default function SimulatorLayout({ title, description, children, sidebar, toolbar, readout }) {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen pt-16 relative">
      <AnimatedBackground particleCount={35} />
      <div className="relative z-10">
        {/* Top bar */}
        <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? 'border-white/5 bg-[var(--color-surface-dark)]/80' : 'border-gray-100 bg-white/80'} backdrop-blur-xl`}>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className={`inline-flex items-center gap-1.5 text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-[var(--color-primary)]' : 'text-gray-500 hover:text-[var(--color-primary-dark)]'}`}>
              <ArrowLeft size={14} /> Back
            </Link>
            <div>
              <h1 className={`text-lg font-bold font-[var(--font-display)] ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
              {description && <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{description}</p>}
            </div>
          </div>
          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>

        {/* Main content area */}
        <div className="flex" style={{ height: 'calc(100vh - 112px)' }}>
          {/* Left sidebar */}
          {sidebar && (
            <div className={`w-64 flex-shrink-0 overflow-y-auto border-r ${isDark ? 'border-white/5 bg-[var(--color-surface-dark)]/60' : 'border-gray-100 bg-white/60'} backdrop-blur-md`}>
              {sidebar}
            </div>
          )}

          {/* Canvas area */}
          <div className="flex-1 relative overflow-hidden circuit-grid">
            {children}
          </div>

          {/* Right readout panel */}
          {readout && (
            <div className={`w-72 flex-shrink-0 overflow-y-auto border-l ${isDark ? 'border-white/5 bg-[var(--color-surface-dark)]/60' : 'border-gray-100 bg-white/60'} backdrop-blur-md p-4`}>
              {readout}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
