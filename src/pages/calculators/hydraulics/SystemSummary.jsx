import { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CalcSlider from '../../../components/ui/CalcSlider';
import * as H from '../../../utils/formulas/hydraulics';

function StatusBadge({ ok, text }) {
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ok ? 'bg-[#00e676]/10 text-[#00e676]' : 'bg-[#ff1744]/10 text-[#ff1744]'}`}>{text}</span>;
}

export default function SystemSummary() {
  const { isDark } = useTheme();
  const [displacement, setDisplacement] = useState(11);
  const [rpm, setRpm] = useState(2200);
  const [volEff, setVolEff] = useState(92);
  const [pressure, setPressure] = useState(175);
  const [sysEff, setSysEff] = useState(82);
  const [oilIn, setOilIn] = useState(80);
  const [oilOut, setOilOut] = useState(55);
  const [airTemp, setAirTemp] = useState(40);

  const flow = H.pumpFlowActual(displacement, rpm, volEff);
  const relief = H.reliefValveSetting(pressure);
  const power = H.hydraulicPower(flow, pressure);
  const sf = H.pumpSafetyFactor(relief, pressure);
  const heatW = H.heatGenerated(power, sysEff);
  const tankCooling = flow * 5 * 10;
  const dt1 = oilIn - airTemp, dt2 = oilOut - airTemp;
  const lmtdVal = H.lmtd(dt1, dt2);
  const uVal = H.uValueFromType('Air-Oil (Engine Fan)');
  const areaReq = H.coolerArea(heatW, uVal, lmtdVal);
  const pipeID = H.selectStdPipeSize(H.minPipeID(flow, 1.5));
  const returnID = H.selectStdPipeSize(H.minPipeID(flow, 4));
  const thermalOk = (uVal * areaReq * 1.2 * lmtdVal + tankCooling) >= heatW;

  const sections = [
    { title: 'A. PUMP', color: '#00e5ff', items: [
      { label: 'Pump Displacement', value: `${displacement} cc/rev` },
      { label: 'Pump Speed', value: `${rpm} rpm` },
      { label: 'Vol. Efficiency', value: `${volEff}%` },
      { label: 'Actual Flow', value: `${flow.toFixed(1)} L/min` },
      { label: 'Working Pressure', value: `${pressure} bar` },
      { label: 'Relief Setting', value: `${relief.toFixed(1)} bar` },
      { label: 'Hydraulic Power', value: `${power.toFixed(2)} kW` },
      { label: 'Safety Factor', value: `${sf.toFixed(2)}`, status: sf >= 1.1 },
    ]},
    { title: 'B. THERMAL', color: '#ff6d00', items: [
      { label: 'System Efficiency', value: `${sysEff}%` },
      { label: 'Heat Generated', value: `${heatW.toFixed(0)} W` },
      { label: 'Tank Cooling', value: `${tankCooling.toFixed(0)} W` },
      { label: 'LMTD', value: `${lmtdVal.toFixed(1)} °C` },
      { label: 'Cooler Area Req.', value: `${areaReq.toFixed(4)} m²` },
      { label: 'Thermal Balance', value: thermalOk ? '✅ OK' : '❌ Insufficient', status: thermalOk },
    ]},
    { title: 'C. PIPING', color: '#7c4dff', items: [
      { label: 'Pressure Line ID', value: `${returnID} mm` },
      { label: 'Return Line ID', value: `${pipeID} mm` },
      { label: 'Flow Velocity (P)', value: `${H.flowVelocity(flow, returnID).toFixed(2)} m/s` },
      { label: 'Flow Velocity (R)', value: `${H.flowVelocity(flow, pipeID).toFixed(2)} m/s` },
    ]},
  ];

  const allOk = sf >= 1.1 && thermalOk;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className={`inline-flex items-center gap-1.5 text-sm mb-6 ${isDark ? 'text-gray-400 hover:text-[var(--color-primary)]' : 'text-gray-500 hover:text-[var(--color-primary-dark)]'}`}>
          <ArrowLeft size={14} /> Back to Calculators
        </Link>
        <h1 className={`text-2xl md:text-3xl font-bold font-[var(--font-display)] mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Hydraulic System Summary</h1>
        <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Complete system overview — all values from Excel Sheet 6</p>

        {/* System Status Banner */}
        <div className={`glass-card p-4 mb-6 flex items-center justify-between ${allOk ? 'border-[#00e676]/30' : 'border-[#ff1744]/30'}`}>
          <span className={`text-lg font-bold ${allOk ? 'text-[#00e676]' : 'text-[#ff1744]'}`}>
            {allOk ? '✅ SYSTEM READY TO BUILD' : '⚠️ REVIEW WARNINGS'}
          </span>
          <StatusBadge ok={allOk} text={allOk ? 'All Checks Passed' : 'Issues Found'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Inputs */}
          <div className="glass-card p-5 space-y-4">
            <h2 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>System Inputs</h2>
            <CalcSlider label="Displacement" value={displacement} onChange={setDisplacement} min={4} max={50} step={0.5} unit="cc/rev" />
            <CalcSlider label="Engine RPM" value={rpm} onChange={setRpm} min={800} max={3000} step={50} unit="rpm" />
            <CalcSlider label="Vol. Efficiency" value={volEff} onChange={setVolEff} min={70} max={99} step={1} unit="%" />
            <CalcSlider label="System Pressure" value={pressure} onChange={setPressure} min={50} max={350} step={5} unit="bar" />
            <CalcSlider label="System Efficiency" value={sysEff} onChange={setSysEff} min={60} max={95} step={1} unit="%" />
            <CalcSlider label="Oil Inlet Temp" value={oilIn} onChange={setOilIn} min={40} max={120} step={1} unit="°C" />
            <CalcSlider label="Oil Outlet" value={oilOut} onChange={setOilOut} min={30} max={100} step={1} unit="°C" />
            <CalcSlider label="Ambient Temp" value={airTemp} onChange={setAirTemp} min={10} max={50} step={1} unit="°C" />
          </div>

          {/* Summary sections */}
          <div className="lg:col-span-3 space-y-4">
            {sections.map(sec => (
              <div key={sec.title} className="glass-card p-5">
                <h3 className="text-sm font-bold mb-3" style={{ color: sec.color }}>{sec.title}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {sec.items.map(item => (
                    <div key={item.label} className={`p-3 rounded-xl ${isDark ? 'bg-white/3' : 'bg-gray-50'}`}>
                      <div className={`text-[10px] uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.label}</div>
                      <div className={`text-sm font-mono font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.value}
                        {item.status !== undefined && <StatusBadge ok={item.status} text={item.status ? '✅' : '❌'} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
