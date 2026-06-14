import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as PL from '../../../utils/formulas/plastics';

function CoolingAnimation({ wallThickness, thermalDiff, meltTemp, mouldTemp, coolTime }) {
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
      frameRef.current += 0.008;
      const time = frameRef.current;
      ctx.clearRect(0, 0, w, h);

      // Animated time cycles through 0 → coolTime
      const cycleT = (time % 1) * coolTime;

      const margin = 40;
      const plotW = w - margin * 2;
      const plotH = h - margin * 2 - 30;
      const plotX = margin;
      const plotY = margin + 25;

      // Title
      ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('TEMPERATURE PROFILE THROUGH WALL', w / 2, margin - 5);

      // Plot axes
      ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(plotX, plotY);
      ctx.lineTo(plotX, plotY + plotH);
      ctx.lineTo(plotX + plotW, plotY + plotH);
      ctx.stroke();

      // Y-axis labels (temperature)
      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.font = '9px JetBrains Mono';
      ctx.textAlign = 'right';
      const tempRange = meltTemp - mouldTemp;
      for (let i = 0; i <= 4; i++) {
        const t = mouldTemp + (tempRange * i) / 4;
        const y = plotY + plotH - (plotH * i) / 4;
        ctx.fillText(`${Math.round(t)}°`, plotX - 5, y + 3);
        if (i > 0) {
          ctx.beginPath();
          ctx.moveTo(plotX, y);
          ctx.lineTo(plotX + plotW, y);
          ctx.strokeStyle = isDark ? 'rgba(51,65,85,0.3)' : 'rgba(203,213,225,0.5)';
          ctx.stroke();
        }
      }

      // X-axis label
      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.font = '9px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Wall Thickness →', plotX + plotW / 2, plotY + plotH + 20);
      ctx.fillText('0', plotX, plotY + plotH + 12);
      ctx.fillText(`${wallThickness}mm`, plotX + plotW, plotY + plotH + 12);

      // Mould wall indicators
      ctx.fillStyle = isDark ? '#334155' : '#94a3b8';
      ctx.fillRect(plotX - 8, plotY, 8, plotH);
      ctx.fillRect(plotX + plotW, plotY, 8, plotH);
      ctx.fillStyle = '#00e5ff';
      ctx.font = '8px Inter';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(plotX - 12, plotY + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('MOULD', 0, 0);
      ctx.restore();
      ctx.save();
      ctx.translate(plotX + plotW + 12, plotY + plotH / 2);
      ctx.rotate(Math.PI / 2);
      ctx.fillText('MOULD', 0, 0);
      ctx.restore();

      // Temperature profile curve
      const profile = PL.temperatureProfile(wallThickness, thermalDiff, meltTemp, mouldTemp, cycleT, 60);
      ctx.beginPath();
      profile.forEach((pt, i) => {
        const x = plotX + (pt.x / wallThickness) * plotW;
        const y = plotY + plotH - ((pt.temp - mouldTemp) / tempRange) * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      const grad = ctx.createLinearGradient(plotX, plotY, plotX, plotY + plotH);
      grad.addColorStop(0, '#ff4081');
      grad.addColorStop(0.5, '#ff6d00');
      grad.addColorStop(1, '#00e5ff');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Fill under curve with gradient
      ctx.lineTo(plotX + plotW, plotY + plotH);
      ctx.lineTo(plotX, plotY + plotH);
      ctx.closePath();
      const fillGrad = ctx.createLinearGradient(plotX, plotY, plotX, plotY + plotH);
      fillGrad.addColorStop(0, 'rgba(255,64,129,0.15)');
      fillGrad.addColorStop(1, 'rgba(0,229,255,0.05)');
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // Time indicator
      ctx.fillStyle = '#e040fb';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`t = ${cycleT.toFixed(1)}s / ${coolTime.toFixed(1)}s`, w / 2, h - 8);

      // Center temp indicator
      const centerTemp = profile[Math.floor(profile.length / 2)]?.temp || meltTemp;
      ctx.fillStyle = '#ff6d00';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.fillText(`Core: ${centerTemp.toFixed(0)}°C`, w / 2, plotY - 2);

      animFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animFrame);
  }, [wallThickness, thermalDiff, meltTemp, mouldTemp, coolTime, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function CoolingTime() {
  const [material, setMaterial] = useState('PP (Polypropylene)');
  const [wallThickness, setWallThickness] = useState(3);
  const [meltTemp, setMeltTemp] = useState(230);
  const [mouldTemp, setMouldTemp] = useState(40);
  const [ejectTemp, setEjectTemp] = useState(90);
  const [partWeight, setPartWeight] = useState(50);
  const { isDark } = useTheme();

  const props = PL.materialProperties[material] || PL.materialProperties['PP (Polypropylene)'];
  const coolT = PL.coolingTime(wallThickness, props.thermalDiffusivity, meltTemp, mouldTemp, ejectTemp);
  const fillT = 1.5;
  const totalCycle = PL.cycleTime(fillT, coolT);
  const heat = PL.heatPerShot(partWeight, props.specificHeat, meltTemp, ejectTemp);
  const coolantFlow = PL.coolantFlowRate(heat, coolT);
  const shotsPerHr = totalCycle > 0 ? 3600 / totalCycle : 0;

  return (
    <CalculatorLayout
      title="Cooling Time Estimator"
      description="Estimate cooling time using Fourier's equation with animated temperature profile"
      formula="t_cool = (s²/π²α) × ln((8/π²)(T_melt-T_mould)/(T_eject-T_mould))"
      inputs={<>
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Material</label>
          <select value={material} onChange={e => { setMaterial(e.target.value); const p = PL.materialProperties[e.target.value]; if(p) { setMeltTemp((p.meltMin+p.meltMax)/2); setMouldTemp(p.mouldTemp); setEjectTemp(p.ejectTemp); }}} className="input-field text-sm">
            {PL.plasticMaterials.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <CalcSlider label="Wall Thickness" value={wallThickness} onChange={setWallThickness} min={0.5} max={10} step={0.1} unit="mm" />
        <CalcSlider label="Melt Temp" value={meltTemp} onChange={setMeltTemp} min={150} max={420} step={5} unit="°C" />
        <CalcSlider label="Mould Temp" value={mouldTemp} onChange={setMouldTemp} min={10} max={200} step={5} unit="°C" />
        <CalcSlider label="Ejection Temp" value={ejectTemp} onChange={setEjectTemp} min={50} max={250} step={5} unit="°C" />
        <CalcSlider label="Part Weight" value={partWeight} onChange={setPartWeight} min={1} max={500} step={1} unit="g" />
      </>}
      results={<>
        <ResultRow label="Cooling Time" value={coolT} unit="s" />
        <ResultRow label="Est. Cycle Time" value={totalCycle} unit="s" />
        <ResultRow label="Shots/Hour" value={shotsPerHr} unit="" />
        <ResultRow label="Heat/Shot" value={heat / 1000} unit="kJ" />
        <ResultRow label="Coolant Flow" value={coolantFlow} unit="L/min" />
        <ResultRow label="Thermal Diffusivity" value={props.thermalDiffusivity} unit="mm²/s" />
        <ResultRow label="Cooling %" value={totalCycle > 0 ? (coolT / totalCycle) * 100 : 0} unit="%"
          status={coolT / totalCycle > 0.7 ? { text: '⚠️ Dominant', cls: 'status-warn' } : { text: '✅ OK', cls: 'status-ok' }} />
      </>}
    >
      <CoolingAnimation wallThickness={wallThickness} thermalDiff={props.thermalDiffusivity} meltTemp={meltTemp} mouldTemp={mouldTemp} coolTime={Math.max(coolT, 0.1)} />
    </CalculatorLayout>
  );
}
