import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { motion } from 'framer-motion';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';

// Deep drawing formulas
const PI = Math.PI;
const materials = ['Soft Copper', 'Soft Brass', 'Aluminium (soft)', 'Aluminium (hard)', 'Mild Steel', 'Stainless Steel', 'Titanium'];
const utsValues = {
  'Soft Copper': 220, 'Soft Brass': 350, 'Aluminium (soft)': 110,
  'Aluminium (hard)': 310, 'Mild Steel': 400, 'Stainless Steel': 520, 'Titanium': 550,
};
const ldrValues = {
  'Soft Copper': 2.0, 'Soft Brass': 2.1, 'Aluminium (soft)': 2.15,
  'Aluminium (hard)': 1.9, 'Mild Steel': 2.1, 'Stainless Steel': 2.0, 'Titanium': 1.8,
};

const blankDiameter = (d, hh) => Math.sqrt(d * d + 4 * d * hh);
const drawRatio = (blankD, punchD) => punchD > 0 ? blankD / punchD : 0;
const numberOfDraws = (dr, ldr) => ldr > 0 ? Math.ceil(Math.log(dr) / Math.log(ldr)) : 1;
const drawingForce = (d, t, uts, dr) => dr > 0.7 ? (PI * d * t * uts * (dr - 0.7)) / 1000 : 0; // kN
const blankHolderForce = (df) => df * 0.03;
const ironingReduction = (t, wallT) => t > 0 ? ((t - wallT) / t) * 100 : 0;

