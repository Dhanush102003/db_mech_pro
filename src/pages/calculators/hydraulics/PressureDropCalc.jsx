import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as H from '../../../utils/formulas/hydraulics';

function RoutingAnimation({ segments, totalDP, systemP }) {
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

    const points = [
      { x: 30, y: h / 2, label: 'TANK' },
      { x: 80, y: h / 2, label: 'STRAINER' },
      { x: 140, y: h / 2, label: 'PUMP' },
      { x: 200, y: h / 2 - 40, label: 'FILTER' },
      { x: 260, y: h / 2 - 40, label: 'DCV' },
      { x: 320, y: h / 2, label: 'CYLINDER' },
      { x: 260, y: h / 2 + 40, label: 'RET FILTER' },
      { x: 200, y: h / 2 + 40, label: 'COOLER' },
      { x: 120, y: h / 2 + 40, label: '' },
    ];

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      // Draw pipe segments
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i], p2 = points[i + 1];
        const segDP = segments[i] || 0;
        const intensity = Math.min(segDP / (totalDP + 0.001), 1);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(${Math.round(intensity * 255)}, ${Math.round((1 - intensity) * 200)}, 50, 0.7)`;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Flow dot
        const t = ((frame * 0.02) % 1);
        const dx = p1.x + (p2.x - p1.x) * t;
        const dy = p1.y + (p2.y - p1.y) * t;
        ctx.beginPath();
        ctx.arc(dx, dy, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#00e5ff';
        ctx.fill();
      }
      // Return to tank
      const last = points[points.length - 1];
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(points[0].x, last.y);
      ctx.lineTo(points[0].x, points[0].y);
      ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw component nodes
      points.forEach((p, i) => {
        if (!p.label) return;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        const isHighDP = (segments[i] || 0) > totalDP * 0.2;
        ctx.fillStyle = i === 0 ? '#3b82f6' : i === 2 ? '#00e676' : isHighDP ? '#ff174480' : (isDark ? '#1e293b' : '#f1f5f9');
        ctx.fill();
        ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
        ctx.font = '7px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(p.label, p.x, p.y + (p.y < h / 2 ? -14 : 20));
      });

      // Pressure bar (bottom)
      const barY = h - 30, barW = w - 60;
      ctx.fillStyle = isDark ? '#1e293b' : '#e2e8f0';
      ctx.fillRect(30, barY, barW, 10);
      const dpPct = totalDP / systemP;
      ctx.fillStyle = dpPct > 0.15 ? '#ff1744' : dpPct > 0.1 ? '#ffab00' : '#00e676';
      ctx.fillRect(30, barY, barW * Math.min(dpPct * 5, 1), 10);

      ctx.fillStyle = isDark ? '#ffffff90' : '#1e293b90';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`Total ΔP: ${totalDP.toFixed(3)} bar (${(dpPct * 100).toFixed(2)}% of ${systemP} bar)`, w / 2, barY - 5);

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [segments, totalDP, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function PressureDropCalc() {
  const [flow, setFlow] = useState(22.3);
  const [pressure, setPressure] = useState(175);
  const [pipeID, setPipeID] = useState(12);
  const [returnID, setReturnID] = useState(18);
  const [suctionID, setSuctionID] = useState(32);
  const [viscosity, setViscosity] = useState(26.3);
  const [density, setDensity] = useState(870);

  // Calculate per-segment ΔP (simplified from Excel Sheet 5)
  const calcSegDP = (id, lengthMM, kFactor, numFits) => {
    const v = H.flowVelocity(flow, id);
    const re = H.reynoldsNumber(v, id, viscosity);
    const friction = H.pipeFrictionDrop(re, lengthMM, id, density, v);
    const fitting = H.fittingDrop(kFactor, numFits, density, v);
    return friction + fitting;
  };

  const seg1 = calcSegDP(suctionID, 200, 2, 1);     // Tank → Strainer
  const seg2 = calcSegDP(suctionID, 500, 0.9, 1);   // Strainer → Pump
  const seg3 = calcSegDP(pipeID, 300, 0, 0);         // Pump → Filter
  const seg4 = calcSegDP(pipeID, 0, 3, 1);           // Filter
  const seg5 = calcSegDP(pipeID, 800, 0.9, 2);       // Filter → DCV
  const seg6 = calcSegDP(pipeID, 0, 5, 1);           // DCV
  const seg7 = calcSegDP(pipeID, 500, 0.9, 1);       // DCV → Cylinder
  const seg8 = calcSegDP(returnID, 600, 0.35, 2);    // Cylinder → Return
  const segs = [seg1, seg2, seg3, seg4, seg5, seg6, seg7, seg8];

  const suctionDP = seg1 + seg2;
  const pressureDP = seg3 + seg4 + seg5 + seg6 + seg7;
  const returnDP = seg8;
  const totalDP = suctionDP + pressureDP + returnDP;
  const dpPct = (totalDP / pressure) * 100;

  return (
    <CalculatorLayout
      title="Pressure Drop Calculator"
      description="Full routing ΔP with bends & fittings — verified against Excel Sheet 5"
      formula="ΔP = f×(L/D)×(ρv²/2) + K×(ρv²/2)"
      inputs={<>
        <CalcSlider label="System Flow" value={flow} onChange={setFlow} min={5} max={80} step={0.5} unit="L/min" />
        <CalcSlider label="System Pressure" value={pressure} onChange={setPressure} min={50} max={350} step={5} unit="bar" />
        <CalcSlider label="Pressure Line ID" value={pipeID} onChange={setPipeID} min={6} max={32} step={1} unit="mm" />
        <CalcSlider label="Return Line ID" value={returnID} onChange={setReturnID} min={10} max={38} step={1} unit="mm" />
        <CalcSlider label="Suction Line ID" value={suctionID} onChange={setSuctionID} min={16} max={51} step={1} unit="mm" />
        <CalcSlider label="Oil Viscosity" value={viscosity} onChange={setViscosity} min={5} max={100} step={0.5} unit="cSt" />
      </>}
      results={<>
        <ResultRow label="Suction ΔP" value={suctionDP} unit="bar" status={suctionDP < 0.3 ? { text: '✅ OK', cls: 'status-ok' } : { text: '❌ Cavitation', cls: 'status-fail' }} />
        <ResultRow label="Pressure ΔP" value={pressureDP} unit="bar" status={pressureDP / pressure < 0.1 ? { text: '✅ OK', cls: 'status-ok' } : { text: '⚠️ High', cls: 'status-warn' }} />
        <ResultRow label="Return ΔP" value={returnDP} unit="bar" status={returnDP / pressure < 0.05 ? { text: '✅ OK', cls: 'status-ok' } : { text: '⚠️ High', cls: 'status-warn' }} />
        <ResultRow label="Total System ΔP" value={totalDP} unit="bar" />
        <ResultRow label="ΔP as % of P" value={dpPct} unit="%" status={dpPct < 15 ? { text: '✅', cls: 'status-ok' } : { text: '⚠️', cls: 'status-warn' }} />
        <ResultRow label="Effective P at Cyl" value={pressure - pressureDP} unit="bar" />
      </>}
    >
      <RoutingAnimation segments={segs} totalDP={totalDP} systemP={pressure} />
    </CalculatorLayout>
  );
}
