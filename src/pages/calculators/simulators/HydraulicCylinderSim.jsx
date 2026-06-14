import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { motion } from 'framer-motion';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';

// ============================================
// Hydraulic Cylinder Formulas
// ============================================
const PI = Math.PI;
const boreArea = (d) => (PI / 4) * (d * d); // mm² 
const annularArea = (d, rod) => (PI / 4) * (d * d - rod * rod); // mm²
const forceExtend = (pressure, boreD) => (pressure * boreArea(boreD)) / 10; // N (pressure in bar, area in mm²)
const forceRetract = (pressure, boreD, rodD) => (pressure * annularArea(boreD, rodD)) / 10;
const cylinderSpeed = (flowLPM, areaMM2) => areaMM2 > 0 ? (flowLPM * 1e6) / (60 * areaMM2) : 0; // mm/s
const volumePerStroke = (areaMM2, strokeMM) => (areaMM2 * strokeMM) / 1e6; // L
const pumpPower = (pressureBar, flowLPM, eff) => eff > 0 ? (pressureBar * flowLPM) / (600 * (eff / 100)) : 0; // kW
const rodMOI = (d) => (PI / 64) * Math.pow(d, 4); // mm⁴
const eulerCriticalLoad = (rodD, strokeMM) => {
  const E = 210000; // MPa (steel)
  const I = rodMOI(rodD);
  const L = strokeMM; // mm
  return L > 0 ? (PI * PI * E * I) / (L * L) : Infinity; // N
};
const bucklingSF = (rodD, strokeMM, actualForceN) => {
  const pcr = eulerCriticalLoad(rodD, strokeMM);
  return actualForceN > 0 ? pcr / actualForceN : 999;
};

