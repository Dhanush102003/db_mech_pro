import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as H from '../../../utils/formulas/hydraulics';

function FilterAnimation({ micron, dpRatio, flowRate }) {
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

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * w * 0.35 + 10,
      y: 60 + Math.random() * (h - 120),
      size: 1 + Math.random() * 5,
      speed: 0.5 + Math.random() * 2,
      color: Math.random() > 0.5 ? '#ef4444' : '#f59e0b',
    }));

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      // Filter housing
      const fx = w * 0.45, fy = 40, fw = 30, fh = h - 80;
      ctx.fillStyle = isDark ? '#1e293b' : '#e2e8f0';
      ctx.fillRect(fx - 5, fy, fw + 10, fh);
      ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(fx - 5, fy, fw + 10, fh);

      // Filter media (vertical lines)
      const mediaLines = Math.max(3, Math.min(20, Math.round(micron / 5)));
      for (let i = 0; i < mediaLines; i++) {
        const lx = fx + (i / mediaLines) * fw;
        ctx.beginPath();
        ctx.moveTo(lx, fy + 5);
        ctx.lineTo(lx, fy + fh - 5);
        ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Filter label
      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.font = '9px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`${micron}µm`, fx + fw / 2, fy - 8);
      ctx.fillText('FILTER', fx + fw / 2, fy + fh + 15);

      // Particles
      const passThreshold = micron / 100;
      particles.forEach(p => {
        p.x += p.speed * (flowRate / 25);
        // Hit filter
        if (p.x >= fx && p.x <= fx + fw) {
          if (p.size > passThreshold * 8) {
            // Blocked - bounce back
            p.x = fx - 5;
            p.speed = 0.3 + Math.random();
          }
        }
        // Reset
        if (p.x > w + 10) {
          p.x = -10;
          p.y = 60 + Math.random() * (h - 120);
          p.size = 1 + Math.random() * 5;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.x > fx + fw ? '#00e67680' : p.color + '80';
        ctx.fill();
      });

      // Dirty side label
      ctx.fillStyle = '#ef4444';
      ctx.font = '9px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('DIRTY', w * 0.2, 30);

      // Clean side label
      ctx.fillStyle = '#00e676';
      ctx.fillText('CLEAN', w * 0.78, 30);

      // Flow arrows
      for (let i = 0; i < 3; i++) {
        const ax = ((frame * 1.5 + i * 60) % (fx - 30));
        ctx.beginPath();
        ctx.moveTo(ax + 10, h / 2);
        ctx.lineTo(ax, h / 2 - 4);
        ctx.lineTo(ax, h / 2 + 4);
        ctx.closePath();
        ctx.fillStyle = '#3b82f680';
        ctx.fill();
      }
      for (let i = 0; i < 3; i++) {
        const ax = fx + fw + 15 + ((frame * 1.5 + i * 60) % (w - fx - fw - 30));
        ctx.beginPath();
        ctx.moveTo(ax + 10, h / 2);
        ctx.lineTo(ax, h / 2 - 4);
        ctx.lineTo(ax, h / 2 + 4);
        ctx.closePath();
        ctx.fillStyle = '#00e67660';
        ctx.fill();
      }

      // ΔP gauge
      const gaugeX = w / 2, gaugeY = h - 20;
      const dpPct = Math.min(dpRatio, 1);
      ctx.fillStyle = isDark ? '#ffffff90' : '#1e293b90';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`ΔP: ${(dpRatio * 100).toFixed(0)}%`, gaugeX, gaugeY);
      // Bar
      ctx.fillStyle = isDark ? '#1e293b' : '#e2e8f0';
      ctx.fillRect(gaugeX - 60, gaugeY + 5, 120, 6);
      ctx.fillStyle = dpPct > 0.7 ? '#ff1744' : dpPct > 0.4 ? '#ffab00' : '#00e676';
      ctx.fillRect(gaugeX - 60, gaugeY + 5, 120 * dpPct, 6);

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [micron, dpRatio, flowRate, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function FilterSelection() {
  const [systemFlow, setSystemFlow] = useState(22.3);
  const [micronSuction, setMicronSuction] = useState(125);
  const [micronPressure, setMicronPressure] = useState(25);
  const [micronReturn, setMicronReturn] = useState(25);
  const [cleanDP, setCleanDP] = useState(0.5);
  const [bypassSetting, setBypassSetting] = useState(3.5);

  const filterFlow = systemFlow * 1.5;
  const currentDP = H.filterPressureDrop(cleanDP, systemFlow, filterFlow);
  const lifePercent = H.filterLifeFactor(currentDP, bypassSetting);
  const status = H.filterStatus(currentDP, bypassSetting);
  const dpRatio = bypassSetting > 0 ? currentDP / bypassSetting : 0;
  const serviceHrs = Math.max(0, Math.round(500 * (1 - dpRatio)));
  const serviceDays = Math.round(serviceHrs / 8);

  return (
    <CalculatorLayout
      title="Hydraulic Filter Selection"
      description="Filter sizing, pressure drop monitoring and service life prediction — verified against Excel"
      formula="Filter Flow = 1.5× System Flow | ΔP_status = ΔP / Bypass Setting"
      inputs={<>
        <CalcSlider label="System Flow" value={systemFlow} onChange={setSystemFlow} min={5} max={80} step={0.5} unit="L/min" />
        <CalcSlider label="Suction Micron" value={micronSuction} onChange={setMicronSuction} min={50} max={200} step={5} unit="µm" />
        <CalcSlider label="Pressure Micron" value={micronPressure} onChange={setMicronPressure} min={5} max={50} step={1} unit="µm" />
        <CalcSlider label="Return Micron" value={micronReturn} onChange={setMicronReturn} min={10} max={50} step={1} unit="µm" />
        <CalcSlider label="Clean ΔP" value={cleanDP} onChange={setCleanDP} min={0.1} max={2} step={0.1} unit="bar" />
        <CalcSlider label="Bypass Setting" value={bypassSetting} onChange={setBypassSetting} min={1} max={10} step={0.5} unit="bar" />
      </>}
      results={<>
        <ResultRow label="Filter Flow Capacity" value={filterFlow} unit="L/min" />
        <ResultRow label="Current ΔP" value={currentDP} unit="bar" />
        <ResultRow label="Filter Status" value={status.text} status={status} />
        <ResultRow label="Remaining Life" value={lifePercent} unit="%" />
        <ResultRow label="Service Interval" value={serviceHrs} unit="hrs" />
        <ResultRow label="Days to Service" value={serviceDays} unit="days" />
        <ResultRow label="Suction Strainer" value={`${micronSuction}µm wire mesh`} />
        <ResultRow label="Pressure Filter" value={`${micronPressure}µm β≥200`} />
        <ResultRow label="Return Filter" value={`${micronReturn}µm β≥200`} />
      </>}
    >
      <FilterAnimation micron={micronPressure} dpRatio={dpRatio} flowRate={systemFlow} />
    </CalculatorLayout>
  );
}
