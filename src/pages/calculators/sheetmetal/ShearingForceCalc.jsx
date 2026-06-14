import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { motion } from 'framer-motion';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';

// Shearing formulas
const PI = Math.PI;
const shearStrengthValues = {
  'Soft Copper': 150, 'Soft Brass': 230, 'Aluminium (soft)': 70,
  'Aluminium (hard)': 200, 'Mild Steel': 300, 'Stainless Steel': 380,
  'Spring Steel': 550, 'Titanium': 400,
};
const materials = Object.keys(shearStrengthValues);

const perimeter = (shape, a, b) => {
  switch (shape) {
    case 'Circle': return PI * a;
    case 'Square': return 4 * a;
    case 'Rectangle': return 2 * (a + b);
    case 'Triangle': return 3 * a;
    case 'Oblong': return 2 * (a - b) + PI * b;
    default: return PI * a;
  }
};

const shearingForce = (perim, t, tau) => (perim * t * tau) / 1000; // kN
const strippingForce = (sf) => sf * 0.035; // ~3.5% of shearing force
const dieClearance = (t, material) => {
  const pct = { 'Soft Copper': 5, 'Soft Brass': 5, 'Aluminium (soft)': 4, 'Aluminium (hard)': 6, 'Mild Steel': 7, 'Stainless Steel': 8, 'Spring Steel': 10, 'Titanium': 8 };
  return t * (pct[material] || 7) / 100;
};

function ShearingAnimation({ shape, dimA, dimB, thickness, extension, isDark }) {
  const canvasRef = useRef(null);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      frame++;

      const cx = w / 2;
      const cy = h / 2 + 30;
      const scale = Math.min(w / 400, h / 350);

      // Die (bottom)
      const dieW = 160 * scale;
      const dieH = 60 * scale;
      const dieGap = 40 * scale;
      const dieY = cy + 20 * scale;

      ctx.fillStyle = isDark ? '#334155' : '#94a3b8';
      ctx.strokeStyle = isDark ? '#475569' : '#64748b';
      ctx.lineWidth = 2;
      // Left die block
      ctx.beginPath();
      ctx.rect(cx - dieW / 2 - dieGap / 2, dieY, dieW / 2, dieH);
      ctx.fill();
      ctx.stroke();
      // Right die block
      ctx.beginPath();
      ctx.rect(cx + dieGap / 2, dieY, dieW / 2, dieH);
      ctx.fill();
      ctx.stroke();

      // Die label
      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.font = `${9 * scale}px Inter`;
      ctx.textAlign = 'center';
      ctx.fillText('DIE', cx, dieY + dieH + 14 * scale);

      // Sheet metal (workpiece)
      const sheetH = Math.max(thickness * scale * 2, 8 * scale);
      const sheetY = dieY - sheetH;
      const sheetW = dieW + 40 * scale;

      ctx.fillStyle = isDark ? '#1e3a5f' : '#bfdbfe';
      ctx.strokeStyle = isDark ? '#3b82f6' : '#2563eb';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(cx - sheetW / 2, sheetY, sheetW, sheetH);
      ctx.fill();
      ctx.stroke();

      // Deformation zone
      if (extension > 20) {
        const deformDepth = (extension / 100) * sheetH * 0.8;
        ctx.fillStyle = isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)';
        ctx.beginPath();
        ctx.rect(cx - dieGap / 2 - 3, sheetY + sheetH - deformDepth, dieGap + 6, deformDepth);
        ctx.fill();
      }

      // Fracture lines (when extension > 70%)
      if (extension > 70) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(cx - dieGap / 2, sheetY);
        ctx.lineTo(cx - dieGap / 2, sheetY + sheetH);
        ctx.moveTo(cx + dieGap / 2, sheetY);
        ctx.lineTo(cx + dieGap / 2, sheetY + sheetH);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Punch (top)
      const punchH = 80 * scale;
      const punchW = dieGap - 4 * scale;
      const punchDescent = (extension / 100) * (sheetH + 10 * scale);
      const punchY = sheetY - punchH - 10 * scale + punchDescent;

      ctx.fillStyle = isDark ? '#475569' : '#64748b';
      ctx.strokeStyle = isDark ? '#64748b' : '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(cx - punchW / 2, punchY, punchW, punchH);
      ctx.fill();
      ctx.stroke();

      // Punch label
      ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
      ctx.font = `${9 * scale}px Inter`;
      ctx.textAlign = 'center';
      ctx.fillText('PUNCH', cx, punchY - 6 * scale);

      // Force arrow
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = '#ef4444';
      ctx.lineWidth = 2;
      const arrowX = cx;
      const arrowTop = punchY - 30 * scale;
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowTop);
      ctx.lineTo(arrowX, punchY - 4 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(arrowX - 5, punchY - 12 * scale);
      ctx.lineTo(arrowX, punchY - 4 * scale);
      ctx.lineTo(arrowX + 5, punchY - 12 * scale);
      ctx.fill();
      ctx.font = `bold ${10 * scale}px JetBrains Mono`;
      ctx.fillText('F', arrowX, arrowTop - 6 * scale);

      // Clearance dimension
      ctx.strokeStyle = '#7c4dff';
      ctx.fillStyle = '#7c4dff';
      ctx.lineWidth = 1;
      ctx.font = `${8 * scale}px JetBrains Mono`;
      const clrX = cx + dieGap / 2 + 15 * scale;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(cx + punchW / 2, dieY - 15 * scale);
      ctx.lineTo(clrX, dieY - 15 * scale);
      ctx.moveTo(cx + dieGap / 2, dieY - 15 * scale);
      ctx.lineTo(clrX + 10, dieY - 15 * scale);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.textAlign = 'left';
      ctx.fillText('clearance', clrX + 14 * scale, dieY - 12 * scale);

      // Shape preview (top right)
      const prevX = w - 60 * scale;
      const prevY = 40 * scale;
      const prevS = 30 * scale;
      ctx.strokeStyle = isDark ? '#00e5ff' : '#0088aa';
      ctx.lineWidth = 1.5;
      switch (shape) {
        case 'Circle':
          ctx.beginPath();
          ctx.arc(prevX, prevY, prevS, 0, PI * 2);
          ctx.stroke();
          break;
        case 'Square':
          ctx.strokeRect(prevX - prevS, prevY - prevS, prevS * 2, prevS * 2);
          break;
        case 'Rectangle':
          ctx.strokeRect(prevX - prevS * 1.3, prevY - prevS * 0.8, prevS * 2.6, prevS * 1.6);
          break;
        case 'Triangle':
          ctx.beginPath();
          ctx.moveTo(prevX, prevY - prevS);
          ctx.lineTo(prevX + prevS, prevY + prevS);
          ctx.lineTo(prevX - prevS, prevY + prevS);
          ctx.closePath();
          ctx.stroke();
          break;
        default:
          ctx.beginPath();
          ctx.arc(prevX, prevY, prevS, 0, PI * 2);
          ctx.stroke();
      }
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = `${8 * scale}px Inter`;
      ctx.textAlign = 'center';
      ctx.fillText(shape, prevX, prevY + prevS + 14 * scale);

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [shape, dimA, dimB, thickness, extension, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 380 }} />;
}

