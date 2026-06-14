import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as PL from '../../../utils/formulas/plastics';

function PressureAnimation({ stages, totalPressure }) {
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
      frameRef.current += 0.015;
      const t = frameRef.current;
      ctx.clearRect(0, 0, w, h);
      const margin = 30;
      const barAreaW = w - margin * 2;

      ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('PRESSURE DISTRIBUTION', w / 2, margin);

      const labels = ['Nozzle', 'Runner', 'Gate', 'Cavity'];
      const colors = ['#7c4dff', '#00e5ff', '#e040fb', '#ff6d00'];
      const pressures = [stages.nozzle, stages.runner, stages.gate, stages.cavity];
      const totalP = pressures.reduce((a, b) => a + b, 0);
      let xPos = margin;

      pressures.forEach((p, i) => {
        const sW = totalP > 0 ? (p / totalP) * barAreaW : barAreaW / 4;
        const barH = 60 * (0.9 + 0.1 * Math.sin(t * 3 + i));
        const by = h / 2 - barH / 2;
        ctx.fillStyle = colors[i] + 'cc';
        ctx.fillRect(xPos + 1, by, Math.max(sW - 2, 4), barH);
        // Flow particles
        for (let pi = 0; pi < 4; pi++) {
          const px = xPos + ((t * 60 + pi * sW / 4) % sW);
          ctx.beginPath();
          ctx.arc(px, h / 2 + Math.sin(t * 5 + pi) * 10, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.fill();
        }
        ctx.fillStyle = colors[i];
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], xPos + sW / 2, h / 2 + barH / 2 + 16);
        ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillText(`${p.toFixed(1)} MPa`, xPos + sW / 2, h / 2 + barH / 2 + 30);
        xPos += sW;
      });

      ctx.fillStyle = '#ff4081';
      ctx.font = 'bold 12px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`Total: ${totalPressure.toFixed(1)} MPa`, w / 2, h - 15);
      animFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animFrame);
  }, [stages, totalPressure, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function InjectionPressure() {
  const [material, setMaterial] = useState('ABS');
  const [wallThickness, setWallThickness] = useState(2.5);
  const [flowLength, setFlowLength] = useState(150);
  const [runnerLength, setRunnerLength] = useState(80);
  const [runnerDia, setRunnerDia] = useState(6);
  const [gateAreaVal, setGateAreaVal] = useState(4);
  const [partVolume, setPartVolume] = useState(25);
  const [fillTimeTarget, setFillTimeTarget] = useState(1.5);
  const { isDark } = useTheme();

  const props = PL.materialProperties[material] || PL.materialProperties['ABS'];
  const flowRate = partVolume / fillTimeTarget;
  const flowRateMM3 = flowRate * 1000;

  const nozzleDrop = 5;
  const runnerDrop = Math.min(PL.runnerPressureDrop(runnerLength, runnerDia, flowRateMM3, props.viscosity), 60);
  const gateDrop = Math.min(PL.gatePressureDrop(gateAreaVal, flowRateMM3, props.viscosity), 80);
  const cavityDrop = PL.cavityPressureDrop(flowLength, wallThickness, props.viscosity);
  const totalP = PL.totalInjectionPressure(runnerDrop, gateDrop, cavityDrop, nozzleDrop);
  const stages = { nozzle: nozzleDrop, runner: runnerDrop, gate: gateDrop, cavity: cavityDrop };

  return (
    <CalculatorLayout
      title="Injection Pressure Calculator"
      description="Estimate injection pressure through nozzle → runner → gate → cavity"
      formula="P_total = ΔP_nozzle + ΔP_runner + ΔP_gate + ΔP_cavity"
      inputs={<>
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Material</label>
          <select value={material} onChange={e => setMaterial(e.target.value)} className="input-field text-sm">
            {PL.plasticMaterials.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <CalcSlider label="Wall Thickness" value={wallThickness} onChange={setWallThickness} min={0.5} max={8} step={0.1} unit="mm" />
        <CalcSlider label="Flow Length" value={flowLength} onChange={setFlowLength} min={20} max={500} step={5} unit="mm" />
        <CalcSlider label="Runner Length" value={runnerLength} onChange={setRunnerLength} min={10} max={200} step={5} unit="mm" />
        <CalcSlider label="Runner Diameter" value={runnerDia} onChange={setRunnerDia} min={2} max={14} step={0.5} unit="mm" />
        <CalcSlider label="Gate Area" value={gateAreaVal} onChange={setGateAreaVal} min={0.5} max={20} step={0.5} unit="mm²" />
        <CalcSlider label="Part Volume" value={partVolume} onChange={setPartVolume} min={1} max={500} step={1} unit="cm³" />
        <CalcSlider label="Fill Time" value={fillTimeTarget} onChange={setFillTimeTarget} min={0.2} max={5} step={0.1} unit="s" />
      </>}
      results={<>
        <ResultRow label="Nozzle ΔP" value={nozzleDrop} unit="MPa" />
        <ResultRow label="Runner ΔP" value={runnerDrop} unit="MPa" />
        <ResultRow label="Gate ΔP" value={gateDrop} unit="MPa" />
        <ResultRow label="Cavity ΔP" value={cavityDrop} unit="MPa" />
        <ResultRow label="Total Pressure" value={totalP} unit="MPa" />
        <ResultRow label="Rec. Machine Pressure" value={props.recPressure} unit="MPa" />
        <ResultRow label="Pressure Margin" value={props.recPressure - totalP} unit="MPa"
          status={totalP > props.recPressure ? { text: '⚠️ Exceeds', cls: 'status-warn' } : { text: '✅ OK', cls: 'status-ok' }} />
        <ResultRow label="Flow Rate" value={flowRate} unit="cm³/s" />
      </>}
    >
      <PressureAnimation stages={stages} totalPressure={totalP} />
    </CalculatorLayout>
  );
}
