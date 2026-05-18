import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as H from '../../../utils/formulas/hydraulics';

function PipeAnimation({ velocity, pipeID, re }) {
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

      const pipeScale = Math.max(pipeID / 32, 0.3);
      const pipeH = 40 * pipeScale;
      const pipeTop = h / 2 - pipeH;
      const pipeBot = h / 2 + pipeH;

      // Pipe walls
      ctx.fillStyle = isDark ? '#334155' : '#94a3b8';
      ctx.fillRect(20, pipeTop - 4, w - 40, 4);
      ctx.fillRect(20, pipeBot, w - 40, 4);

      // Pipe interior
      ctx.fillStyle = isDark ? '#0f172a' : '#f1f5f9';
      ctx.fillRect(20, pipeTop, w - 40, pipeH * 2);

      // Velocity profile (parabolic for laminar)
      const regime = H.flowRegime(re);
      const vScale = Math.min(velocity / 5, 1);

      if (regime === 'Laminar') {
        ctx.beginPath();
        for (let y = pipeTop; y <= pipeBot; y += 2) {
          const dist = Math.abs(y - h / 2) / pipeH;
          const vx = (1 - dist * dist) * 80 * vScale;
          ctx.lineTo(w / 2 + vx, y);
        }
        ctx.strokeStyle = '#00e5ff80';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Mirror
        ctx.beginPath();
        for (let y = pipeTop; y <= pipeBot; y += 2) {
          const dist = Math.abs(y - h / 2) / pipeH;
          const vx = (1 - dist * dist) * 80 * vScale;
          ctx.lineTo(w / 2 - vx, y);
        }
        ctx.strokeStyle = '#00e5ff40';
        ctx.stroke();
      }

      // Flow particles
      for (let i = 0; i < 30; i++) {
        const py = pipeTop + 5 + (i / 30) * (pipeH * 2 - 10);
        const dist = Math.abs(py - h / 2) / pipeH;
        const pSpeed = regime === 'Laminar' ? (1 - dist * dist) * vScale * 3 : vScale * (1.5 + Math.random() * 1.5);
        const px = ((frame * pSpeed + i * 37) % (w - 40)) + 20;
        const wobble = regime === 'Turbulent' ? Math.sin(frame * 0.1 + i * 3) * 4 : 0;

        ctx.beginPath();
        ctx.arc(px, py + wobble, 2, 0, Math.PI * 2);
        ctx.fillStyle = regime === 'Laminar' ? '#3b82f680' : regime === 'Turbulent' ? '#ef444460' : '#ffab0060';
        ctx.fill();
      }

      // Cross-section view (right side)
      const csX = w - 60, csY = 40, csR = Math.max(pipeH * 0.6, 12);
      ctx.beginPath();
      ctx.arc(csX, csY + csR, csR, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = isDark ? '#0f172a' : '#f1f5f9';
      ctx.fill();
      ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
      ctx.font = '8px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`ID ${pipeID}`, csX, csY + csR * 2 + 14);

      // Dimension line
      ctx.beginPath();
      ctx.moveTo(csX - csR, csY + csR);
      ctx.lineTo(csX + csR, csY + csR);
      ctx.strokeStyle = '#7c4dff';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Labels
      ctx.fillStyle = isDark ? '#ffffff90' : '#1e293b90';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`v = ${velocity.toFixed(2)} m/s`, w / 2, h - 25);
      ctx.font = '9px Inter';
      ctx.fillText(`Re = ${Math.round(re).toLocaleString()} (${regime})`, w / 2, h - 10);

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [velocity, pipeID, re, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function PipeHoseSizing() {
  const [flowRate, setFlowRate] = useState(22.3);
  const [lineType, setLineType] = useState('Pressure');
  const [viscosity, setViscosity] = useState(26.3);
  const { isDark } = useTheme();

  const targetVel = { Pressure: 4, Return: 1.5, Suction: 0.8, 'Case Drain': 0.5, Pilot: 3, Steering: 3 };
  const tv = targetVel[lineType] || 3;
  const minID = H.minPipeID(flowRate, tv);
  const selectedID = H.selectStdPipeSize(minID);
  const velocity = H.flowVelocity(flowRate, selectedID);
  const re = H.reynoldsNumber(velocity, selectedID, viscosity);
  const regime = H.flowRegime(re);
  const velCheck = H.velocityCheck(velocity, lineType);
  const wallThk = selectedID <= 12 ? 1.5 : selectedID <= 20 ? 2 : 3;
  const od = selectedID + 2 * wallThk;

  return (
    <CalculatorLayout
      title="Pipe & Hose Sizing Calculator"
      description="Auto-select pipe/hose ID with velocity profile visualization — verified against Excel Sheet 3"
      formula="ID_min = √(4Q / (πv)) × 1000 | v = Q / A"
      inputs={<>
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Line Type</label>
          <select value={lineType} onChange={e => setLineType(e.target.value)} className="input-field text-sm">
            {Object.keys(targetVel).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <CalcSlider label="Flow Rate" value={flowRate} onChange={setFlowRate} min={1} max={100} step={0.5} unit="L/min" />
        <CalcSlider label="Kinematic Viscosity" value={viscosity} onChange={setViscosity} min={5} max={100} step={0.5} unit="cSt" />
      </>}
      results={<>
        <ResultRow label="Target Velocity" value={tv} unit="m/s" />
        <ResultRow label="Min ID Required" value={minID} unit="mm" />
        <ResultRow label="Selected Std ID" value={selectedID} unit="mm" />
        <ResultRow label="Wall Thickness" value={wallThk} unit="mm" />
        <ResultRow label="Outside Diameter" value={od} unit="mm" />
        <ResultRow label="Actual Velocity" value={velocity} unit="m/s" status={velCheck} />
        <ResultRow label="Reynolds Number" value={Math.round(re)} />
        <ResultRow label="Flow Regime" value={regime} />
      </>}
    >
      <PipeAnimation velocity={velocity} pipeID={selectedID} re={re} />
    </CalculatorLayout>
  );
}
