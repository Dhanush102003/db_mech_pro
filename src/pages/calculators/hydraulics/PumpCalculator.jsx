import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as H from '../../../utils/formulas/hydraulics';

function GearPumpAnimation({ flow, rpm, pressure }) {
  const canvasRef = useRef(null);
  const animRef = useRef(0);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    let angle = 0;
    const speed = (rpm / 2200) * 0.08;
    const flowScale = Math.min(flow / 30, 1);
    const particles = Array.from({ length: 20 }, () => ({
      x: Math.random() * w, y: h * 0.3 + Math.random() * h * 0.4,
      vx: 1 + Math.random() * 2, size: 2 + Math.random() * 3, phase: Math.random() * Math.PI * 2,
    }));

    const drawGear = (cx, cy, r, teeth, rot, color) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const a1 = (i / teeth) * Math.PI * 2;
        const a2 = ((i + 0.3) / teeth) * Math.PI * 2;
        const a3 = ((i + 0.5) / teeth) * Math.PI * 2;
        const a4 = ((i + 0.8) / teeth) * Math.PI * 2;
        ctx.lineTo(Math.cos(a1) * r, Math.sin(a1) * r);
        ctx.lineTo(Math.cos(a2) * (r + 8), Math.sin(a2) * (r + 8));
        ctx.lineTo(Math.cos(a3) * (r + 8), Math.sin(a3) * (r + 8));
        ctx.lineTo(Math.cos(a4) * r, Math.sin(a4) * r);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = isDark ? '#00e5ff40' : '#0088aa40';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#00e5ff' : '#0088aa';
      ctx.fill();
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      angle += speed;

      // Housing
      const cx = w / 2, cy = h / 2;
      ctx.beginPath();
      ctx.roundRect(cx - 70, cy - 50, 140, 100, 12);
      ctx.fillStyle = isDark ? '#1a2236' : '#e2e8f0';
      ctx.fill();
      ctx.strokeStyle = isDark ? '#334155' : '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('GEAR PUMP', cx, cy - 58);

      // Gears
      drawGear(cx - 20, cy, 25, 8, angle, isDark ? '#1e3a5f' : '#bfdbfe');
      drawGear(cx + 20, cy, 25, 8, -angle + Math.PI / 8, isDark ? '#1e3a5f' : '#bfdbfe');

      // Flow arrows (inlet)
      ctx.save();
      ctx.globalAlpha = 0.6;
      for (let i = 0; i < 5; i++) {
        const px = 20 + ((Date.now() / (20 / flowScale) + i * 30) % (cx - 90));
        ctx.beginPath();
        ctx.moveTo(px, cy);
        ctx.lineTo(px + 10, cy - 4);
        ctx.lineTo(px + 10, cy + 4);
        ctx.closePath();
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
      }
      // Flow arrows (outlet)
      for (let i = 0; i < 5; i++) {
        const px = cx + 70 + ((Date.now() / (20 / flowScale) + i * 30) % (cx - 70));
        ctx.beginPath();
        ctx.moveTo(px, cy);
        ctx.lineTo(px + 10, cy - 4);
        ctx.lineTo(px + 10, cy + 4);
        ctx.closePath();
        ctx.fillStyle = '#ef4444';
        ctx.fill();
      }
      ctx.restore();

      // Inlet/Outlet labels
      ctx.fillStyle = '#3b82f6';
      ctx.font = '9px Inter';
      ctx.textAlign = 'left';
      ctx.fillText('INLET', 10, cy - 15);
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'right';
      ctx.fillText('OUTLET', w - 10, cy - 15);

      // Pressure gauge
      ctx.fillStyle = isDark ? '#ffffff90' : '#1e293b90';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`${flow.toFixed(1)} L/min`, cx, h - 20);
      ctx.font = '9px Inter';
      ctx.fillText(`@ ${pressure} bar`, cx, h - 8);

      // RPM indicator
      const rpmArc = (rpm / 3000) * Math.PI * 1.5;
      ctx.beginPath();
      ctx.arc(w - 35, 30, 18, -Math.PI * 0.75, -Math.PI * 0.75 + rpmArc);
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.fillStyle = isDark ? '#ffffff80' : '#1e293b80';
      ctx.font = '8px JetBrains Mono';
      ctx.fillText(`${rpm}`, w - 35, 35);
      ctx.font = '7px Inter';
      ctx.fillText('RPM', w - 35, 44);

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [flow, rpm, pressure, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function PumpCalculator() {
  const [displacement, setDisplacement] = useState(11);
  const [rpm, setRpm] = useState(2200);
  const [volEff, setVolEff] = useState(92);
  const [pressure, setPressure] = useState(175);
  const [driveRatio, setDriveRatio] = useState(1);

  const pumpSpeed = rpm * driveRatio;
  const theoFlow = H.pumpFlowTheoretical(displacement, pumpSpeed);
  const actualFlow = H.pumpFlowActual(displacement, pumpSpeed, volEff);
  const relief = H.reliefValveSetting(pressure);
  const power = H.hydraulicPower(actualFlow, pressure);
  const sf = H.pumpSafetyFactor(relief, pressure);
  const sfOk = sf >= 1.1;

  return (
    <CalculatorLayout
      title="Hydraulic Pump Calculator"
      description="Calculate pump flow, pressure, power and safety factor with animated gear pump visualization"
      formula="Q = Displacement(cc/rev) × RPM / 1000 &nbsp;&nbsp;|&nbsp;&nbsp; P_hyd = Q × P / 600"
      inputs={<>
        <CalcSlider label="Displacement" value={displacement} onChange={setDisplacement} min={4} max={50} step={0.5} unit="cc/rev" />
        <CalcSlider label="Engine RPM" value={rpm} onChange={setRpm} min={800} max={3000} step={50} unit="rpm" />
        <CalcSlider label="Vol. Efficiency" value={volEff} onChange={setVolEff} min={70} max={99} step={1} unit="%" />
        <CalcSlider label="System Pressure" value={pressure} onChange={setPressure} min={50} max={350} step={5} unit="bar" />
        <CalcSlider label="Drive Ratio" value={driveRatio} onChange={setDriveRatio} min={0.5} max={2} step={0.1} unit="×" />
      </>}
      results={<>
        <ResultRow label="Pump Speed" value={pumpSpeed} unit="rpm" />
        <ResultRow label="Theoretical Flow" value={theoFlow} unit="L/min" />
        <ResultRow label="Actual Flow" value={actualFlow} unit="L/min" />
        <ResultRow label="Relief Valve" value={relief} unit="bar" />
        <ResultRow label="Hydraulic Power" value={power} unit="kW" />
        <ResultRow label="Safety Factor" value={sf} status={sfOk ? { text: '✅ OK', cls: 'status-ok' } : { text: '❌ Low', cls: 'status-fail' }} />
      </>}
    >
      <GearPumpAnimation flow={actualFlow} rpm={pumpSpeed} pressure={pressure} />
    </CalculatorLayout>
  );
}
