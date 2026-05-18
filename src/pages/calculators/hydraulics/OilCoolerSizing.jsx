import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as H from '../../../utils/formulas/hydraulics';

function CoolerAnimation({ oilIn, oilOut, airTemp, lmtdVal }) {
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

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2, cy = h / 2 - 10;
      const cW = 160, cH = 100;

      // Heat exchanger body
      ctx.beginPath();
      ctx.roundRect(cx - cW / 2, cy - cH / 2, cW, cH, 8);
      ctx.fillStyle = isDark ? '#1e293b' : '#e2e8f0';
      ctx.fill();
      ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Internal tubes (oil passes)
      for (let i = 0; i < 5; i++) {
        const ty = cy - cH / 2 + 15 + i * 18;
        ctx.beginPath();
        ctx.moveTo(cx - cW / 2 + 10, ty);
        ctx.lineTo(cx + cW / 2 - 10, ty);
        ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Temperature gradient in tube
        const gradient = ctx.createLinearGradient(cx - cW / 2 + 10, 0, cx + cW / 2 - 10, 0);
        gradient.addColorStop(0, '#ef444480');
        gradient.addColorStop(1, '#3b82f680');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Flow dots
        const speed = 1.5;
        for (let j = 0; j < 3; j++) {
          const dx = ((frame * speed + j * 55 + i * 20) % (cW - 20));
          ctx.beginPath();
          ctx.arc(cx - cW / 2 + 10 + dx, ty, 2, 0, Math.PI * 2);
          const t = dx / (cW - 20);
          ctx.fillStyle = `rgba(${255 - t * 200}, ${t * 100 + 50}, ${t * 200}, 0.8)`;
          ctx.fill();
        }
      }

      // Air flow arrows (crossing)
      ctx.globalAlpha = 0.4;
      for (let i = 0; i < 6; i++) {
        const ay = cy - cH / 2 + ((frame * 0.8 + i * 20) % (cH + 20)) - 10;
        ctx.beginPath();
        ctx.moveTo(cx - 5, ay);
        ctx.lineTo(cx + 5, ay + 5);
        ctx.lineTo(cx - 5, ay + 10);
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Labels: hot oil in
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText(`${oilIn}°C`, cx - cW / 2 - 8, cy - 10);
      ctx.font = '8px Inter';
      ctx.fillText('Oil In (Hot)', cx - cW / 2 - 8, cy + 3);

      // Cold oil out
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(`${oilOut}°C`, cx + cW / 2 + 8, cy - 10);
      ctx.font = '8px Inter';
      ctx.fillText('Oil Out (Cool)', cx + cW / 2 + 8, cy + 3);

      // Air temp
      ctx.fillStyle = '#00e5ff';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`Air: ${airTemp}°C`, cx, cy - cH / 2 - 12);

      // LMTD display
      ctx.fillStyle = isDark ? '#ffffff90' : '#1e293b90';
      ctx.font = 'bold 12px JetBrains Mono';
      ctx.fillText(`LMTD = ${lmtdVal.toFixed(1)}°C`, cx, h - 25);

      // Temperature profile (bottom)
      const gY = h - 60, gH = 30, gW = w - 80;
      ctx.beginPath();
      ctx.moveTo(40, gY - gH);
      for (let i = 0; i <= gW; i++) {
        const t = i / gW;
        const temp = oilIn - (oilIn - oilOut) * t;
        const y = gY - ((temp - airTemp) / (oilIn - airTemp + 1)) * gH;
        ctx.lineTo(40 + i, y);
      }
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Air line
      ctx.beginPath();
      ctx.moveTo(40, gY - 2);
      ctx.lineTo(40 + gW, gY - 2);
      ctx.strokeStyle = '#00e5ff60';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '7px Inter';
      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('Cooler Position →', 40 + gW / 2, gY + 10);

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [oilIn, oilOut, airTemp, lmtdVal, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function OilCoolerSizing() {
  const [heatKW, setHeatKW] = useState(1.46);
  const [coolerType, setCoolerType] = useState('Air-Oil (Engine Fan)');
  const [oilIn, setOilIn] = useState(80);
  const [oilOut, setOilOut] = useState(55);
  const [airTemp, setAirTemp] = useState(40);
  const [areaSF, setAreaSF] = useState(1.2);
  const { isDark } = useTheme();

  const dt1 = oilIn - airTemp;
  const dt2 = oilOut - airTemp;
  const lmtdVal = H.lmtd(dt1, dt2);
  const uVal = H.uValueFromType(coolerType);
  const heatW = heatKW * 1000;
  const areaReq = H.coolerArea(heatW, uVal, lmtdVal);
  const areaWithSF = areaReq * areaSF;
  const areaCM2 = areaWithSF * 10000;
  const sqSide = Math.sqrt(areaWithSF) * 1000;
  const rectW = Math.sqrt(areaWithSF / 2) * 1000;
  const rectH = rectW * 2;

  return (
    <CalculatorLayout
      title="Oil Cooler Sizing Calculator"
      description="LMTD-based cooler area calculation with heat exchanger animation — verified against Excel Sheet 4"
      formula="LMTD = (ΔT1-ΔT2) / ln(ΔT1/ΔT2) | A = Q / (U × LMTD)"
      inputs={<>
        <CalcSlider label="Design Heat Load" value={heatKW} onChange={setHeatKW} min={0.1} max={10} step={0.1} unit="kW" />
        <div className="space-y-1.5">
          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Cooler Type</label>
          <select value={coolerType} onChange={e => setCoolerType(e.target.value)} className="input-field text-sm">
            <option>Air-Oil (Engine Fan)</option>
            <option>Air-Oil (Separate Fan)</option>
            <option>Water-Oil</option>
          </select>
        </div>
        <CalcSlider label="Oil Inlet Temp" value={oilIn} onChange={setOilIn} min={40} max={120} step={1} unit="°C" />
        <CalcSlider label="Oil Outlet Target" value={oilOut} onChange={setOilOut} min={30} max={100} step={1} unit="°C" />
        <CalcSlider label="Ambient Temp" value={airTemp} onChange={setAirTemp} min={10} max={50} step={1} unit="°C" />
        <CalcSlider label="Area Safety Factor" value={areaSF} onChange={setAreaSF} min={1} max={1.5} step={0.05} unit="×" />
      </>}
      results={<>
        <ResultRow label="ΔT1 (Hot End)" value={dt1} unit="°C" />
        <ResultRow label="ΔT2 (Cold End)" value={dt2} unit="°C" status={dt2 <= 0 ? { text: '❌ Invalid', cls: 'status-fail' } : { text: '✅', cls: 'status-ok' }} />
        <ResultRow label="LMTD (Corrected)" value={lmtdVal} unit="°C" />
        <ResultRow label="U Value" value={uVal} unit="W/m²K" />
        <ResultRow label="Required Area" value={areaReq} unit="m²" />
        <ResultRow label="Area with SF" value={areaWithSF} unit="m²" />
        <ResultRow label="Area (cm²)" value={areaCM2} unit="cm²" />
        <ResultRow label="Square Cooler" value={`${sqSide.toFixed(0)} × ${sqSide.toFixed(0)}`} unit="mm" />
        <ResultRow label="Rect (2:1)" value={`${rectW.toFixed(0)} × ${rectH.toFixed(0)}`} unit="mm" />
      </>}
    >
      <CoolerAnimation oilIn={oilIn} oilOut={oilOut} airTemp={airTemp} lmtdVal={lmtdVal} />
    </CalculatorLayout>
  );
}
