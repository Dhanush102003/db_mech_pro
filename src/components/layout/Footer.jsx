import { useTheme } from '../../context/ThemeContext';
import { Calculator } from 'lucide-react';

export default function Footer() {
  const { isDark } = useTheme();

  return (
    <footer className={`border-t ${isDark ? 'border-white/5 bg-[#060a14]' : 'border-gray-200 bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
                <Calculator size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold font-[var(--font-display)]">
                <span className="glow-text">Mech</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>Calc</span>
                <span className="text-[var(--color-accent)] text-xs ml-0.5">PRO</span>
              </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Interactive mechanical engineering calculators with real-time dynamic animations. Built for engineers, by engineers.
            </p>
          </div>

          <div>
            <h3 className={`font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Modules</h3>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <li>Hydraulics & Fluid Systems</li>
              <li>Linkages & Mechanisms</li>
              <li>Sheet Metal Design</li>
              <li>CAE — FEA, NVH, CFD</li>
            </ul>
          </div>

          <div>
            <h3 className={`font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>About</h3>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <li>Engineering Accuracy Verified</li>
              <li>Real-time Animated Simulations</li>
              <li>Dark & Light Modes</li>
              <li>Fully Responsive</li>
            </ul>
          </div>
        </div>

        <div className={`mt-8 pt-8 border-t text-center text-sm ${isDark ? 'border-white/5 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
          © {new Date().getFullYear()} MechCalc Pro. All rights reserved. Built with ⚙️ for Engineers.
        </div>
      </div>
    </footer>
  );
}
