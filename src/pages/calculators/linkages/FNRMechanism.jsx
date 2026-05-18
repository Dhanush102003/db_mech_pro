import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as L from '../../../utils/formulas/linkages';

function FNRAnimation({ angle, discDiameter, connectionRadius }) {
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
    const cx = w / 2, cy = h / 2;
    const scale = 3;
    const r = (discDiameter / 2) * scale;
    const cr = connectionRadius * scale;
    const angleRad = L.degToRad(angle);

    ctx.clearRect(0, 0, w, h);

    // Reference circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Disc
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#1e3a5f40' : '#bfdbfe40';
    ctx.fill();
    ctx.strokeStyle = isDark ? '#00e5ff60' : '#0088aa60';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#00e5ff' : '#0088aa';
    ctx.fill();

    // Zero reference line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r + 10, cy);
    ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Rotated connection point
    const px = cx + cr * Math.cos(angleRad);
    const py = cy - cr * Math.sin(angleRad);

    // Angle arc
    if (Math.abs(angle) > 0.1) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.4, 0, -angleRad, angle > 0);
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Angle label
      ctx.fillStyle = '#00e5ff';
      ctx.font = 'bold 12px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`${angle.toFixed(1)}°`, cx + r * 0.5 * Math.cos(-angleRad / 2), cy + r * 0.5 * Math.sin(-angleRad / 2) - 5);
    }

    // Rotation line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = '#7c4dff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Connection point
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#7c4dff';
    ctx.fill();
    ctx.strokeStyle = isDark ? '#fff' : '#000';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Labels
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('FNR DISC', cx, cy + r + 25);
    ctx.fillText(`Ø${discDiameter}mm`, cx, cy + r + 38);

    // F-N-R zone markers
    const zones = [
      { label: 'F', angle: 20, color: '#00e676' },
      { label: 'N', angle: 0, color: '#ffab00' },
      { label: 'R', angle: -20, color: '#ff1744' },
    ];
    zones.forEach(z => {
      const za = L.degToRad(z.angle);
      const zx = cx + (r + 20) * Math.cos(za);
      const zy = cy - (r + 20) * Math.sin(za);
      ctx.fillStyle = z.color;
      ctx.font = 'bold 11px Inter';
      ctx.fillText(z.label, zx, zy + 4);
    });
  }, [angle, discDiameter, connectionRadius, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function FNRMechanism() {
  const [discDia, setDiscDia] = useState(40);
  const [linearMotion, setLinearMotion] = useState(10);
  const [connRadius, setConnRadius] = useState(15);
  const [targetAngle, setTargetAngle] = useState(20);

  const actualAngle = L.rotationAngleDeg(linearMotion, connRadius);
  const error = L.angleError(actualAngle, targetAngle);
  const reqRadius = L.requiredRadius(linearMotion, targetAngle);

  return (
    <CalculatorLayout
      title="FNR Mechanism Calculator"
      description="Forward-Neutral-Reverse lever rotation angle calculator with animated disc visualization"
      formula="θ° = (Arc Length / Radius) × 180 / π"
      inputs={<>
        <CalcSlider label="Disc Diameter" value={discDia} onChange={setDiscDia} min={20} max={100} step={1} unit="mm" />
        <CalcSlider label="Linear Motion" value={linearMotion} onChange={setLinearMotion} min={1} max={30} step={0.5} unit="mm" />
        <CalcSlider label="Connection Radius" value={connRadius} onChange={setConnRadius} min={3} max={50} step={0.5} unit="mm" />
        <CalcSlider label="Target Angle" value={targetAngle} onChange={setTargetAngle} min={5} max={45} step={1} unit="°" />
      </>}
      results={<>
        <ResultRow label="Disc Radius" value={discDia / 2} unit="mm" />
        <ResultRow label="Arc Length" value={linearMotion} unit="mm" />
        <ResultRow label="Actual Angle" value={actualAngle} unit="°" />
        <ResultRow label="Target Angle" value={targetAngle} unit="°" />
        <ResultRow label="Error" value={error} unit="%" status={error < 10 ? { text: '✅', cls: 'status-ok' } : { text: '⚠️', cls: 'status-warn' }} />
        <ResultRow label="Required Radius for Target" value={reqRadius} unit="mm" />
      </>}
    >
      <FNRAnimation angle={actualAngle} discDiameter={discDia} connectionRadius={connRadius} />
    </CalculatorLayout>
  );
}
