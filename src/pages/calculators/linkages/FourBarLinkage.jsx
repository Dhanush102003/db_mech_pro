import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as L from '../../../utils/formulas/linkages';

function FourBarAnimation({ a, b, c, d, theta2 }) {
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

    const ox = w * 0.3, oy = h * 0.6;
    const scale = Math.min(w, h) / (Math.max(a, b, c, d) * 4);
    const result = L.fourBarAnalysis(a, b, c, d, theta2);

    // Ground link (fixed)
    const Dx = ox + d * scale;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(Dx, oy);
    ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Fixed pivots
    [{ x: ox, y: oy }, { x: Dx, y: oy }].forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#334155' : '#cbd5e1';
      ctx.fill();
      ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    if (result) {
      const Bx = ox + result.Bx * scale;
      const By = oy - result.By * scale;
      const Cx = ox + result.Cx * scale;
      const Cy = oy - result.Cy * scale;

      // Link 2 (input crank)
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(Bx, By);
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Link 3 (coupler)
      ctx.beginPath();
      ctx.moveTo(Bx, By);
      ctx.lineTo(Cx, Cy);
      ctx.strokeStyle = '#7c4dff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Link 4 (output)
      ctx.beginPath();
      ctx.moveTo(Dx, oy);
      ctx.lineTo(Cx, Cy);
      ctx.strokeStyle = '#00e676';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Moving pivots
      [{ x: Bx, y: By, c: '#00e5ff' }, { x: Cx, y: Cy, c: '#00e676' }].forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.fill();
      });

      // Angle labels
      ctx.fillStyle = '#00e5ff';
      ctx.font = '9px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(`θ2 = ${theta2.toFixed(1)}°`, ox + 10, oy + 20);
      ctx.fillStyle = '#00e676';
      ctx.fillText(`θ4 = ${result.theta4.toFixed(1)}°`, Dx + 10, oy + 20);
      ctx.fillStyle = '#7c4dff';
      ctx.fillText(`θ3 = ${result.theta3.toFixed(1)}°`, (Bx + Cx) / 2, Math.min(By, Cy) - 10);
    } else {
      ctx.fillStyle = '#ff1744';
      ctx.font = 'bold 14px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('No valid configuration', w / 2, h / 2 - 30);
      ctx.font = '10px Inter';
      ctx.fillText('Grashof condition not met at this angle', w / 2, h / 2 - 10);
    }

    // Legend
    ctx.font = '8px Inter';
    ctx.textAlign = 'left';
    const ly = h - 35;
    [{ label: `a (crank) = ${a}`, color: '#00e5ff' },
     { label: `b (coupler) = ${b}`, color: '#7c4dff' },
     { label: `c (rocker) = ${c}`, color: '#00e676' },
     { label: `d (ground) = ${d}`, color: isDark ? '#475569' : '#94a3b8' }]
      .forEach((item, i) => {
        ctx.fillStyle = item.color;
        ctx.fillRect(10 + i * 85, ly, 12, 3);
        ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
        ctx.fillText(item.label, 26 + i * 85, ly + 4);
      });
  }, [a, b, c, d, theta2, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function FourBarLinkage() {
  const [a, setA] = useState(30);
  const [b, setB] = useState(70);
  const [c, setC] = useState(50);
  const [d, setD] = useState(60);
  const [theta2, setTheta2] = useState(45);

  const result = L.fourBarAnalysis(a, b, c, d, theta2);
  const sArr = [a, b, c, d].sort((x, y) => x - y);
  const grashof = sArr[0] + sArr[3] <= sArr[1] + sArr[2];

  return (
    <CalculatorLayout
      title="4-Bar Linkage Simulator"
      description="Interactive four-bar linkage position analysis using Freudenstein equation"
      formula="Freudenstein: K1cos(θ4) - K2cos(θ2) + K3 = cos(θ2 - θ4)"
      inputs={<>
        <CalcSlider label="Link a (crank)" value={a} onChange={setA} min={10} max={100} step={1} unit="mm" />
        <CalcSlider label="Link b (coupler)" value={b} onChange={setB} min={10} max={150} step={1} unit="mm" />
        <CalcSlider label="Link c (rocker)" value={c} onChange={setC} min={10} max={100} step={1} unit="mm" />
        <CalcSlider label="Link d (ground)" value={d} onChange={setD} min={10} max={120} step={1} unit="mm" />
        <CalcSlider label="Input Angle (θ2)" value={theta2} onChange={setTheta2} min={0} max={360} step={1} unit="°" />
      </>}
      results={<>
        <ResultRow label="Grashof Condition" value={grashof ? 'Satisfied' : 'Not Met'}
          status={grashof ? { text: '✅', cls: 'status-ok' } : { text: '⚠️', cls: 'status-warn' }} />
        <ResultRow label="Input Angle (θ2)" value={theta2} unit="°" />
        <ResultRow label="Output Angle (θ4)" value={result ? result.theta4 : 'N/A'} unit="°" />
        <ResultRow label="Coupler Angle (θ3)" value={result ? result.theta3 : 'N/A'} unit="°" />
        <ResultRow label="Transmission Angle" value={result ? Math.abs(result.theta3 - result.theta4) : 'N/A'} unit="°" />
      </>}
    >
      <FourBarAnimation a={a} b={b} c={c} d={d} theta2={theta2} />
    </CalculatorLayout>
  );
}
