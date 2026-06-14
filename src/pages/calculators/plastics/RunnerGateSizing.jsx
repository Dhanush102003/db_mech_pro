import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as PL from '../../../utils/formulas/plastics';

function RunnerAnimation({ runnerDia, numCavities, gateW, gateT, runnerType }) {
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

      ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('RUNNER LAYOUT — TOP VIEW', cx, 22);

      // Sprue (center)
      const sprueR = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, sprueR, 0, Math.PI * 2);
      ctx.fillStyle = '#e040fb';
      ctx.fill();
      ctx.strokeStyle = '#e040fb';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Runner scale
      const runnerW = Math.max(runnerDia * 1.5, 4);
      const runnerLen = Math.min(80, w * 0.25);

      // Draw runners & cavities based on number of cavities
      const angles = [];
      if (numCavities <= 2) {
        angles.push(0, Math.PI);
      } else if (numCavities <= 4) {
        for (let i = 0; i < numCavities; i++) angles.push((i * Math.PI * 2) / numCavities - Math.PI / 4);
      } else {
        for (let i = 0; i < numCavities; i++) angles.push((i * Math.PI * 2) / numCavities);
      }

      angles.slice(0, numCavities).forEach((angle, i) => {
        const endX = cx + Math.cos(angle) * runnerLen;
        const endY = cy + Math.sin(angle) * runnerLen;

        // Runner path
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = runnerW;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Runner outline
        ctx.strokeStyle = isDark ? 'rgba(0,229,255,0.4)' : 'rgba(0,184,212,0.4)';
        ctx.lineWidth = runnerW + 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.lineWidth = runnerW;
        ctx.strokeStyle = isDark ? 'rgba(0,229,255,0.2)' : 'rgba(0,184,212,0.15)';
        ctx.stroke();

        // Flow particles
        for (let p = 0; p < 3; p++) {
          const prog = ((t * 1.5 + p * 0.33) % 1);
          const px = cx + Math.cos(angle) * runnerLen * prog;
          const py = cy + Math.sin(angle) * runnerLen * prog;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${0.8 - prog * 0.5})`;
          ctx.fill();
        }

        // Gate (small rectangle at end of runner)
        const gateLen = Math.max(gateW * 0.8, 4);
        const gateTh = Math.max(gateT * 1.2, 2);
        ctx.save();
        ctx.translate(endX, endY);
        ctx.rotate(angle);
        ctx.fillStyle = '#ff6d00';
        ctx.fillRect(0, -gateTh / 2, gateLen, gateTh);
        ctx.restore();

        // Cavity (rectangle beyond gate)
        const cavX = endX + Math.cos(angle) * (gateLen + 10);
        const cavY = endY + Math.sin(angle) * (gateLen + 10);
        const cavSize = 30;
        ctx.save();
        ctx.translate(cavX, cavY);
        ctx.rotate(angle);
        ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-cavSize / 2, -cavSize / 2 + 2, cavSize, cavSize - 4);
        ctx.fillStyle = isDark ? 'rgba(30,41,59,0.5)' : 'rgba(226,232,240,0.5)';
        ctx.fillRect(-cavSize / 2, -cavSize / 2 + 2, cavSize, cavSize - 4);
        ctx.restore();

        // Cavity label
        ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
        ctx.font = '8px Inter';
        ctx.textAlign = 'center';
        const lx = cavX + Math.cos(angle) * 22;
        const ly = cavY + Math.sin(angle) * 22;
        ctx.fillText(`C${i + 1}`, lx, ly);
      });

      // Sprue label
      ctx.fillStyle = '#e040fb';
      ctx.font = 'bold 9px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('SPRUE', cx, cy - sprueR - 6);

      // Dimensions
      ctx.fillStyle = '#00e5ff';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`Ø${runnerDia.toFixed(1)}mm ${runnerType}`, cx, h - 28);

      ctx.fillStyle = '#ff6d00';
      ctx.fillText(`Gate: ${gateW.toFixed(1)}×${gateT.toFixed(1)}mm`, cx, h - 12);

      animFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animFrame);
  }, [runnerDia, numCavities, gateW, gateT, runnerType, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function RunnerGateSizing() {
  const [material, setMaterial] = useState('ABS');
  const [partWeight, setPartWeight] = useState(30);
  const [numCavities, setNumCavities] = useState(4);
  const [runnerLength, setRunnerLength] = useState(80);
  const [wallThickness, setWallThickness] = useState(2);
  const [runnerType, setRunnerType] = useState('full-round');
  const { isDark } = useTheme();

  const props = PL.materialProperties[material] || PL.materialProperties['ABS'];
  const recDia = PL.runnerDiameter(partWeight, runnerLength);
  const rArea = PL.runnerArea(recDia, runnerType);
  const rVolume = PL.runnerVolume(rArea, runnerLength) * numCavities;
  const gateT = PL.gateThickness(wallThickness);
  const gateW = PL.gateWidth(partWeight, wallThickness);
  const gateLand = PL.gateLandLength(gateT);
  const gateA = PL.gateArea(gateW, gateT);
  const freezeT = PL.gateFreezeTime(gateT, props.thermalDiffusivity);
  const partVol = PL.partVolume(partWeight, props.density);
  const regrind = PL.regrindPercentage(rVolume, partVol, numCavities);

  return (
    <CalculatorLayout
      title="Runner & Gate Sizing"
      description="Calculate optimal runner diameter, gate dimensions, and regrind percentage"
      formula="D_runner ≈ (W^0.5 × L^0.25) / K"
      inputs={<>
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Material</label>
          <select value={material} onChange={e => setMaterial(e.target.value)} className="input-field text-sm">
            {PL.plasticMaterials.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Runner Type</label>
          <select value={runnerType} onChange={e => setRunnerType(e.target.value)} className="input-field text-sm">
            {PL.runnerTypes.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>
        <CalcSlider label="Part Weight" value={partWeight} onChange={setPartWeight} min={1} max={200} step={1} unit="g" />
        <CalcSlider label="No. of Cavities" value={numCavities} onChange={setNumCavities} min={1} max={16} step={1} unit="" />
        <CalcSlider label="Runner Length" value={runnerLength} onChange={setRunnerLength} min={20} max={200} step={5} unit="mm" />
        <CalcSlider label="Wall Thickness" value={wallThickness} onChange={setWallThickness} min={0.5} max={6} step={0.1} unit="mm" />
      </>}
      results={<>
        <ResultRow label="Runner Diameter" value={recDia} unit="mm" />
        <ResultRow label="Runner Area" value={rArea} unit="mm²" />
        <ResultRow label="Total Runner Vol" value={rVolume / 1000} unit="cm³" />
        <ResultRow label="Gate Width" value={gateW} unit="mm" />
        <ResultRow label="Gate Thickness" value={gateT} unit="mm" />
        <ResultRow label="Gate Land" value={gateLand} unit="mm" />
        <ResultRow label="Gate Area" value={gateA} unit="mm²" />
        <ResultRow label="Gate Freeze Time" value={freezeT} unit="s" />
        <ResultRow label="Regrind %" value={regrind} unit="%" status={
          regrind > 30 ? { text: '⚠️ High', cls: 'status-warn' } :
          regrind > 15 ? { text: 'ℹ️ Moderate', cls: 'status-warn' } :
          { text: '✅ Good', cls: 'status-ok' }
        } />
      </>}
    >
      <RunnerAnimation runnerDia={recDia} numCavities={numCavities} gateW={gateW} gateT={gateT} runnerType={PL.runnerTypes.find(r => r.id === runnerType)?.label || 'Full Round'} />
    </CalculatorLayout>
  );
}