function DeepDrawAnimation({ blankD, punchD, cupH, thickness, drawPhase, isDark }) {
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
      const cy = h / 2 + 20;
      const scale = Math.min(w / 400, h / 350);

      // Phase: 0 = blank, 0-50 = drawing, 50-100 = complete cup
      const phase = drawPhase;

      // Die (bottom block with opening)
      const dieW = 180 * scale;
      const dieH = 40 * scale;
      const dieOpenW = (punchD / blankD) * dieW * 0.8;
      const dieY = cy + 10 * scale;

      ctx.fillStyle = isDark ? '#334155' : '#94a3b8';
      ctx.strokeStyle = isDark ? '#475569' : '#64748b';
      ctx.lineWidth = 2;
      // Left die
      ctx.beginPath();
      ctx.rect(cx - dieW / 2, dieY, (dieW - dieOpenW) / 2, dieH);
      ctx.fill();
      ctx.stroke();
      // Right die
      ctx.beginPath();
      ctx.rect(cx + dieOpenW / 2, dieY, (dieW - dieOpenW) / 2, dieH);
      ctx.fill();
      ctx.stroke();
      // Die radius
      ctx.beginPath();
      ctx.arc(cx - dieOpenW / 2, dieY, 6 * scale, 0, PI / 2);
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + dieOpenW / 2, dieY, 6 * scale, PI / 2, PI);
      ctx.stroke();

      // Blank holder (top plate)
      const bhY = dieY - 8 * scale;
      const bhDescent = phase > 0 ? Math.min(phase / 100 * 4, 4) * scale : 0;
      ctx.fillStyle = isDark ? '#475569' : '#64748b';
      ctx.strokeStyle = isDark ? '#64748b' : '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(cx - dieW / 2, bhY - 15 * scale + bhDescent, (dieW - dieOpenW) / 2 - 2, 15 * scale);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(cx + dieOpenW / 2 + 2, bhY - 15 * scale + bhDescent, (dieW - dieOpenW) / 2 - 2, 15 * scale);
      ctx.fill();
      ctx.stroke();

      // Blank / Cup (workpiece)
      const blankW = dieW * 0.9;
      const sheetH = Math.max(thickness * 2 * scale, 6 * scale);

      if (phase < 10) {
        // Flat blank
        ctx.fillStyle = isDark ? '#1e3a5f' : '#bfdbfe';
        ctx.strokeStyle = isDark ? '#3b82f6' : '#2563eb';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(cx - blankW / 2, bhY - sheetH + bhDescent, blankW, sheetH);
        ctx.fill();
        ctx.stroke();

        // Blank label
        ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
        ctx.font = `${8 * scale}px Inter`;
        ctx.textAlign = 'center';
        ctx.fillText('BLANK', cx, bhY - sheetH - 6 * scale + bhDescent);
      } else {
        // Drawing in progress — show cup forming
        const drawDepth = ((phase - 10) / 90) * (cupH * 0.4) * scale;
        const flangeW = blankW * (1 - (phase - 10) / 180);

        ctx.fillStyle = isDark ? '#1e3a5f' : '#bfdbfe';
        ctx.strokeStyle = isDark ? '#3b82f6' : '#2563eb';
        ctx.lineWidth = 1.5;

        // Cup walls
        ctx.beginPath();
        // Left wall
        ctx.rect(cx - dieOpenW / 2, dieY - drawDepth, sheetH, drawDepth + dieH / 2);
        ctx.fill();
        ctx.stroke();
        // Right wall
        ctx.beginPath();
        ctx.rect(cx + dieOpenW / 2 - sheetH, dieY - drawDepth, sheetH, drawDepth + dieH / 2);
        ctx.fill();
        ctx.stroke();
        // Bottom
        ctx.beginPath();
        ctx.rect(cx - dieOpenW / 2, dieY + dieH / 2 + drawDepth * 0.5, dieOpenW, sheetH);
        ctx.fill();
        ctx.stroke();

        // Remaining flange
        if (flangeW > dieOpenW + 10) {
          ctx.beginPath();
          ctx.rect(cx - flangeW / 2, bhY - sheetH + bhDescent, (flangeW - dieOpenW) / 2, sheetH);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.rect(cx + dieOpenW / 2, bhY - sheetH + bhDescent, (flangeW - dieOpenW) / 2, sheetH);
          ctx.fill();
          ctx.stroke();
        }

        // Wall thinning gradient
        if (phase > 40) {
          const thinFactor = Math.min((phase - 40) / 60, 0.3);
          ctx.fillStyle = `rgba(239, 68, 68, ${thinFactor * 0.4})`;
          ctx.fillRect(cx - dieOpenW / 2, dieY - drawDepth, sheetH, drawDepth * 0.3);
          ctx.fillRect(cx + dieOpenW / 2 - sheetH, dieY - drawDepth, sheetH, drawDepth * 0.3);
        }
      }

      // Punch
      const punchW = dieOpenW - sheetH * 2 - 4 * scale;
      const punchH = 70 * scale;
      const punchDescent = phase > 5 ? ((phase - 5) / 95) * (dieH + 30 * scale) : 0;
      const punchY = bhY - punchH - 20 * scale + punchDescent;

      ctx.fillStyle = isDark ? '#475569' : '#64748b';
      ctx.strokeStyle = isDark ? '#64748b' : '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx - punchW / 2, punchY, punchW, punchH, [0, 0, 4 * scale, 4 * scale]);
      ctx.fill();
      ctx.stroke();

      // Punch nose radius
      ctx.beginPath();
      ctx.arc(cx - punchW / 2, punchY + punchH, 4 * scale, -PI / 2, 0);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + punchW / 2, punchY + punchH, 4 * scale, PI, PI * 1.5);
      ctx.stroke();

      // Labels
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = `${9 * scale}px Inter`;
      ctx.textAlign = 'center';
      ctx.fillText('PUNCH', cx, punchY - 6 * scale);
      ctx.fillText('DIE', cx, dieY + dieH + 16 * scale);
      ctx.fillText('BLANK HOLDER', cx - dieW / 2 + 40 * scale, bhY - 20 * scale);

      // Force arrow
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, punchY - 30 * scale);
      ctx.lineTo(cx, punchY - 6 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 5, punchY - 14 * scale);
      ctx.lineTo(cx, punchY - 6 * scale);
      ctx.lineTo(cx + 5, punchY - 14 * scale);
      ctx.fill();
      ctx.font = `bold ${10 * scale}px JetBrains Mono`;
      ctx.fillText('F', cx, punchY - 34 * scale);

      // Draw ratio indicator
      const dr = drawRatio(blankD, punchD);
      ctx.fillStyle = dr > 2.2 ? '#ef4444' : dr > 1.8 ? '#ffab00' : '#22c55e';
      ctx.font = `bold ${12 * scale}px JetBrains Mono`;
      ctx.textAlign = 'right';
      ctx.fillText(`DR = ${dr.toFixed(2)}`, w - 20, 30);
      ctx.font = `${8 * scale}px Inter`;
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.fillText('Draw Ratio', w - 20, 44);

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [blankD, punchD, cupH, thickness, drawPhase, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 380 }} />;
}

