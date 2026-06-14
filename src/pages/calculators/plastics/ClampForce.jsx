import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as PL from '../../../utils/formulas/plastics';

function ClampAnimation({ partL, partW, numCavities, clampForceKN, cavityPressure }) {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    let animFrame;

    const draw = () => {
      frameRef.current += 0.02;
      const t = frameRef.current;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2, cy = h / 2;

      // Mould base (top view)
      const mouldW = Math.min(w * 0.7, 280);
      const mouldH = Math.min(h * 0.65, 220);
      const mx = cx - mouldW / 2, my = cy - mouldH / 2;

      // Outer mould border
      ctx.strokeStyle = isDark ? '#334155' : '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(mx, my, mouldW, mouldH);
      ctx.fillStyle = isDark ? 'rgba(30,41,59,0.6)' : 'rgba(226,232,240,0.6)';
      ctx.fillRect(mx, my, mouldW, mouldH);

      // Label
      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('MOULD — TOP VIEW', cx, my - 8);

      // Calculate cavity layout
      const cols = numCavities <= 2 ? numCavities : numCavities <= 4 ? 2 : Math.ceil(Math.sqrt(numCavities));
      const rows = Math.ceil(numCavities / cols);
      const maxPartW = (mouldW - 40) / cols;
      const maxPartH = (mouldH - 40) / rows;
      const scale = Math.min(maxPartW / partL, maxPartH / partW, 1) * 0.7;
      const pW = partL * scale;
      const pH = partW * scale;
      const gapX = (mouldW - cols * pW) / (cols + 1);
      const gapY = (mouldH - rows * pH) / (rows + 1);

      let cavIdx = 0;
      for (let r = 0; r < rows && cavIdx < numCavities; r++) {
        for (let c = 0; c < cols && cavIdx < numCavities; c++) {
          const px = mx + gapX + c * (pW + gapX);
          const py = my + gapY + r * (pH + gapY);

          // Pressure heatmap — animated pulsing
          const pulse = 0.6 + 0.4 * Math.sin(t * 2 + cavIdx * 0.5);
          const pressureNorm = Math.min(cavityPressure / 150, 1);
          const r1 = Math.floor(255 * pressureNorm * pulse);
          const g1 = Math.floor(100 * (1 - pressureNorm));
          const b1 = Math.floor(255 * (1 - pressureNorm) * 0.5);

          // Cavity fill with gradient
          const grad = ctx.createRadialGradient(
            px + pW / 2, py + pH / 2, 2,
            px + pW / 2, py + pH / 2, Math.max(pW, pH)
          );
          grad.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, 0.7)`);
          grad.addColorStop(1, `rgba(${r1}, ${g1}, ${b1}, 0.2)`);
          ctx.fillStyle = grad;
          ctx.fillRect(px, py, pW, pH);

          // Cavity outline
          ctx.strokeStyle = `rgba(${r1}, ${g1 + 50}, ${b1 + 100}, 0.8)`;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px, py, pW, pH);

          // Gate point (small circle at center-bottom)
          ctx.beginPath();
          ctx.arc(px + pW / 2, py + pH, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#e040fb';
          ctx.fill();

          cavIdx++;
        }
      }

      // Dimension lines
      if (numCavities >= 1) {
        const dimPx = mx + gapX;
        const dimPy = my + gapY;

        // Part width dimension
        ctx.beginPath();
        ctx.moveTo(dimPx, dimPy + pH + 12);
        ctx.lineTo(dimPx + pW, dimPy + pH + 12);
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#00e5ff';
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`${partL}mm`, dimPx + pW / 2, dimPy + pH + 22);

        // Part height dimension
        ctx.beginPath();
        ctx.moveTo(dimPx + pW + 12, dimPy);
        ctx.lineTo(dimPx + pW + 12, dimPy + pH);
        ctx.stroke();
        ctx.save();
        ctx.translate(dimPx + pW + 22, dimPy + pH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(`${partW}mm`, 0, 0);
        ctx.restore();
      }

      // Force arrows (top & bottom)
      const arrowY1 = my - 15;
      const arrowY2 = my + mouldH + 15;
      ctx.strokeStyle = '#ff4081';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#ff4081';

      for (let i = 0; i < 3; i++) {
        const ax = mx + mouldW * (i + 1) / 4;
        // Top arrow pointing down
        ctx.beginPath();
        ctx.moveTo(ax, arrowY1 - 15);
        ctx.lineTo(ax, arrowY1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ax - 4, arrowY1 - 6);
        ctx.lineTo(ax, arrowY1);
        ctx.lineTo(ax + 4, arrowY1 - 6);
        ctx.fill();

        // Bottom arrow pointing up
        ctx.beginPath();
        ctx.moveTo(ax, arrowY2 + 15);
        ctx.lineTo(ax, arrowY2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ax - 4, arrowY2 + 6);
        ctx.lineTo(ax, arrowY2);
        ctx.lineTo(ax + 4, arrowY2 + 6);
        ctx.fill();
      }

      // Clamp force label
      ctx.fillStyle = '#ff4081';
      ctx.font = 'bold 12px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`Clamp: ${PL.kNToTons(clampForceKN).toFixed(0)} tons`, cx, h - 12);

      // Pressure legend
      ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
      ctx.font = '9px Inter';
      ctx.fillText(`Cavity pressure: ${cavityPressure} MPa`, cx, my - 22);

      animFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrame);
  }, [partL, partW, numCavities, clampForceKN, cavityPressure, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function ClampForce() {
  const [partLength, setPartLength] = useState(150);
  const [partWidth, setPartWidth] = useState(100);
  const [numCavities, setNumCavities] = useState(2);
  const [cavityPressure, setCavityPressure] = useState(40);
  const [material, setMaterial] = useState('PP (Polypropylene)');
  const [safetyFactor, setSafetyFactor] = useState(1.1);
  const { isDark } = useTheme();

  const area = PL.projectedArea(partLength, partWidth);
  const clampKN = PL.clampForce(cavityPressure, area, numCavities, safetyFactor);
  const clampTons = PL.kNToTons(clampKN);
  const machineSize = PL.recommendMachine(clampTons);

  return (
    <CalculatorLayout
      title="Clamp Force Calculator"
      description="Calculate required clamping force for injection moulding machine selection based on projected area and cavity pressure"
      formula="F_clamp = P_cavity × A_projected × N_cavities × SF"
      inputs={<>
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Material</label>
          <select value={material} onChange={e => setMaterial(e.target.value)} className="input-field text-sm">
            {PL.plasticMaterials.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <CalcSlider label="Part Length" value={partLength} onChange={setPartLength} min={10} max={600} step={5} unit="mm" />
        <CalcSlider label="Part Width" value={partWidth} onChange={setPartWidth} min={10} max={600} step={5} unit="mm" />
        <CalcSlider label="No. of Cavities" value={numCavities} onChange={setNumCavities} min={1} max={32} step={1} unit="" />
        <CalcSlider label="Cavity Pressure" value={cavityPressure} onChange={setCavityPressure} min={10} max={150} step={5} unit="MPa" />
        <CalcSlider label="Safety Factor" value={safetyFactor} onChange={setSafetyFactor} min={1.0} max={1.5} step={0.05} unit="×" />
      </>}
      results={<>
        <ResultRow label="Projected Area (per cavity)" value={area} unit="mm²" />
        <ResultRow label="Total Projected Area" value={area * numCavities} unit="mm²" />
        <ResultRow label="Clamp Force" value={clampKN} unit="kN" />
        <ResultRow label="Clamp Force" value={clampTons} unit="tons" />
        <ResultRow label="Recommended Machine" value={`${machineSize} T`} />
        <ResultRow label="Rec. Injection Pressure" value={PL.materialProperties[material]?.recPressure || 0} unit="MPa" />
        <ResultRow label="Machine Utilization" value={clampTons / machineSize * 100} unit="%" status={
          clampTons / machineSize > 0.9 ? { text: '⚠️ Tight', cls: 'status-warn' } :
          clampTons / machineSize > 0.7 ? { text: '✅ Good', cls: 'status-ok' } :
          { text: 'ℹ️ Oversized', cls: 'status-warn' }
        } />
      </>}
    >
      <ClampAnimation
        partL={partLength}
        partW={partWidth}
        numCavities={numCavities}
        clampForceKN={clampKN}
        cavityPressure={cavityPressure}
      />
    </CalculatorLayout>
  );
}