export default function ShearingForceCalc() {
  const { isDark } = useTheme();
  const [shape, setShape] = useState('Circle');
  const [dimA, setDimA] = useState(30);
  const [dimB, setDimB] = useState(20);
  const [thickness, setThickness] = useState(2);
  const [material, setMaterial] = useState('Mild Steel');
  const [animating, setAnimating] = useState(false);
  const [extension, setExtension] = useState(0);
  const animRef = useRef(null);

  const tau = shearStrengthValues[material] || 300;
  const perim = perimeter(shape, dimA, dimB);
  const sf = shearingForce(perim, thickness, tau);
  const strip = strippingForce(sf);
  const clearance = dieClearance(thickness, material);
  const totalForce = sf + strip;
  const pressCapacity = totalForce * 1.2; // 20% safety factor

  // Animation
  useEffect(() => {
    if (!animating) return;
    let dir = 1;
    const tick = () => {
      setExtension(prev => {
        let next = prev + dir * 0.8;
        if (next >= 100) { dir = -1; next = 100; }
        if (next <= 0) { dir = 1; next = 0; }
        return next;
      });
      animRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(animRef.current);
  }, [animating]);

  return (
    <CalculatorLayout
      title="Shearing Force Calculator"
      description="Calculate punch/die shearing force with animated cutting action, clearance analysis, and press capacity sizing"
      formula="F = L × t × τ  (Perimeter × Thickness × Shear Strength)"
      inputs={<>
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Shape</label>
          <select value={shape} onChange={e => setShape(e.target.value)} className="input-field text-sm">
            {['Circle', 'Square', 'Rectangle', 'Triangle', 'Oblong'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Material</label>
          <select value={material} onChange={e => setMaterial(e.target.value)} className="input-field text-sm">
            {materials.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <CalcSlider label={shape === 'Circle' ? 'Diameter' : 'Dim A'} value={dimA} onChange={setDimA} min={5} max={200} step={1} unit="mm" />
        {(shape === 'Rectangle' || shape === 'Oblong') && (
          <CalcSlider label="Dim B" value={dimB} onChange={setDimB} min={5} max={200} step={1} unit="mm" />
        )}
        <CalcSlider label="Thickness" value={thickness} onChange={setThickness} min={0.5} max={20} step={0.1} unit="mm" />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setAnimating(!animating)}
          className={`w-full py-2 rounded-xl text-xs font-semibold transition-all mt-2 ${animating
            ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30'
            : isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          {animating ? '⏸ Stop' : '▶ Animate Shearing'}
        </motion.button>
      </>}
      results={<>
        <ResultRow label="Perimeter" value={perim.toFixed(1)} unit="mm" />
        <ResultRow label="Shear Strength (τ)" value={tau} unit="MPa" />
        <ResultRow label="Shearing Force" value={sf.toFixed(2)} unit="kN" />
        <ResultRow label="Stripping Force" value={strip.toFixed(2)} unit="kN" />
        <ResultRow label="Total Force" value={totalForce.toFixed(2)} unit="kN" />
        <ResultRow label="Die Clearance" value={clearance.toFixed(3)} unit="mm" />
        <ResultRow label="Clearance %" value={(clearance / thickness * 100).toFixed(1)} unit="%" />
        <ResultRow label="Press Capacity" value={pressCapacity.toFixed(1)} unit="kN" />
        <ResultRow label="Press (tons)" value={(pressCapacity / 9.81).toFixed(1)} unit="ton" />
      </>}
    >
      <ShearingAnimation shape={shape} dimA={dimA} dimB={dimB} thickness={thickness} extension={extension} isDark={isDark} />
    </CalculatorLayout>
  );
}
