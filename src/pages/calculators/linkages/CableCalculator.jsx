import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CalculatorLayout, { ResultRow } from '../../../components/calculators/CalculatorLayout';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as L from '../../../utils/formulas/linkages';

function CableAnimation({ force, sf, cables }) {
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
    const required = force * sf;

    // Draw cables as vertical bars
    const barW = 25, gap = 15;
    const totalW = cables.length * barW + (cables.length - 1) * gap;
    const startX = (w - totalW) / 2;

    cables.forEach((c, i) => {
      const x = startX + i * (barW + gap);
      const maxStr = Math.max(...cables.map(cc => cc.breaking), required);
      const barH = (c.breaking / maxStr) * (h - 100);
      const reqH = (required / maxStr) * (h - 100);
      const ok = c.breaking >= required;

      // Bar background
      ctx.fillStyle = isDark ? '#1e293b' : '#e2e8f0';
      ctx.fillRect(x, h - 40 - (h - 100), barW, h - 100);

      // Strength bar
      ctx.fillStyle = ok ? '#00e67640' : '#ff174440';
      ctx.fillRect(x, h - 40 - barH, barW, barH);
      ctx.strokeStyle = ok ? '#00e676' : '#ff1744';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, h - 40 - barH, barW, barH);

      // Required line
      ctx.beginPath();
      ctx.moveTo(x - 3, h - 40 - reqH);
      ctx.lineTo(x + barW + 3, h - 40 - reqH);
      ctx.strokeStyle = '#ffab00';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Status icon
      ctx.fillStyle = ok ? '#00e676' : '#ff1744';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(ok ? '✓' : '✗', x + barW / 2, h - 40 - barH - 8);

      // Label
      ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
      ctx.font = '7px Inter';
      ctx.fillText(c.name.split(' ')[0], x + barW / 2, h - 25);
      ctx.fillText(c.name.split(' ').slice(1).join(' '), x + barW / 2, h - 15);

      // Value
      ctx.font = '7px JetBrains Mono';
      ctx.fillText(`${c.breaking}N`, x + barW / 2, h - 40 - barH - 20);
    });

    // Required strength label
    ctx.fillStyle = '#ffab00';
    ctx.font = 'bold 9px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText(`Required: ${required}N`, 10, 20);

    ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
    ctx.font = '8px Inter';
    ctx.fillText(`Force: ${force}N × SF: ${sf} = ${required}N`, 10, 35);
  }, [force, sf, cables, isDark]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: 350 }} />;
}

export default function CableCalculator() {
  const [force, setForce] = useState(500);
  const [sf, setSf] = useState(3);

  const required = L.cableRequiredStrength(force, sf);
  const results = L.cableTypes.map(c => ({
    ...c,
    status: L.cableStatus(c.breaking, required),
  }));

  return (
    <CalculatorLayout
      title="Cable Strength Calculator"
      description="Cable selection with strength comparison — verified against FNR Excel"
      formula="Required Strength = Force × Safety Factor"
      inputs={<>
        <CalcSlider label="Operating Force" value={force} onChange={setForce} min={50} max={5000} step={50} unit="N" />
        <CalcSlider label="Safety Factor" value={sf} onChange={setSf} min={1} max={5} step={0.5} unit="×" />
      </>}
      results={<>
        <ResultRow label="Required Strength" value={required} unit="N" />
        {results.map(c => (
          <ResultRow key={c.name} label={c.name} value={c.breaking} unit="N" status={c.status} />
        ))}
      </>}
    >
      <CableAnimation force={force} sf={sf} cables={L.cableTypes} />
    </CalculatorLayout>
  );
}
