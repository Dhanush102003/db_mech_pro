import { useTheme } from '../../context/ThemeContext';

export default function CalcSlider({ label, value, onChange, min, max, step = 1, unit = '' }) {
  const { isDark } = useTheme();
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            onChange={e => onChange(parseFloat(e.target.value) || 0)}
            min={min}
            max={max}
            step={step}
            className={`w-20 text-right text-sm font-mono px-2 py-1 rounded-lg border outline-none transition-all
              ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-[var(--color-primary)]' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[var(--color-primary-dark)]'}`}
          />
          {unit && <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{unit}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${pct}%, ${isDark ? '#1e293b' : '#e2e8f0'} ${pct}%, ${isDark ? '#1e293b' : '#e2e8f0'} 100%)`,
        }}
      />
    </div>
  );
}
