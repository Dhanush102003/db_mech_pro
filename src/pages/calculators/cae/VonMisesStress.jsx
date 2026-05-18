import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as C from '../../../utils/formulas/cae';

function StressAnimation({ sx, sy, txy, vm, s1, s2 }) {
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

    // Stress element
    const cx = w * 0.35, cy = h * 0.45, sz = 55;
    ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - sz, cy - sz, sz * 2, sz * 2);
    ctx.fillStyle = isDark ? '#1e3a5f20' : '#bfdbfe20';
    ctx.fillRect(cx - sz, cy - sz, sz * 2, sz * 2);

    const drawArrow = (x1, y1, x2, y2, color, label) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
      const angle = Math.atan2(y2 - y1, x2 - x1);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - 8 * Math.cos(angle - 0.4), y2 - 8 * Math.sin(angle - 0.4));
      ctx.lineTo(x2 - 8 * Math.cos(angle + 0.4), y2 - 8 * Math.sin(angle + 0.4));
      ctx.closePath(); ctx.fillStyle = color; ctx.fill();
      if (label) {
        ctx.fillStyle = color; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center';
        ctx.fillText(label, (x1 + x2) / 2 + (y1 === y2 ? 0 : 12), (y1 + y2) / 2 + (x1 === x2 ? 0 : -8));
      }
    };

    const scale = Math.max(Math.abs(sx), Math.abs(sy), Math.abs(txy), 1);
    const arrowLen = 35;
    // σx arrows
    if (sx !== 0) {
      const dir = sx > 0 ? 1 : -1;
      const len = (Math.abs(sx) / scale) * arrowLen;
      drawArrow(cx + sz, cy, cx + sz + dir * len, cy, '#ef4444', `σx=${sx}`);
      drawArrow(cx - sz, cy, cx - sz - dir * len, cy, '#ef4444', '');
    }
    if (sy !== 0) {
      const dir = sy > 0 ? 1 : -1;
      const len = (Math.abs(sy) / scale) * arrowLen;
      drawArrow(cx, cy - sz, cx, cy - sz - dir * len, '#3b82f6', `σy=${sy}`);
      drawArrow(cx, cy + sz, cx, cy + sz + dir * len, '#3b82f6', '');
    }
    if (txy !== 0) {
      const len = (Math.abs(txy) / scale) * arrowLen * 0.7;
      drawArrow(cx + sz, cy - 15, cx + sz + len, cy - 15, '#7c4dff', `τ=${txy}`);
    }

    // Mohr's circle
    const mcx = w * 0.75, mcy = h * 0.45;
    const avg = (sx + sy) / 2;
    const R = Math.sqrt(Math.pow((sx - sy) / 2, 2) + txy * txy);
    const circR = Math.min(50, R > 0 ? 50 : 5);
    const circScale = R > 0 ? circR / R : 1;

    ctx.beginPath();
    ctx.arc(mcx, mcy, circR, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? '#00e5ff60' : '#0088aa40';
    ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = isDark ? '#00e5ff10' : '#0088aa08';
    ctx.fill();

    // Axes
    ctx.beginPath();
    ctx.moveTo(mcx - circR - 20, mcy); ctx.lineTo(mcx + circR + 20, mcy);
    ctx.moveTo(mcx, mcy - circR - 20); ctx.lineTo(mcx, mcy + circR + 20);
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.lineWidth = 1; ctx.stroke();

    // σ1, σ2 points
    ctx.beginPath(); ctx.arc(mcx + R * circScale, mcy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00e676'; ctx.fill();
    ctx.beginPath(); ctx.arc(mcx - R * circScale, mcy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ff1744'; ctx.fill();

    ctx.fillStyle = '#00e676'; ctx.font = '8px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`σ1=${s1.toFixed(0)}`, mcx + R * circScale, mcy - 10);
    ctx.fillStyle = '#ff1744';
    ctx.fillText(`σ2=${s2.toFixed(0)}`, mcx - R * circScale, mcy - 10);

    // Labels
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '9px Inter'; ctx.textAlign = 'center';
    ctx.fillText("Mohr's Circle", mcx, mcy + circR + 30);

    // Von Mises value
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 13px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`σ_vm = ${vm.toFixed(1)} MPa`, w / 2, h - 15);
  }, [sx, sy, txy, vm, s1, s2, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function VonMisesStress() {
  const [sx, setSx] = useState(100);
  const [sy, setSy] = useState(50);
  const [txy, setTxy] = useState(30);

  const vm = C.vonMisesStress(sx, sy, txy);
  const { s1, s2, tmax, angle } = C.principalStresses(sx, sy, txy);

  return (
    <CalculatorLayout title="Von Mises Stress Calculator"
      description="Calculate Von Mises stress, principal stresses and visualize Mohr's circle in real-time"
      formula="σ_vm = √(σx² + σy² - σx·σy + 3τxy²)"
      inputs={<>
        <CalcSlider label="σx (Normal X)" value={sx} onChange={setSx} min={-500} max={500} step={5} unit="MPa" />
        <CalcSlider label="σy (Normal Y)" value={sy} onChange={setSy} min={-500} max={500} step={5} unit="MPa" />
        <CalcSlider label="τxy (Shear)" value={txy} onChange={setTxy} min={-300} max={300} step={5} unit="MPa" />
      </>}
      results={<>
        <ResultRow label="Von Mises Stress" value={vm} unit="MPa" />
        <ResultRow label="Principal σ1" value={s1} unit="MPa" />
        <ResultRow label="Principal σ2" value={s2} unit="MPa" />
        <ResultRow label="Max Shear τmax" value={tmax} unit="MPa" />
        <ResultRow label="Principal Angle" value={angle} unit="°" />
      </>}
    >
      <StressAnimation sx={sx} sy={sy} txy={txy} vm={vm} s1={s1} s2={s2} />
    </CalculatorLayout>
  );
}
