import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as C from '../../../utils/formulas/cae';

function BeamAnimation({ type, load, length, deflection, EI }) {
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

    const margin = 50;
    const beamY = h * 0.4;
    const beamLen = w - 2 * margin;
    const x0 = margin, x1 = margin + beamLen;
    const deflMag = Math.min(Math.abs(deflection) * 500, 80);
    const isSS = type === 'simply-supported';

    // Draw supports
    ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
    if (isSS) {
      // Triangle supports
      [x0, x1].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x - 10, beamY + 6);
        ctx.lineTo(x + 10, beamY + 6);
        ctx.lineTo(x, beamY + 22);
        ctx.closePath();
        ctx.fill();
      });
    } else {
      // Fixed wall
      ctx.fillRect(x0 - 12, beamY - 20, 12, 46);
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(x0 - 12, beamY - 18 + i * 10);
        ctx.lineTo(x0 - 20, beamY - 12 + i * 10);
        ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // Deflection curve
    ctx.beginPath();
    ctx.moveTo(x0, beamY);
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x0 + t * beamLen;
      let y;
      if (isSS) {
        // Parabolic: max at center
        y = beamY + deflMag * 4 * t * (1 - t);
      } else {
        // Cantilever: max at free end
        y = beamY + deflMag * t * t;
      }
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = isDark ? '#00e5ff' : '#0088aa';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Original beam (dashed)
    ctx.beginPath();
    ctx.moveTo(x0, beamY);
    ctx.lineTo(x1, beamY);
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Load arrow
    const loadX = isSS ? (x0 + x1) / 2 : x1;
    const arrowTop = beamY - 60;
    ctx.beginPath();
    ctx.moveTo(loadX, arrowTop);
    ctx.lineTo(loadX, beamY - 8);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(loadX, beamY - 5);
    ctx.lineTo(loadX - 6, beamY - 14);
    ctx.lineTo(loadX + 6, beamY - 14);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.font = 'bold 11px JetBrains Mono';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'center';
    ctx.fillText(`${load} N`, loadX, arrowTop - 5);

    // Deflection dimension
    const maxDeflX = isSS ? (x0 + x1) / 2 : x1;
    const maxDeflY = beamY + deflMag * (isSS ? 1 : 1);
    ctx.beginPath();
    ctx.moveTo(maxDeflX + 20, beamY);
    ctx.lineTo(maxDeflX + 20, maxDeflY);
    ctx.strokeStyle = '#7c4dff';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#7c4dff';
    ctx.font = 'bold 10px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText(`δ = ${Math.abs(deflection).toFixed(4)} mm`, maxDeflX + 25, (beamY + maxDeflY) / 2 + 4);

    // Length dimension
    ctx.beginPath();
    ctx.moveTo(x0, beamY + 40);
    ctx.lineTo(x1, beamY + 40);
    ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`L = ${length} mm`, (x0 + x1) / 2, beamY + 55);

    // Type label
    ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
    ctx.font = '9px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(isSS ? 'SIMPLY SUPPORTED — CENTER LOAD' : 'CANTILEVER — END LOAD', w / 2, h - 10);
  }, [type, load, length, deflection, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function BeamDeflection() {
  const [type, setType] = useState('simply-supported');
  const [load, setLoad] = useState(1000);
  const [length, setLength] = useState(500);
  const [matE, setMatE] = useState(200);
  const [iVal, setIVal] = useState(1000);
  const { isDark } = useTheme();

  const E = matE * 1e3; // GPa to MPa -> N/mm²
  const EI = E * iVal;
  const defl = type === 'simply-supported'
    ? C.beamDeflection.simplySupportedCenter(load, length, E, iVal)
    : C.beamDeflection.cantileverEnd(load, length, E, iVal);
  const moment = type === 'simply-supported'
    ? C.bendingMoment.simplySupportedCenter(load, length)
    : C.bendingMoment.cantileverEnd(load, length);
  const allowable = length / 360;

  return (
    <CalculatorLayout
      title="Beam Deflection Simulator"
      description="Interactive beam bending visualization for simply supported and cantilever beams"
      formula={type === 'simply-supported' ? "δ = PL³ / (48EI)" : "δ = PL³ / (3EI)"}
      inputs={<>
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Beam Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className="input-field text-sm">
            <option value="simply-supported">Simply Supported</option>
            <option value="cantilever">Cantilever</option>
          </select>
        </div>
        <CalcSlider label="Applied Load" value={load} onChange={setLoad} min={100} max={50000} step={100} unit="N" />
        <CalcSlider label="Beam Length" value={length} onChange={setLength} min={100} max={5000} step={10} unit="mm" />
        <CalcSlider label="Elastic Modulus" value={matE} onChange={setMatE} min={10} max={400} step={1} unit="GPa" />
        <CalcSlider label="Moment of Inertia" value={iVal} onChange={setIVal} min={100} max={100000} step={100} unit="mm⁴" />
      </>}
      results={<>
        <ResultRow label="Max Deflection" value={defl} unit="mm" />
        <ResultRow label="Bending Moment" value={moment / 1000} unit="kN·mm" />
        <ResultRow label="Allowable (L/360)" value={allowable} unit="mm" />
        <ResultRow label="Deflection Check" value={Math.abs(defl) <= allowable ? 'PASS' : 'FAIL'}
          status={Math.abs(defl) <= allowable ? { text: '✅', cls: 'status-ok' } : { text: '❌', cls: 'status-fail' }} />
        <ResultRow label="E × I" value={(EI / 1e6).toFixed(1)} unit="×10⁶" />
      </>}
    >
      <BeamAnimation type={type} load={load} length={length} deflection={defl} EI={EI} />
    </CalculatorLayout>
  );
}