function CylinderAnimation({ boreD, rodD, strokeMM, pressure, flow, extension, showOil, showDims, isDark }) {
  const canvasRef = useRef(null);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width = canvas.offsetWidth * dpr;
    const H = canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      frame++;

      const cx = w / 2;
      const cy = h / 2 + 10;
      const scale = Math.min(w / 500, h / 300);
      const bodyW = 200 * scale;
      const bodyH = 80 * scale;
      const rodW = 80 * scale;
      const rodH = 24 * scale;
      const pistonW = 8 * scale;

      const ext = (extension / 100) * (bodyW - pistonW - 20 * scale) * 0.6;

      // === Draw cylinder body ===
      const bx = cx - bodyW / 2;
      const by = cy - bodyH / 2;

      // Cylinder bore
      ctx.beginPath();
      ctx.roundRect(bx, by, bodyW, bodyH, 6 * scale);
      ctx.fillStyle = isDark ? '#1a2236' : '#e2e8f0';
      ctx.fill();
      ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
      ctx.lineWidth = 2 * scale;
      ctx.stroke();

      // End caps
      ctx.beginPath();
      ctx.roundRect(bx - 6 * scale, by + 5 * scale, 8 * scale, bodyH - 10 * scale, 2);
      ctx.fillStyle = isDark ? '#334155' : '#94a3b8';
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(bx + bodyW - 2 * scale, by + 5 * scale, 8 * scale, bodyH - 10 * scale, 2);
      ctx.fill();
      ctx.stroke();

      // === Oil fill ===
      if (showOil) {
        // Cap-side oil (high pressure when extending)
        const oilAlpha = Math.min(pressure / 300, 0.8);
        ctx.beginPath();
        ctx.rect(bx + 3 * scale, by + 3 * scale, ext + 15 * scale, bodyH - 6 * scale);
        ctx.fillStyle = `rgba(239, 68, 68, ${oilAlpha * 0.3})`;
        ctx.fill();

        // Rod-side oil
        ctx.beginPath();
        ctx.rect(bx + ext + pistonW + 18 * scale, by + 3 * scale, bodyW - ext - pistonW - 24 * scale, bodyH - 6 * scale);
        ctx.fillStyle = `rgba(59, 130, 246, ${oilAlpha * 0.2})`;
        ctx.fill();

        // Oil flow particles
        const particleCount = Math.min(Math.floor(flow / 5), 12);
        for (let i = 0; i < particleCount; i++) {
          const phase = (frame * 2 + i * 25) % 100;
          const px = bx + (phase / 100) * ext + 5 * scale;
          const py = cy + (Math.sin(frame * 0.05 + i) * bodyH * 0.3);
          ctx.beginPath();
          ctx.arc(px, py, 2 * scale, 0, PI * 2);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
          ctx.fill();
        }
      }

      // === Piston ===
      const pistonX = bx + 15 * scale + ext;
      ctx.beginPath();
      ctx.rect(pistonX, by + 3 * scale, pistonW, bodyH - 6 * scale);
      ctx.fillStyle = isDark ? '#64748b' : '#475569';
      ctx.fill();
      ctx.strokeStyle = isDark ? '#94a3b8' : '#334155';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Seals on piston
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(pistonX - 1, by + 6 * scale, pistonW + 2, 2 * scale);
      ctx.fillRect(pistonX - 1, by + bodyH - 8 * scale, pistonW + 2, 2 * scale);

      // === Rod ===
      const rodStartX = pistonX + pistonW;
      const rodY = cy - rodH / 2;
      ctx.beginPath();
      ctx.rect(rodStartX, rodY, bodyW / 2 + rodW - (bodyW / 2 - ext) + 20 * scale, rodH);
      ctx.fillStyle = isDark ? '#94a3b8' : '#cbd5e1';
      ctx.fill();
      ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Rod end (threaded)
      const rodEndX = rodStartX + bodyW / 2 + rodW - (bodyW / 2 - ext) + 15 * scale;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(rodEndX + i * 4 * scale, rodY + 1);
        ctx.lineTo(rodEndX + (i + 0.5) * 4 * scale, rodY + rodH - 1);
        ctx.strokeStyle = isDark ? '#475569' : '#64748b';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // === Port connections ===
      // Port A (cap side)
      const portAx = bx + 10 * scale;
      ctx.beginPath();
      ctx.moveTo(portAx, by);
      ctx.lineTo(portAx, by - 20 * scale);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5 * scale;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(portAx, by - 22 * scale, 4 * scale, 0, PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // Port B (rod side)
      const portBx = bx + bodyW - 10 * scale;
      ctx.beginPath();
      ctx.moveTo(portBx, by);
      ctx.lineTo(portBx, by - 20 * scale);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2.5 * scale;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(portBx, by - 22 * scale, 4 * scale, 0, PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();

      // Port labels
      ctx.font = `bold ${10 * scale}px Inter`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ef4444';
      ctx.fillText('Port A', portAx, by - 30 * scale);
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('Port B', portBx, by - 30 * scale);

      // === Dimension overlays ===
      if (showDims) {
        ctx.strokeStyle = '#7c4dff';
        ctx.fillStyle = '#7c4dff';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.font = `${9 * scale}px JetBrains Mono`;

        // Bore diameter
        const dimY = by + bodyH + 20 * scale;
        ctx.beginPath();
        ctx.moveTo(bx, dimY);
        ctx.lineTo(bx + bodyW, dimY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.textAlign = 'center';
        ctx.fillText(`Bore Ø${boreD}mm`, cx, dimY + 14 * scale);

        // Stroke
        ctx.setLineDash([3, 3]);
        const strokeDimY = dimY + 28 * scale;
        ctx.beginPath();
        ctx.moveTo(bx + 15 * scale, strokeDimY);
        ctx.lineTo(bx + bodyW - 10 * scale, strokeDimY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillText(`Stroke ${strokeMM}mm`, cx, strokeDimY + 14 * scale);

        // Rod diameter
        const rodDimX = rodStartX + 30 * scale;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(rodDimX, rodY);
        ctx.lineTo(rodDimX, rodY + rodH);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillText(`Rod Ø${rodD}`, rodDimX + 30 * scale, cy + 3);
      }

      ctx.setLineDash([]);

      // === Extension percentage indicator ===
      ctx.fillStyle = isDark ? '#00e5ff' : '#0088aa';
      ctx.font = `bold ${12 * scale}px JetBrains Mono`;
      ctx.textAlign = 'right';
      ctx.fillText(`${extension.toFixed(0)}%`, w - 20, 30);
      ctx.font = `${9 * scale}px Inter`;
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.fillText('Extension', w - 20, 44);

      // === Pressure gauge ===
      const gx = 40;
      const gy = 35;
      const gr = 22 * scale;
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, PI * 2);
      ctx.fillStyle = isDark ? '#1a2236' : '#f8fafc';
      ctx.fill();
      ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Gauge arc
      const gaugeAngle = (pressure / 350) * PI * 1.5;
      ctx.beginPath();
      ctx.arc(gx, gy, gr - 4, -PI * 0.75, -PI * 0.75 + gaugeAngle);
      ctx.strokeStyle = pressure > 250 ? '#ef4444' : '#00e5ff';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.fillStyle = isDark ? '#fff' : '#1e293b';
      ctx.font = `bold ${9 * scale}px JetBrains Mono`;
      ctx.textAlign = 'center';
      ctx.fillText(`${pressure}`, gx, gy + 3);
      ctx.font = `${7 * scale}px Inter`;
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.fillText('bar', gx, gy + 14);

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [boreD, rodD, strokeMM, pressure, flow, extension, showOil, showDims, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 380 }} />;
}

export default function HydraulicCylinderSim() {
  const { isDark } = useTheme();
  const [cylType, setCylType] = useState('Double-Acting');
  const [boreD, setBoreD] = useState(63);
  const [rodD, setRodD] = useState(36);
  const [strokeMM, setStrokeMM] = useState(200);
  const [pressure, setPressure] = useState(200);
  const [flow, setFlow] = useState(30);
  const [efficiency, setEfficiency] = useState(85);
  const [showOil, setShowOil] = useState(true);
  const [showDims, setShowDims] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [extension, setExtension] = useState(0);
  const animRef = useRef(null);

  // Calculations
  const areaExt = boreArea(boreD);
  const areaRet = annularArea(boreD, rodD);
  const fExt = forceExtend(pressure, boreD);
  const fRet = forceRetract(pressure, boreD, rodD);
  const vExt = cylinderSpeed(flow, areaExt);
  const vRet = cylinderSpeed(flow, areaRet);
  const volExt = volumePerStroke(areaExt, strokeMM);
  const volRet = volumePerStroke(areaRet, strokeMM);
  const power = pumpPower(pressure, flow, efficiency);
  const sf = bucklingSF(rodD, strokeMM, fExt);
  const sfOk = sf >= 3.5;

  // Animation loop
  useEffect(() => {
    if (!animating) return;
    let dir = 1;
    const tick = () => {
      setExtension(prev => {
        let next = prev + dir * 0.6;
        if (next >= 100) { next = 100; dir = -1; }
        if (next <= 0) { next = 0; dir = 1; }
        return next;
      });
      animRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(animRef.current);
  }, [animating]);

  return (
    <CalculatorLayout
      title="Hydraulic Cylinder Simulator"
      description="Size and analyze hydraulic cylinders with animated piston cross-section, force/speed calculations, and rod buckling analysis"
      formula="F = P × A  |  v = Q / A  |  Pcr = π²EI / L²"
      inputs={<>
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Cylinder Type</label>
          <select value={cylType} onChange={e => setCylType(e.target.value)} className="input-field text-sm">
            <option>Double-Acting</option>
            <option>Single-Acting</option>
            <option>Telescopic</option>
          </select>
        </div>
        <CalcSlider label="Bore Diameter" value={boreD} onChange={setBoreD} min={20} max={200} step={1} unit="mm" />
        <CalcSlider label="Rod Diameter" value={rodD} onChange={setRodD} min={10} max={Math.floor(boreD * 0.9)} step={1} unit="mm" />
        <CalcSlider label="Stroke" value={strokeMM} onChange={setStrokeMM} min={50} max={1000} step={10} unit="mm" />
        <CalcSlider label="Pressure" value={pressure} onChange={setPressure} min={50} max={350} step={5} unit="bar" />
        <CalcSlider label="Flow Rate" value={flow} onChange={setFlow} min={5} max={100} step={1} unit="L/min" />
        <CalcSlider label="Efficiency" value={efficiency} onChange={setEfficiency} min={60} max={98} step={1} unit="%" />

        {/* Toggle buttons */}
        <div className="flex gap-2 pt-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setAnimating(!animating)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${animating
              ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30'
              : isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {animating ? '⏸ Stop' : '▶ Animate'}
          </motion.button>
        </div>
        <div className="flex gap-2">
          <label className={`flex items-center gap-1.5 text-xs cursor-pointer ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <input type="checkbox" checked={showOil} onChange={e => setShowOil(e.target.checked)} className="rounded" />
            Oil Flow
          </label>
          <label className={`flex items-center gap-1.5 text-xs cursor-pointer ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <input type="checkbox" checked={showDims} onChange={e => setShowDims(e.target.checked)} className="rounded" />
            Dimensions
          </label>
        </div>
      </>}
      results={<>
        <ResultRow label="Bore Area" value={areaExt.toFixed(1)} unit="mm²" />
        <ResultRow label="Annular Area" value={areaRet.toFixed(1)} unit="mm²" />
        <ResultRow label="Extend Force" value={(fExt / 1000).toFixed(2)} unit="kN" />
        <ResultRow label="Retract Force" value={(fRet / 1000).toFixed(2)} unit="kN" />
        <ResultRow label="Extend Speed" value={vExt.toFixed(1)} unit="mm/s" />
        <ResultRow label="Retract Speed" value={vRet.toFixed(1)} unit="mm/s" />
        <ResultRow label="Volume (ext)" value={volExt.toFixed(3)} unit="L" />
        <ResultRow label="Pump Power" value={power.toFixed(2)} unit="kW" />
        <ResultRow label="Rod/Bore Ratio" value={(rodD / boreD).toFixed(2)} />
        <ResultRow label="Buckling SF" value={sf > 100 ? '>100' : sf.toFixed(1)}
          status={sfOk ? { text: '✅ Safe', cls: 'status-ok' } : { text: '❌ Unsafe', cls: 'status-fail' }} />
      </>}
    >
      <CylinderAnimation
        boreD={boreD} rodD={rodD} strokeMM={strokeMM}
        pressure={pressure} flow={flow}
        extension={extension}
        showOil={showOil} showDims={showDims}
        isDark={isDark}
      />
    </CalculatorLayout>
  );
}
