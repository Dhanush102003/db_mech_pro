import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as C from '../../../utils/formulas/cae';

function FlowAnimation({ re, velocity }) {
  const canvasRef = useRef(null);
  const animRef = useRef(0);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    let frame = 0;
    const regime = C.flowRegime(re);

    const particles = Array.from({ length: 40 }, (_, i) => ({
      x: Math.random() * w,
      y: 80 + Math.random() * (h - 160),
      speed: 0.5 + Math.random() * 2,
      size: 2 + Math.random() * 2,
    }));

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      // Pipe walls
      const pipeTop = 70, pipeBot = h - 70;
      ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
      ctx.fillRect(0, pipeTop, w, pipeBot - pipeTop);
      ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, pipeTop); ctx.lineTo(w, pipeTop); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, pipeBot); ctx.lineTo(w, pipeBot); ctx.stroke();

      // Flow lines / particles
      const midY = (pipeTop + pipeBot) / 2;
      const pipeH = pipeBot - pipeTop;
      const vScale = Math.min(velocity / 5, 1);

      if (regime === 'Laminar') {
        // Smooth parallel streamlines
        for (let i = 0; i < 9; i++) {
          const ly = pipeTop + 15 + i * (pipeH - 30) / 8;
          const distFromCenter = Math.abs(ly - midY) / (pipeH / 2);
          const lineSpeed = (1 - distFromCenter * distFromCenter) * vScale * 3;
          ctx.beginPath();
          for (let x = 0; x < w; x += 3) {
            ctx.lineTo(x, ly);
          }
          ctx.strokeStyle = `rgba(0, 229, 255, ${0.3 + (1 - distFromCenter) * 0.4})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Arrow
          const ax = ((frame * lineSpeed * 2) % (w + 40)) - 20;
          ctx.beginPath();
          ctx.moveTo(ax, ly);
          ctx.lineTo(ax - 8, ly - 3);
          ctx.lineTo(ax - 8, ly + 3);
          ctx.closePath();
          ctx.fillStyle = '#00e5ff';
          ctx.fill();
        }
      } else if (regime === 'Turbulent') {
        // Chaotic particles
        particles.forEach(p => {
          p.x += p.speed * vScale * 3;
          p.y += Math.sin(frame * 0.1 + p.x * 0.05) * 2;
          if (p.x > w + 10) { p.x = -10; p.y = pipeTop + 15 + Math.random() * (pipeH - 30); }
          p.y = Math.max(pipeTop + 5, Math.min(pipeBot - 5, p.y));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = '#ef444480';
          ctx.fill();
        });
      } else {
        // Transitional - wavy lines
        for (let i = 0; i < 7; i++) {
          const ly = pipeTop + 20 + i * (pipeH - 40) / 6;
          ctx.beginPath();
          for (let x = 0; x < w; x += 2) {
            const wave = Math.sin((x + frame * vScale * 2) * 0.03 + i) * (5 + i * 2);
            ctx.lineTo(x, ly + wave);
          }
          ctx.strokeStyle = '#ffab0060';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Regime badge
      const colors = { Laminar: '#00e676', Transitional: '#ffab00', Turbulent: '#ff1744' };
      ctx.fillStyle = colors[regime] + '20';
      ctx.beginPath();
      ctx.roundRect(w / 2 - 55, 15, 110, 28, 14);
      ctx.fill();
      ctx.fillStyle = colors[regime];
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(regime.toUpperCase(), w / 2, 34);

      // Re value
      ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillText(`Re = ${Math.round(re).toLocaleString()}`, w / 2, h - 15);

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [re, velocity, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function ReynoldsNumber() {
  const [velocity, setVelocity] = useState(2);
  const [diameter, setDiameter] = useState(25);
  const [fluid, setFluid] = useState('Water (20°C)');
  const { isDark } = useTheme();

  const props = C.fluidProperties[fluid];
  const re = C.reynoldsKinematic(velocity, diameter / 1000, props.nu);
  const regime = C.flowRegime(re);

  return (
    <CalculatorLayout
      title="Reynolds Number Calculator"
      description="Calculate Reynolds number and visualize flow regime transitions with animated fluid flow"
      formula="Re = v × D / ν"
      inputs={<>
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Fluid</label>
          <select value={fluid} onChange={e => setFluid(e.target.value)} className="input-field text-sm">
            {Object.keys(C.fluidProperties).map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <CalcSlider label="Flow Velocity" value={velocity} onChange={setVelocity} min={0.01} max={20} step={0.1} unit="m/s" />
        <CalcSlider label="Pipe Diameter" value={diameter} onChange={setDiameter} min={1} max={200} step={1} unit="mm" />
      </>}
      results={<>
        <ResultRow label="Reynolds Number" value={Math.round(re)} />
        <ResultRow label="Flow Regime" value={regime}
          status={regime === 'Laminar' ? { text: '✅', cls: 'status-ok' } : regime === 'Turbulent' ? { text: '🌊', cls: 'status-fail' } : { text: '⚠️', cls: 'status-warn' }} />
        <ResultRow label="Density (ρ)" value={props.rho} unit="kg/m³" />
        <ResultRow label="Kin. Viscosity (ν)" value={(props.nu * 1e6).toFixed(3)} unit="×10⁻⁶ m²/s" />
        <ResultRow label="Dyn. Viscosity (μ)" value={(props.mu * 1000).toFixed(3)} unit="mPa·s" />
      </>}
    >
      <FlowAnimation re={re} velocity={velocity} />
    </CalculatorLayout>
  );
}
