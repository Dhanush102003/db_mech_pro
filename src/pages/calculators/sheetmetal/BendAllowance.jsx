import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as SM from '../../../utils/formulas/sheetmetal';

function BendAnimation({ angle, radius, thickness, ba }) {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2 + 20;
    const scale = 1.5;
    const r = Math.max(radius * scale, 8);
    const t = Math.max(thickness * scale, 4);
    const legLen = 80;
    const angleRad = (angle * Math.PI) / 180;

    // Flat leg (left)
    ctx.beginPath();
    ctx.moveTo(cx - legLen, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + t);
    ctx.lineTo(cx - legLen, cy + t);
    ctx.closePath();
    ctx.fillStyle = isDark ? '#334155' : '#94a3b8';
    ctx.fill();
    ctx.strokeStyle = isDark ? '#64748b' : '#475569';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Bent portion
    const bendCx = cx;
    const bendCy = cy - r;
    ctx.save();
    ctx.translate(bendCx, bendCy + r);

    // Outer arc
    ctx.beginPath();
    ctx.arc(0, -r, r + t, Math.PI / 2, Math.PI / 2 - angleRad, true);
    ctx.strokeStyle = isDark ? '#64748b' : '#475569';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner arc
    ctx.beginPath();
    ctx.arc(0, -r, r, Math.PI / 2, Math.PI / 2 - angleRad, true);
    ctx.stroke();

    // Bent leg
    const endAngle = Math.PI / 2 - angleRad;
    const ex = (r + t / 2) * Math.cos(endAngle);
    const ey = -r + (r + t / 2) * Math.sin(endAngle);
    const dx = Math.cos(endAngle - Math.PI / 2);
    const dy = Math.sin(endAngle - Math.PI / 2);

    const outerX = (r + t) * Math.cos(endAngle);
    const outerY = -r + (r + t) * Math.sin(endAngle);
    const innerX = r * Math.cos(endAngle);
    const innerY = -r + r * Math.sin(endAngle);

    ctx.beginPath();
    ctx.moveTo(innerX, innerY);
    ctx.lineTo(innerX + dx * legLen, innerY + dy * legLen);
    ctx.lineTo(outerX + dx * legLen, outerY + dy * legLen);
    ctx.lineTo(outerX, outerY);
    ctx.closePath();
    ctx.fillStyle = isDark ? '#334155' : '#94a3b8';
    ctx.fill();
    ctx.strokeStyle = isDark ? '#64748b' : '#475569';
    ctx.stroke();

    // Neutral axis (dashed)
    ctx.beginPath();
    ctx.arc(0, -r, r + t * 0.41, Math.PI / 2, Math.PI / 2 - angleRad, true);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();

    // Dimension: bend angle arc
    ctx.beginPath();
    const dimR = r + t + 25;
    ctx.arc(cx, cy - r, dimR, Math.PI / 2, Math.PI / 2 - angleRad, true);
    ctx.strokeStyle = '#7c4dff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#7c4dff';
    ctx.font = 'bold 11px JetBrains Mono';
    ctx.textAlign = 'center';
    const labelAngle = Math.PI / 2 - angleRad / 2;
    ctx.fillText(`${angle}°`, cx + (dimR + 12) * Math.cos(labelAngle), cy - r + (dimR + 12) * Math.sin(labelAngle) * -1 + 4);

    // Labels
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(`R = ${radius}mm`, cx + 30, cy - r - 5);
    ctx.fillText(`T = ${thickness}mm`, cx - legLen / 2, cy + t + 15);

    // BA value
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 11px JetBrains Mono';
    ctx.fillText(`BA = ${ba.toFixed(2)}mm`, cx, h - 15);
  }, [angle, radius, thickness, ba, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function BendAllowance() {
  const [thickness, setThickness] = useState(2);
  const [radius, setRadius] = useState(3);
  const [angle, setAngle] = useState(90);
  const [material, setMaterial] = useState('Mild Steel');
  const [leg1, setLeg1] = useState(50);
  const [leg2, setLeg2] = useState(50);
  const { isDark } = useTheme();

  const kf = SM.kFactorFromMaterial(material);
  const ba = SM.bendAllowance(angle, radius, thickness, kf);
  const bd = SM.bendDeduction(angle, radius, thickness, kf);
  const ossb = SM.outsideSetback(angle, radius, thickness);
  const flatLen = SM.flatPatternLength(leg1, leg2, angle, radius, thickness, kf);

  return (
    <CalculatorLayout
      title="Bend Allowance Calculator"
      description="Calculate bend allowance, bend deduction, K-factor and flat pattern length with animated bending visualization"
      formula="BA = (π/180) × Angle × (R + K × T)"
      inputs={<>
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Material</label>
          <select value={material} onChange={e => setMaterial(e.target.value)} className="input-field text-sm">
            {SM.materials.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <CalcSlider label="Thickness" value={thickness} onChange={setThickness} min={0.5} max={20} step={0.1} unit="mm" />
        <CalcSlider label="Bend Radius" value={radius} onChange={setRadius} min={0.5} max={50} step={0.5} unit="mm" />
        <CalcSlider label="Bend Angle" value={angle} onChange={setAngle} min={1} max={180} step={1} unit="°" />
        <CalcSlider label="Leg 1" value={leg1} onChange={setLeg1} min={5} max={200} step={1} unit="mm" />
        <CalcSlider label="Leg 2" value={leg2} onChange={setLeg2} min={5} max={200} step={1} unit="mm" />
      </>}
      results={<>
        <ResultRow label="K-Factor" value={kf} />
        <ResultRow label="Bend Allowance" value={ba} unit="mm" />
        <ResultRow label="Bend Deduction" value={bd} unit="mm" />
        <ResultRow label="Outside Setback" value={ossb} unit="mm" />
        <ResultRow label="Flat Pattern Length" value={flatLen} unit="mm" />
        <ResultRow label="R/T Ratio" value={radius / thickness} status={radius / thickness >= 1 ? { text: '✅ OK', cls: 'status-ok' } : { text: '⚠️ Risk', cls: 'status-warn' }} />
      </>}
    >
      <BendAnimation angle={angle} radius={radius} thickness={thickness} ba={ba} />
    </CalculatorLayout>
  );
}
