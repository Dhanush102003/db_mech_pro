import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as C from '../../../utils/formulas/cae';

function HeatAnimation({ mode, Q, Ts, Tsurr }) {
  const canvasRef = useRef(null);
  const animRef = useRef(0);
  const { isDark } = useTheme();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const Hc = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = Hc / 2;
    let frame = 0;

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const qAbs = Math.abs(Q);
      const qScale = Math.min(qAbs / 500, 1);

      if (mode === 'conduction') {
        // Wall with temperature gradient
        const wallW = 80, wallH = 150;
        const gradient = ctx.createLinearGradient(cx - wallW / 2, 0, cx + wallW / 2, 0);
        gradient.addColorStop(0, '#ef4444');
        gradient.addColorStop(1, '#3b82f6');
        ctx.fillStyle = gradient;
        ctx.fillRect(cx - wallW / 2, cy - wallH / 2, wallW, wallH);
        ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - wallW / 2, cy - wallH / 2, wallW, wallH);

        // Heat arrows
        for (let i = 0; i < 5; i++) {
          const ay = cy - wallH / 2 + 20 + i * 28;
          const ax = cx - wallW / 2 - 10 - ((frame * qScale + i * 15) % 40);
          ctx.beginPath();
          ctx.moveTo(ax + 12, ay);
          ctx.lineTo(ax, ay - 4);
          ctx.lineTo(ax, ay + 4);
          ctx.closePath();
          ctx.fillStyle = '#ef444480';
          ctx.fill();
        }

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`${Ts}°C`, cx - wallW / 2 - 25, cy - 5);
        ctx.fillStyle = '#3b82f6';
        ctx.fillText(`${Tsurr}°C`, cx + wallW / 2 + 25, cy - 5);
        ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
        ctx.font = '9px Inter';
        ctx.fillText('CONDUCTION', cx, cy + wallH / 2 + 20);
      } else if (mode === 'convection') {
        // Surface with flowing air
        ctx.fillStyle = isDark ? '#334155' : '#94a3b8';
        ctx.fillRect(cx - 60, cy, 120, 20);
        // Warm surface color
        ctx.fillStyle = '#ef4444' + Math.round(qScale * 200 + 55).toString(16);
        ctx.fillRect(cx - 60, cy, 120, 5);

        // Air flow arrows
        for (let i = 0; i < 12; i++) {
          const px = ((frame * 1 + i * 30) % (w - 20)) + 10;
          const py = cy - 15 - Math.random() * 40;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px - 6, py - 2);
          ctx.lineTo(px - 6, py + 2);
          ctx.closePath();
          ctx.fillStyle = '#00e5ff30';
          ctx.fill();
        }
        // Rising heat waves
        for (let i = 0; i < 6; i++) {
          const wx = cx - 50 + i * 20;
          const wy = cy - 5 - ((frame * 0.5 + i * 10) % 60);
          ctx.beginPath();
          ctx.arc(wx + Math.sin(frame * 0.05 + i) * 5, wy, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#ef444440';
          ctx.fill();
        }
        ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
        ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('CONVECTION', cx, cy + 40);
      } else {
        // Radiation — wavy lines emanating
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444' + Math.round(qScale * 200 + 55).toString(16);
        ctx.fill();

        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + frame * 0.02;
          for (let r = 40; r < 40 + qScale * 60; r += 12) {
            const rx = cx + Math.cos(angle) * r;
            const ry = cy + Math.sin(angle) * r;
            ctx.beginPath();
            ctx.arc(rx, ry, 2 - (r - 40) * 0.02, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(239, 68, 68, ${0.6 - (r - 40) * 0.008})`;
            ctx.fill();
          }
        }
        ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
        ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('RADIATION', cx, cy + 70);
      }

      // Q value
      ctx.fillStyle = isDark ? '#ffffff90' : '#1e293b90';
      ctx.font = 'bold 12px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`Q = ${qAbs.toFixed(1)} W`, cx, h - 15);

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [mode, Q, Ts, Tsurr, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function HeatTransfer() {
  const [mode, setMode] = useState('conduction');
  const [k, setK] = useState(50);
  const [h, setH] = useState(25);
  const [eps, setEps] = useState(0.9);
  const [area, setArea] = useState(1);
  const [Ts, setTs] = useState(100);
  const [Tsurr, setTsurr] = useState(25);
  const [length, setLength] = useState(0.01);
  const { isDark } = useTheme();

  const dT = Ts - Tsurr;
  let Q;
  if (mode === 'conduction') Q = C.conduction(k, area, dT, length);
  else if (mode === 'convection') Q = C.convection(h, area, dT);
  else Q = C.radiation(eps, area, Ts + 273.15, Tsurr + 273.15);

  const R = mode === 'conduction' ? C.thermalResistanceConduction(length, k, area)
    : mode === 'convection' ? C.thermalResistanceConvection(h, area) : 0;

  return (
    <CalculatorLayout title="Heat Transfer Calculator"
      description="Conduction, convection and radiation calculations with animated heat flow"
      formula={mode === 'conduction' ? "Q = kAΔT/L" : mode === 'convection' ? "Q = hA(Ts-T∞)" : "Q = εσA(Ts⁴-Tsurr⁴)"}
      inputs={<>
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Mode</label>
          <select value={mode} onChange={e => setMode(e.target.value)} className="input-field text-sm">
            <option value="conduction">Conduction</option>
            <option value="convection">Convection</option>
            <option value="radiation">Radiation</option>
          </select>
        </div>
        {mode === 'conduction' && <CalcSlider label="Conductivity (k)" value={k} onChange={setK} min={0.1} max={400} step={1} unit="W/mK" />}
        {mode === 'convection' && <CalcSlider label="Conv. Coeff (h)" value={h} onChange={setH} min={1} max={500} step={1} unit="W/m²K" />}
        {mode === 'radiation' && <CalcSlider label="Emissivity (ε)" value={eps} onChange={setEps} min={0.01} max={1} step={0.01} />}
        <CalcSlider label="Area" value={area} onChange={setArea} min={0.01} max={10} step={0.01} unit="m²" />
        <CalcSlider label="Surface Temp" value={Ts} onChange={setTs} min={0} max={1000} step={5} unit="°C" />
        <CalcSlider label="Surrounding Temp" value={Tsurr} onChange={setTsurr} min={-20} max={500} step={5} unit="°C" />
        {mode === 'conduction' && <CalcSlider label="Thickness (L)" value={length} onChange={setLength} min={0.001} max={1} step={0.001} unit="m" />}
      </>}
      results={<>
        <ResultRow label="Heat Transfer (Q)" value={Q} unit="W" />
        <ResultRow label="Q (kW)" value={Q / 1000} unit="kW" />
        <ResultRow label="ΔT" value={dT} unit="°C" />
        {R > 0 && <ResultRow label="Thermal Resistance" value={R} unit="K/W" />}
        <ResultRow label="Heat Flux" value={area > 0 ? Q / area : 0} unit="W/m²" />
      </>}
    >
      <HeatAnimation mode={mode} Q={Q} Ts={Ts} Tsurr={Tsurr} />
    </CalculatorLayout>
  );
}