export default function DeepDrawSim() {
  const { isDark } = useTheme();
  const [punchD, setPunchD] = useState(60);
  const [cupH, setCupH] = useState(40);
  const [thickness, setThickness] = useState(2);
  const [material, setMaterial] = useState('Mild Steel');
  const [wallThickness, setWallThickness] = useState(1.8);
  const [animating, setAnimating] = useState(false);
  const [drawPhase, setDrawPhase] = useState(0);
  const animRef = useRef(null);

  const blankD = blankDiameter(punchD, cupH);
  const dr = drawRatio(blankD, punchD);
  const ldr = ldrValues[material] || 2.0;
  const numDraws = numberOfDraws(dr, ldr);
  const uts = utsValues[material] || 400;
  const force = drawingForce(punchD, thickness, uts, dr);
  const bhf = blankHolderForce(force);
  const ironing = ironingReduction(thickness, wallThickness);
  const drOk = dr <= ldr;

  // Animation
  useEffect(() => {
    if (!animating) return;
    let dir = 1;
    const tick = () => {
      setDrawPhase(prev => {
        let next = prev + dir * 0.4;
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
      title="Deep Draw Simulator"
      description="Analyze deep drawing with animated forming sequence, draw ratio analysis, and multi-stage draw calculation"
      formula="DR = D_blank / D_punch  |  F = π × d × t × UTS × (DR - 0.7)"
      inputs={<>
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Material</label>
          <select value={material} onChange={e => setMaterial(e.target.value)} className="input-field text-sm">
            {materials.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <CalcSlider label="Punch Diameter" value={punchD} onChange={setPunchD} min={10} max={200} step={1} unit="mm" />
        <CalcSlider label="Cup Height" value={cupH} onChange={setCupH} min={5} max={150} step={1} unit="mm" />
        <CalcSlider label="Sheet Thickness" value={thickness} onChange={setThickness} min={0.5} max={10} step={0.1} unit="mm" />
        <CalcSlider label="Wall Thickness" value={wallThickness} onChange={setWallThickness} min={0.3} max={thickness} step={0.1} unit="mm" />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setAnimating(!animating)}
          className={`w-full py-2 rounded-xl text-xs font-semibold transition-all mt-2 ${animating
            ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30'
            : isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          {animating ? '⏸ Stop' : '▶ Animate Drawing'}
        </motion.button>
      </>}
      results={<>
        <ResultRow label="Blank Diameter" value={blankD.toFixed(1)} unit="mm" />
        <ResultRow label="Draw Ratio" value={dr.toFixed(2)}
          status={drOk ? { text: '✅ Single Draw', cls: 'status-ok' } : { text: `⚠️ ${numDraws} Draws`, cls: 'status-warn' }} />
        <ResultRow label="Limiting DR" value={ldr.toFixed(1)} />
        <ResultRow label="Number of Draws" value={numDraws} />
        <ResultRow label="Drawing Force" value={force.toFixed(1)} unit="kN" />
        <ResultRow label="Blank Holder Force" value={bhf.toFixed(1)} unit="kN" />
        <ResultRow label="Total Force" value={(force + bhf).toFixed(1)} unit="kN" />
        <ResultRow label="Ironing Reduction" value={ironing.toFixed(1)} unit="%"
          status={ironing > 40 ? { text: '⚠️ High', cls: 'status-warn' } : { text: '✅ OK', cls: 'status-ok' }} />
        <ResultRow label="Press (tons)" value={((force + bhf) * 1.2 / 9.81).toFixed(1)} unit="ton" />
      </>}
    >
      <DeepDrawAnimation
        blankD={blankD} punchD={punchD} cupH={cupH} thickness={thickness}
        drawPhase={drawPhase} isDark={isDark}
      />
    </CalculatorLayout>
  );
}
