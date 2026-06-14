import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as PL from '../../../utils/formulas/plastics';

function ShrinkageAnimation({ partDim, cavityDim, shrinkPct, flowShrink, crossShrink }) {
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
      frameRef.current += 0.01;
      const t = frameRef.current;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;

      // Title
      ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('MOULD CAVITY vs PART (exaggerated)', cx, 25);

      // Scale for visualization — exaggerate shrinkage for visibility
      const baseSize = Math.min(w * 0.35, h * 0.35);
      const exaggeration = 5;

      // Cavity (mould) rectangle
      const cavW = baseSize;
      const cavH = baseSize * 0.7;
      ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(cx - cavW / 2, cy - cavH / 2, cavW, cavH);
      ctx.setLineDash([]);

      // Part (shrunken) — animated breathing
      const breath = 0.5 + 0.5 * Math.sin(t * 2);
      const shrinkFactor = 1 - (shrinkPct / 100) * exaggeration * breath;
      const partW = cavW * shrinkFactor;
      const partH = cavH * shrinkFactor;

      // Flow direction indicator
      const flowFactor = 1 - (flowShrink / 100) * exaggeration * breath;
      const crossFactor = 1 - (crossShrink / 100) * exaggeration * breath;
      const flowW = cavW * flowFactor;
      const crossH = cavH * crossFactor;

      // Part with flow/cross-flow shrinkage
      const grad = ctx.createLinearGradient(cx - flowW / 2, cy - crossH / 2, cx + flowW / 2, cy + crossH / 2);
      grad.addColorStop(0, 'rgba(224,64,251,0.3)');
      grad.addColorStop(0.5, 'rgba(0,229,255,0.2)');
      grad.addColorStop(1, 'rgba(255,109,0,0.3)');
      ctx.fillStyle = grad;
      ctx.fillRect(cx - flowW / 2, cy - crossH / 2, flowW, crossH);

      ctx.strokeStyle = '#e040fb';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - flowW / 2, cy - crossH / 2, flowW, crossH);

      // Shrinkage gap highlighting
      const gapColor = 'rgba(255,64,129,0.15)';
      // Left gap
      ctx.fillStyle = gapColor;
      ctx.fillRect(cx - cavW / 2, cy - cavH / 2, (cavW - flowW) / 2, cavH);
      // Right gap
      ctx.fillRect(cx + flowW / 2, cy - cavH / 2, (cavW - flowW) / 2, cavH);
      // Top gap
      ctx.fillRect(cx - cavW / 2, cy - cavH / 2, cavW, (cavH - crossH) / 2);
      // Bottom gap
      ctx.fillRect(cx - cavW / 2, cy + crossH / 2, cavW, (cavH - crossH) / 2);

      // Dimension arrows for cavity
      ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.lineWidth = 1;
      const dimY = cy + cavH / 2 + 20;
      ctx.beginPath();
      ctx.moveTo(cx - cavW / 2, dimY);
      ctx.lineTo(cx + cavW / 2, dimY);
      ctx.stroke();
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = '9px JetBrains Mono';
      ctx.fillText(`Cavity: ${cavityDim.toFixed(2)}mm`, cx, dimY + 12);

      // Dimension for part
      const dimY2 = cy + cavH / 2 + 36;
      ctx.strokeStyle = '#e040fb';
      ctx.beginPath();
      ctx.moveTo(cx - flowW / 2, dimY2);
      ctx.lineTo(cx + flowW / 2, dimY2);
      ctx.stroke();
      ctx.fillStyle = '#e040fb';
      ctx.fillText(`Part: ${partDim.toFixed(2)}mm`, cx, dimY2 + 12);

      // Flow direction arrow
      ctx.fillStyle = '#00e5ff';
      ctx.font = '9px Inter';
      ctx.textAlign = 'left';
      ctx.fillText('→ Flow dir', cx - cavW / 2, cy - cavH / 2 - 8);

      // Shrinkage labels
      ctx.fillStyle = '#ff6d00';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText(`Flow: ${flowShrink.toFixed(2)}%`, w - 15, cy - 10);
      ctx.fillText(`Cross: ${crossShrink.toFixed(2)}%`, w - 15, cy + 10);

      // Legend
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e040fb';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillText(`Shrinkage: ${shrinkPct.toFixed(2)}%`, cx, h - 12);

      animFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animFrame);
  }, [partDim, cavityDim, shrinkPct, flowShrink, crossShrink, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function ShrinkageCalc() {
  const [material, setMaterial] = useState('PP (Polypropylene)');
  const [partDim, setPartDim] = useState(100);
  const [packingPressure, setPackingPressure] = useState(60);
  const [wallThickness, setWallThickness] = useState(2.5);
  const { isDark } = useTheme();

  const props = PL.materialProperties[material] || PL.materialProperties['PP (Polypropylene)'];
  const linShrink = PL.linearShrinkage(props.shrinkMin, props.shrinkMax, packingPressure);
  const volShrink = PL.volumetricShrinkage(linShrink);
  const cavDim = PL.cavityDimension(partDim, linShrink);
  const semiCryst = PL.isSemiCrystalline(material);
  const flowS = PL.flowShrinkage(linShrink, semiCryst);
  const crossS = PL.crossFlowShrinkage(linShrink, semiCryst);

  return (
    <CalculatorLayout
      title="Shrinkage Calculator"
      description="Calculate mould cavity dimensions accounting for plastic shrinkage"
      formula="D_mould = D_part / (1 − S/100)"
      inputs={<>
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Material</label>
          <select value={material} onChange={e => setMaterial(e.target.value)} className="input-field text-sm">
            {PL.plasticMaterials.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <CalcSlider label="Part Dimension" value={partDim} onChange={setPartDim} min={5} max={500} step={1} unit="mm" />
        <CalcSlider label="Packing Pressure" value={packingPressure} onChange={setPackingPressure} min={10} max={150} step={5} unit="MPa" />
        <CalcSlider label="Wall Thickness" value={wallThickness} onChange={setWallThickness} min={0.5} max={8} step={0.1} unit="mm" />
      </>}
      results={<>
        <ResultRow label="Linear Shrinkage" value={linShrink} unit="%" />
        <ResultRow label="Volumetric Shrinkage" value={volShrink} unit="%" />
        <ResultRow label="Cavity Dimension" value={cavDim} unit="mm" />
        <ResultRow label="Shrinkage Allowance" value={cavDim - partDim} unit="mm" />
        <ResultRow label="Flow Shrinkage" value={flowS} unit="%" />
        <ResultRow label="Cross-Flow Shrinkage" value={crossS} unit="%" />
        <ResultRow label="Material Type" value={semiCryst ? 'Semi-Crystalline' : 'Amorphous'} />
        <ResultRow label="Shrinkage Range" value={`${props.shrinkMin}–${props.shrinkMax}`} unit="%" />
      </>}
    >
      <ShrinkageAnimation partDim={partDim} cavityDim={cavDim} shrinkPct={linShrink} flowShrink={flowS} crossShrink={crossS} />
    </CalculatorLayout>
  );
}
