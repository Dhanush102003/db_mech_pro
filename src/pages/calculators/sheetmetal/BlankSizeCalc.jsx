import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as SM from '../../../utils/formulas/sheetmetal';

function BlankAnimation({ blankD, drawD, drawH }) {
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

    const cx = w / 2, cy = h / 2;
    const maxDim = Math.max(blankD, drawD, drawH * 2);
    const scale = Math.min(100, 120 / (maxDim / 100));
    const bR = (blankD / 2) * scale / 100;
    const dR = (drawD / 2) * scale / 100;
    const dH = drawH * scale / 100;

    // Blank circle (left side)
    const lx = w * 0.28;
    ctx.beginPath();
    ctx.arc(lx, cy, bR, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#1e3a5f30' : '#bfdbfe30';
    ctx.fill();
    ctx.strokeStyle = isDark ? '#3b82f6' : '#2563eb';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(lx - bR, cy);
    ctx.lineTo(lx + bR, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Blank diameter label
    ctx.fillStyle = isDark ? '#3b82f6' : '#2563eb';
    ctx.font = 'bold 10px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`Ø${blankD.toFixed(1)}`, lx, cy - bR - 10);
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '9px Inter';
    ctx.fillText('FLAT BLANK', lx, cy + bR + 18);

    // Arrow between
    ctx.beginPath();
    ctx.moveTo(w * 0.45, cy);
    ctx.lineTo(w * 0.55, cy);
    ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w * 0.55, cy);
    ctx.lineTo(w * 0.53, cy - 5);
    ctx.lineTo(w * 0.53, cy + 5);
    ctx.closePath();
    ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
    ctx.fill();

    // Drawn part (right side) — cup cross section
    const rx = w * 0.72;
    const cupTop = cy - dH;
    ctx.beginPath();
    ctx.moveTo(rx - dR, cy);
    ctx.lineTo(rx - dR, cupTop);
    ctx.arc(rx, cupTop, dR, Math.PI, 0, false);
    ctx.lineTo(rx + dR, cy);
    ctx.closePath();
    ctx.fillStyle = isDark ? '#7c4dff20' : '#ddd6fe30';
    ctx.fill();
    ctx.strokeStyle = '#7c4dff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cup dimensions
    ctx.fillStyle = '#7c4dff';
    ctx.font = 'bold 10px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`Ø${drawD}`, rx, cy + 18);
    ctx.fillText(`h=${drawH}`, rx + dR + 18, cy - dH / 2);
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '9px Inter';
    ctx.fillText('DRAWN CUP', rx, cy + 32);
  }, [blankD, drawD, drawH, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function BlankSizeCalc() {
  const [drawDia, setDrawDia] = useState(80);
  const [drawHeight, setDrawHeight] = useState(50);
  const [material, setMaterial] = useState('Mild Steel');
  const { isDark } = useTheme();

  const blankD = SM.cylindricalBlankDiameter(drawDia, drawHeight);
  const dr = SM.drawRatio(blankD, drawDia);
  const maxDR = 2.0;
  const drawsNeeded = dr > maxDR ? Math.ceil(Math.log(dr) / Math.log(maxDR)) : 1;

  return (
    <CalculatorLayout title="Blank Size Calculator"
      description="Cylindrical draw blank diameter calculation with visual blank-to-cup transformation"
      formula="D_blank = √(d² + 4dh)"
      inputs={<>
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Material</label>
          <select value={material} onChange={e => setMaterial(e.target.value)} className="input-field text-sm">
            {SM.materials.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <CalcSlider label="Draw Diameter" value={drawDia} onChange={setDrawDia} min={10} max={300} step={1} unit="mm" />
        <CalcSlider label="Draw Height" value={drawHeight} onChange={setDrawHeight} min={5} max={200} step={1} unit="mm" />
      </>}
      results={<>
        <ResultRow label="Blank Diameter" value={blankD} unit="mm" />
        <ResultRow label="Draw Ratio" value={dr} status={dr <= maxDR ? { text: '✅ Single Draw', cls: 'status-ok' } : { text: '⚠️ Multi Draw', cls: 'status-warn' }} />
        <ResultRow label="Draws Required" value={drawsNeeded} />
        <ResultRow label="Blank Area" value={(Math.PI * Math.pow(blankD / 2, 2)).toFixed(0)} unit="mm²" />
      </>}
    >
      <BlankAnimation blankD={blankD} drawD={drawDia} drawH={drawHeight} />
    </CalculatorLayout>
  );
}
