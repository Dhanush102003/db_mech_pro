import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as C from '../../../utils/formulas/cae';

function SpringMassAnimation({ fn, zeta, amplitude }) {
  const canvasRef = useRef(null);
  const animRef = useRef(0);
  const timeRef = useRef(0);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    const cx = w / 2;

    const draw = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      ctx.clearRect(0, 0, w, h);

      // Displacement
      const pos = C.springMassPosition(amplitude, fn, zeta, t);
      const equilibrium = h * 0.5;
      const massY = equilibrium + pos * 1.5;

      // Fixed top
      ctx.fillStyle = isDark ? '#334155' : '#cbd5e1';
      ctx.fillRect(cx - 40, 20, 80, 8);
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(cx - 35 + i * 18, 20);
        ctx.lineTo(cx - 42 + i * 18, 10);
        ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Spring
      const springTop = 28;
      const springBot = massY - 20;
      const coils = 8;
      const coilW = 15;
      ctx.beginPath();
      ctx.moveTo(cx, springTop);
      for (let i = 0; i <= coils; i++) {
        const t2 = i / coils;
        const y = springTop + t2 * (springBot - springTop);
        const x = cx + (i % 2 === 0 ? -coilW : coilW);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(cx, springBot);
      ctx.strokeStyle = isDark ? '#00e5ff' : '#0088aa';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Damper (right side)
      const dampX = cx + 40;
      ctx.beginPath();
      ctx.moveTo(dampX, springTop);
      ctx.lineTo(dampX, springBot - 20);
      ctx.strokeStyle = isDark ? '#7c4dff' : '#6d28d9';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeRect(dampX - 8, springBot - 20, 16, 25);
      ctx.beginPath();
      ctx.moveTo(dampX, springBot + 5);
      ctx.lineTo(dampX, massY - 20);
      ctx.stroke();

      // Mass
      ctx.beginPath();
      ctx.roundRect(cx - 25, massY - 18, 50, 36, 6);
      ctx.fillStyle = isDark ? '#1e3a5f' : '#bfdbfe';
      ctx.fill();
      ctx.strokeStyle = isDark ? '#3b82f6' : '#2563eb';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = isDark ? '#ffffff' : '#1e293b';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('m', cx, massY + 4);

      // Equilibrium line
      ctx.beginPath();
      ctx.moveTo(30, equilibrium);
      ctx.lineTo(w - 30, equilibrium);
      ctx.strokeStyle = isDark ? '#ffffff20' : '#00000010';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Displacement graph (bottom)
      const graphY = h - 60;
      const graphH = 40;
      const graphW = w - 60;
      ctx.beginPath();
      ctx.moveTo(30, graphY);
      ctx.lineTo(30 + graphW, graphY);
      ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      for (let i = 0; i <= graphW; i++) {
        const gt = (i / graphW) * 3;
        const gv = C.springMassPosition(amplitude, fn, zeta, t - 3 + gt);
        const gy = graphY - (gv / amplitude) * graphH;
        if (i === 0) ctx.moveTo(30 + i, gy);
        else ctx.lineTo(30 + i, gy);
      }
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Labels
      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.font = '8px Inter';
      ctx.textAlign = 'left';
      ctx.fillText('k', cx - 35, (springTop + springBot) / 2);
      ctx.fillText('c', dampX + 12, (springTop + springBot) / 2);

      ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
      ctx.font = '9px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`f = ${fn.toFixed(2)} Hz  |  ζ = ${zeta.toFixed(2)}`, w / 2, h - 5);

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [fn, zeta, amplitude, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function NaturalFrequency() {
  const [stiffness, setStiffness] = useState(5000);
  const [mass, setMass] = useState(10);
  const [damping, setDamping] = useState(20);
  const [amplitude, setAmplitude] = useState(30);

  const fn = C.naturalFrequency(stiffness, mass);
  const cc = C.criticalDamping(stiffness, mass);
  const zeta = C.dampingRatio(damping, cc);
  const fd = zeta < 1 ? C.dampedFrequency(fn, zeta) : 0;
  const period = fn > 0 ? 1 / fn : 0;

  return (
    <CalculatorLayout
      title="Natural Frequency & Vibration"
      description="Spring-mass-damper system with animated oscillation showing damped response"
      formula="f_n = (1/2π) × √(k/m)  |  ζ = c / (2√km)"
      inputs={<>
        <CalcSlider label="Spring Stiffness (k)" value={stiffness} onChange={setStiffness} min={100} max={50000} step={100} unit="N/m" />
        <CalcSlider label="Mass (m)" value={mass} onChange={setMass} min={0.5} max={100} step={0.5} unit="kg" />
        <CalcSlider label="Damping (c)" value={damping} onChange={setDamping} min={0} max={500} step={1} unit="Ns/m" />
        <CalcSlider label="Amplitude" value={amplitude} onChange={setAmplitude} min={5} max={80} step={1} unit="mm" />
      </>}
      results={<>
        <ResultRow label="Natural Frequency" value={fn} unit="Hz" />
        <ResultRow label="Damped Frequency" value={fd} unit="Hz" />
        <ResultRow label="Damping Ratio (ζ)" value={zeta}
          status={zeta < 1 ? { text: 'Underdamped', cls: 'status-ok' } : zeta === 1 ? { text: 'Critical', cls: 'status-warn' } : { text: 'Overdamped', cls: 'status-fail' }} />
        <ResultRow label="Critical Damping" value={cc} unit="Ns/m" />
        <ResultRow label="Period" value={period * 1000} unit="ms" />
        <ResultRow label="ω_n" value={fn * 2 * Math.PI} unit="rad/s" />
      </>}
    >
      <SpringMassAnimation fn={fn} zeta={zeta} amplitude={amplitude} />
    </CalculatorLayout>
  );
}
