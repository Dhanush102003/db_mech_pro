import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as SM from '../../../utils/formulas/sheetmetal';

function SpringbackAnim({ desired, corrected, springback }) {
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
    const cx = w / 2, cy = h / 2 + 10;
    const legLen = 70;

    // Draw a bent part at the desired angle (dashed - target)
    const drawBend = (angle, color, dash, label, offsetX) => {
      const aRad = (angle * Math.PI) / 180;
      const bx = cx + offsetX;
      ctx.save();
      ctx.translate(bx, cy);
      // Left leg
      ctx.beginPath();
      ctx.moveTo(-legLen, 0);
      ctx.lineTo(0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      if (dash) ctx.setLineDash(dash);
      ctx.stroke();
      // Right leg (rotated)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(legLen * Math.cos(-aRad), legLen * Math.sin(-aRad));
      ctx.stroke();
      ctx.setLineDash([]);
      // Angle arc
      ctx.beginPath();
      ctx.arc(0, 0, 25, 0, -aRad, aRad > 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Label
      ctx.fillStyle = color;
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`${angle.toFixed(1)}°`, 35 * Math.cos(-aRad / 2), 35 * Math.sin(-aRad / 2) - 5);
      ctx.font = '9px Inter';
      ctx.fillText(label, 0, legLen + 20);
      ctx.restore();
    };

    // Desired (target)
    drawBend(desired, isDark ? '#475569' : '#94a3b8', [5, 5], 'TARGET', -60);
    // After springback (actual result)
    drawBend(desired - springback, '#ff174480', null, 'AFTER SPRINGBACK', 60);

    // Corrected angle info
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 11px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`Overbend to: ${corrected.toFixed(1)}° → springs back to ${desired.toFixed(1)}°`, cx, h - 25);

    // Springback arrow
    ctx.fillStyle = '#ff1744';
    ctx.font = '9px Inter';
    ctx.fillText(`Springback: ${springback.toFixed(2)}°`, cx, h - 10);
  }, [desired, corrected, springback, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function SpringbackCalc() {
  const [desiredAngle, setDesiredAngle] = useState(90);
  const [bendRadius, setBendRadius] = useState(5);
  const [thickness, setThickness] = useState(2);
  const [material, setMaterial] = useState('Mild Steel');
  const { isDark } = useTheme();

  const sy = SM.yieldStrengthValues[material] || 250;
  const E = (SM.elasticModulusValues[material] || 200) * 1000;
  const ks = SM.springbackFactor(sy, bendRadius, thickness, E);
  const corrected = SM.correctedBendAngle(desiredAngle, ks);
  const sb = SM.springbackAngle(desiredAngle, ks);

  return (
    <CalculatorLayout title="Springback Calculator"
      description="Springback angle prediction and overbend correction factor"
      formula="Ks = 1 - 3σy·R/(E·T) + 4(σy/E)³(R/T)³"
      inputs={<>
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Material</label>
          <select value={material} onChange={e => setMaterial(e.target.value)} className="input-field text-sm">
            {SM.materials.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <CalcSlider label="Desired Angle" value={desiredAngle} onChange={setDesiredAngle} min={10} max={180} step={1} unit="°" />
        <CalcSlider label="Bend Radius" value={bendRadius} onChange={setBendRadius} min={0.5} max={50} step={0.5} unit="mm" />
        <CalcSlider label="Thickness" value={thickness} onChange={setThickness} min={0.5} max={20} step={0.5} unit="mm" />
      </>}
      results={<>
        <ResultRow label="Yield Strength" value={sy} unit="MPa" />
        <ResultRow label="Elastic Modulus" value={E / 1000} unit="GPa" />
        <ResultRow label="Springback Factor (Ks)" value={ks} />
        <ResultRow label="Corrected Bend Angle" value={corrected} unit="°" />
        <ResultRow label="Springback Angle" value={sb} unit="°" />
        <ResultRow label="R/T Ratio" value={bendRadius / thickness} />
      </>}
    >
      <SpringbackAnim desired={desiredAngle} corrected={corrected} springback={sb} />
    </CalculatorLayout>
  );
}
