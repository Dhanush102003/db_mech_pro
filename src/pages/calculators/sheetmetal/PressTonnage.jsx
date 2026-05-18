import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as SM from '../../../utils/formulas/sheetmetal';

function PressAnimation({ forceKN, thickness, dieOpening }) {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const Hc = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = Hc / 2;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2, baseY = h * 0.7;
    const dieW = Math.max(60, dieOpening * 3);
    const punchW = dieW * 0.4;
    const t = Math.max(thickness * 3, 4);

    // Die (V-shape)
    ctx.beginPath();
    ctx.moveTo(cx - dieW, baseY);
    ctx.lineTo(cx, baseY + dieW * 0.5);
    ctx.lineTo(cx + dieW, baseY);
    ctx.lineTo(cx + dieW, baseY + 30);
    ctx.lineTo(cx - dieW, baseY + 30);
    ctx.closePath();
    ctx.fillStyle = isDark ? '#334155' : '#94a3b8';
    ctx.fill();
    ctx.strokeStyle = isDark ? '#475569' : '#64748b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // V-opening dimension
    ctx.fillStyle = '#7c4dff';
    ctx.font = '8px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`V = ${dieOpening}mm`, cx, baseY + 45);

    // Punch (coming from top)
    const punchBot = baseY - t - 8;
    ctx.beginPath();
    ctx.moveTo(cx - punchW, 30);
    ctx.lineTo(cx - punchW, punchBot);
    ctx.lineTo(cx, punchBot + punchW * 0.4);
    ctx.lineTo(cx + punchW, punchBot);
    ctx.lineTo(cx + punchW, 30);
    ctx.closePath();
    ctx.fillStyle = isDark ? '#1e3a5f' : '#bfdbfe';
    ctx.fill();
    ctx.strokeStyle = isDark ? '#3b82f6' : '#2563eb';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Sheet metal in bend
    const bendAngle = Math.min(30, forceKN * 2);
    ctx.beginPath();
    ctx.moveTo(cx - dieW * 0.8, baseY - 5);
    ctx.lineTo(cx, baseY - 5 + bendAngle);
    ctx.lineTo(cx + dieW * 0.8, baseY - 5);
    ctx.strokeStyle = '#ffab00';
    ctx.lineWidth = t;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Force arrow
    ctx.beginPath();
    ctx.moveTo(cx, 15);
    ctx.lineTo(cx, 28);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, 30);
    ctx.lineTo(cx - 6, 20);
    ctx.lineTo(cx + 6, 20);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 11px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`${forceKN.toFixed(1)} kN`, cx, 12);

    // Tonnage
    ctx.fillStyle = isDark ? '#ffffff90' : '#1e293b90';
    ctx.font = 'bold 12px JetBrains Mono';
    ctx.fillText(`${SM.forceToTons(forceKN).toFixed(1)} tons`, cx, h - 10);
  }, [forceKN, thickness, dieOpening, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function PressTonnage() {
  const [thickness, setThickness] = useState(3);
  const [length, setLength] = useState(1000);
  const [material, setMaterial] = useState('Mild Steel');
  const [method, setMethod] = useState('air');
  const { isDark } = useTheme();

  const uts = SM.utsValues[material] || 400;
  const dieOpen = SM.recommendedDieOpening(thickness);
  const forceKN = SM.bendingForce(thickness, length, uts, dieOpen, method);
  const tons = SM.forceToTons(forceKN);

  return (
    <CalculatorLayout title="Press Tonnage Calculator"
      description="Bending force calculation for V-die and air bending with animated press brake"
      formula="F = (C × T² × L × UTS) / (V × 1000)"
      inputs={<>
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Material</label>
          <select value={material} onChange={e => setMaterial(e.target.value)} className="input-field text-sm">
            {SM.materials.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Method</label>
          <select value={method} onChange={e => setMethod(e.target.value)} className="input-field text-sm">
            <option value="air">Air Bending (C=1.33)</option>
            <option value="bottom">Bottom Bending (C=1.0)</option>
          </select>
        </div>
        <CalcSlider label="Sheet Thickness" value={thickness} onChange={setThickness} min={0.5} max={25} step={0.5} unit="mm" />
        <CalcSlider label="Bend Length" value={length} onChange={setLength} min={50} max={6000} step={50} unit="mm" />
      </>}
      results={<>
        <ResultRow label="UTS" value={uts} unit="MPa" />
        <ResultRow label="Die Opening (8×T)" value={dieOpen} unit="mm" />
        <ResultRow label="Bending Force" value={forceKN} unit="kN" />
        <ResultRow label="Tonnage" value={tons} unit="tons" />
        <ResultRow label="Method Factor" value={method === 'air' ? 1.33 : 1.0} />
      </>}
    >
      <PressAnimation forceKN={forceKN} thickness={thickness} dieOpening={dieOpen} />
    </CalculatorLayout>
  );
}
