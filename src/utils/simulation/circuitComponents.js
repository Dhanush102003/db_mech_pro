// ============================================
// HYDRAULIC CIRCUIT COMPONENTS — ISO 1219 Symbols
// Rendering functions & port definitions
// ============================================

// Component types with default params and port definitions
export const COMPONENT_TYPES = {
  PUMP: {
    type: 'PUMP',
    label: 'Power Unit',
    category: 'Power Source',
    description: 'Fixed displacement hydraulic pump',
    icon: 'M15,30 A15,15 0 1,1 15.01,30 M10,35 L15,20 L20,35 Z',
    width: 80,
    height: 80,
    defaultParams: { pressure: 200, flowRate: 40 },
    ports: [
      { id: 'P', x: 40, y: 0, dir: 'up', label: 'P' },
      { id: 'T', x: 40, y: 80, dir: 'down', label: 'T' },
    ],
  },
  DCV43: {
    type: 'DCV43',
    label: 'DCV 4/3',
    category: 'Directional Valves',
    description: '4-port 3-position directional control valve',
    icon: 'M0,0 H30 V25 H0 Z M30,0 H60 V25 H30 Z M60,0 H90 V25 H60 Z',
    width: 120,
    height: 65,
    defaultParams: { position: 'center' },
    ports: [
      { id: 'P', x: 40, y: 65, dir: 'down', label: 'P' },
      { id: 'T', x: 80, y: 65, dir: 'down', label: 'T' },
      { id: 'A', x: 40, y: 0, dir: 'up', label: 'A' },
      { id: 'B', x: 80, y: 0, dir: 'up', label: 'B' },
    ],
  },
  DCV32: {
    type: 'DCV32',
    label: 'DCV 3/2',
    category: 'Directional Valves',
    description: '3-port 2-position directional valve',
    icon: 'M0,0 H30 V25 H0 Z M30,0 H60 V25 H30 Z',
    width: 80,
    height: 65,
    defaultParams: { position: 'off' },
    ports: [
      { id: 'P', x: 20, y: 65, dir: 'down', label: 'P' },
      { id: 'T', x: 60, y: 65, dir: 'down', label: 'T' },
      { id: 'A', x: 40, y: 0, dir: 'up', label: 'A' },
    ],
  },
  FLOW_CONTROL: {
    type: 'FLOW_CONTROL',
    label: 'Flow Control',
    category: 'Flow Control',
    description: 'Adjustable flow control valve',
    icon: 'M5,5 H40 V30 H5 Z M20,10 L25,20 L20,30',
    width: 65,
    height: 55,
    defaultParams: { maxFlow: 30 },
    ports: [
      { id: 'IN', x: 0, y: 28, dir: 'left', label: 'IN' },
      { id: 'OUT', x: 65, y: 28, dir: 'right', label: 'OUT' },
    ],
  },
  CHECK_VALVE: {
    type: 'CHECK_VALVE',
    label: 'Check Valve',
    category: 'Flow Control',
    description: 'Allows flow in one direction only',
    icon: 'M10,5 L10,25 M10,15 L30,5 L30,25 Z',
    width: 55,
    height: 40,
    defaultParams: {},
    ports: [
      { id: 'IN', x: 0, y: 20, dir: 'left', label: 'IN' },
      { id: 'OUT', x: 55, y: 20, dir: 'right', label: 'OUT' },
    ],
  },
  RELIEF_VALVE: {
    type: 'RELIEF_VALVE',
    label: 'Relief Valve',
    category: 'Pressure Control',
    description: 'Limits maximum system pressure',
    icon: 'M5,10 H35 V40 H5 Z M12,35 L20,15 L28,35',
    width: 55,
    height: 65,
    defaultParams: { setting: 250 },
    ports: [
      { id: 'IN', x: 28, y: 0, dir: 'up', label: 'IN' },
      { id: 'OUT', x: 28, y: 65, dir: 'down', label: 'T' },
    ],
  },
  PRESSURE_REDUCING: {
    type: 'PRESSURE_REDUCING',
    label: 'Pressure Reducer',
    category: 'Pressure Control',
    description: 'Reduces downstream pressure',
    icon: 'M5,5 H35 V45 H5 Z M12,35 L20,10 L28,35',
    width: 55,
    height: 65,
    defaultParams: { setting: 100 },
    ports: [
      { id: 'IN', x: 0, y: 33, dir: 'left', label: 'IN' },
      { id: 'OUT', x: 55, y: 33, dir: 'right', label: 'OUT' },
    ],
  },
  CYLINDER_DA: {
    type: 'CYLINDER_DA',
    label: 'Double-Acting Cyl',
    category: 'Actuators',
    description: 'Double-acting hydraulic cylinder',
    icon: 'M0,10 H80 V40 H0 Z M30,8 V42 M30,22 H100 V32 H30',
    width: 160,
    height: 55,
    defaultParams: { bore: 63, rod: 36, stroke: 200 },
    ports: [
      { id: 'A', x: 15, y: 0, dir: 'up', label: 'A' },
      { id: 'B', x: 145, y: 0, dir: 'up', label: 'B' },
    ],
  },
  CYLINDER_SA: {
    type: 'CYLINDER_SA',
    label: 'Single-Acting Cyl',
    category: 'Actuators',
    description: 'Single-acting hydraulic cylinder',
    icon: 'M0,10 H70 V40 H0 Z M25,8 V42 M25,22 H90 V32 H25',
    width: 160,
    height: 55,
    defaultParams: { bore: 50, stroke: 150 },
    ports: [
      { id: 'A', x: 15, y: 0, dir: 'up', label: 'A' },
    ],
  },
  MOTOR: {
    type: 'MOTOR',
    label: 'Hydraulic Motor',
    category: 'Actuators',
    description: 'Converts hydraulic power to rotary motion',
    icon: 'M15,30 A15,15 0 1,1 15.01,30',
    width: 70,
    height: 70,
    defaultParams: { displacement: 25 },
    ports: [
      { id: 'IN', x: 0, y: 35, dir: 'left', label: 'IN' },
      { id: 'OUT', x: 70, y: 35, dir: 'right', label: 'OUT' },
    ],
  },
  T_CONNECTOR: {
    type: 'T_CONNECTOR',
    label: 'T-Connector',
    category: 'Utility',
    description: 'Splits or merges flow paths',
    icon: 'M0,15 H40 M20,15 V40',
    width: 40,
    height: 40,
    defaultParams: {},
    ports: [
      { id: 'A', x: 0, y: 20, dir: 'left', label: 'A' },
      { id: 'B', x: 40, y: 20, dir: 'right', label: 'B' },
      { id: 'C', x: 20, y: 40, dir: 'down', label: 'C' },
    ],
  },
  PRESSURE_GAUGE: {
    type: 'PRESSURE_GAUGE',
    label: 'Pressure Gauge',
    category: 'Utility',
    description: 'Measures line pressure (bar)',
    icon: 'M18,18 A14,14 0 1,1 18.01,18',
    width: 48,
    height: 48,
    defaultParams: {},
    ports: [
      { id: 'IN', x: 24, y: 48, dir: 'down', label: 'IN' },
    ],
  },
  FLOW_METER: {
    type: 'FLOW_METER',
    label: 'Flow Meter',
    category: 'Utility',
    description: 'Measures volumetric flow rate (L/min)',
    icon: 'M5,2 H35 V28 H5 Z',
    width: 55,
    height: 40,
    defaultParams: {},
    ports: [
      { id: 'IN', x: 0, y: 20, dir: 'left', label: 'IN' },
      { id: 'OUT', x: 55, y: 20, dir: 'right', label: 'OUT' },
    ],
  },
  FILTER: {
    type: 'FILTER',
    label: 'Filter',
    category: 'Utility',
    description: 'Removes contaminants from fluid',
    icon: 'M5,0 H25 V40 H5 Z M5,10 L25,30 M5,20 L25,40',
    width: 40,
    height: 55,
    defaultParams: { micron: 10 },
    ports: [
      { id: 'IN', x: 20, y: 0, dir: 'up', label: 'IN' },
      { id: 'OUT', x: 20, y: 55, dir: 'down', label: 'OUT' },
    ],
  },
  TANK: {
    type: 'TANK',
    label: 'Reservoir',
    category: 'Power Source',
    description: 'Hydraulic fluid reservoir / return',
    icon: 'M5,10 H45 M10,10 V35 H40 V10',
    width: 65,
    height: 40,
    defaultParams: {},
    ports: [
      { id: 'IN', x: 33, y: 0, dir: 'up', label: 'IN' },
    ],
  },
  OIL_COOLER: {
    type: 'OIL_COOLER',
    label: 'Oil Cooler',
    category: 'Utility',
    description: 'Heat exchanger for thermal management',
    icon: 'M5,5 H45 V35 H5 Z M10,15 Q20,5 30,15 Q40,25 45,15',
    width: 65,
    height: 55,
    defaultParams: { capacity: 1.5, bypassPressure: 2 },
    ports: [
      { id: 'IN', x: 0, y: 28, dir: 'left', label: 'IN' },
      { id: 'OUT', x: 65, y: 28, dir: 'right', label: 'OUT' },
    ],
  },
  SUCTION_STRAINER: {
    type: 'SUCTION_STRAINER',
    label: 'Suction Strainer',
    category: 'Utility',
    description: 'Coarse filtration at tank suction',
    icon: 'M5,8 H35 V32 H5 Z M10,14 H30 M10,20 H30 M10,26 H30',
    width: 55,
    height: 55,
    defaultParams: { micron: 100 },
    ports: [
      { id: 'IN', x: 28, y: 55, dir: 'down', label: 'IN' },
      { id: 'OUT', x: 28, y: 0, dir: 'up', label: 'OUT' },
    ],
  },
  STEERING_UNIT: {
    type: 'STEERING_UNIT',
    label: 'Steering Unit',
    category: 'Actuators',
    description: 'Orbitrol steering unit (12cc)',
    icon: 'M20,40 A20,20 0 1,1 20.01,40',
    width: 80,
    height: 80,
    defaultParams: { displacement: 12, rpm: 2000 },
    ports: [
      { id: 'IN', x: 0, y: 40, dir: 'left', label: 'IN' },
      { id: 'OUT', x: 80, y: 40, dir: 'right', label: 'OUT' },
    ],
  },
  CLUTCH_PACK: {
    type: 'CLUTCH_PACK',
    label: 'Clutch Pack',
    category: 'Actuators',
    description: 'Multi-plate wet clutch assembly',
    icon: 'M0,5 H80 V45 H0 Z M12,10 V40 M24,10 V40 M36,10 V40 M48,10 V40 M60,10 V40',
    width: 110,
    height: 65,
    defaultParams: { plateArea: 70, numPlates: 5, clutchTorque: 550 },
    ports: [
      { id: 'IN', x: 0, y: 33, dir: 'left', label: 'IN' },
      { id: 'OUT', x: 110, y: 33, dir: 'right', label: 'OUT' },
    ],
  },
  TEMP_SWITCH: {
    type: 'TEMP_SWITCH',
    label: 'Temp Switch',
    category: 'Utility',
    description: 'Temperature sensor / warning switch',
    icon: 'M18,18 A14,14 0 1,1 18.01,18',
    width: 48,
    height: 48,
    defaultParams: { threshold: 90 },
    ports: [
      { id: 'IN', x: 24, y: 48, dir: 'down', label: 'IN' },
    ],
  },
};

export const CATEGORIES = ['Power Source', 'Directional Valves', 'Flow Control', 'Pressure Control', 'Actuators', 'Utility'];

export function getComponentsByCategory() {
  const map = {};
  for (const cat of CATEGORIES) {
    map[cat] = Object.values(COMPONENT_TYPES).filter(c => c.category === cat);
  }
  return map;
}

// ============================================
// ISO 1219 Symbol Rendering Functions
// ============================================

export function drawComponent(ctx, comp, isDark, isSelected = false) {
  const { type, x, y, params, rotation = 0 } = comp;
  const def = COMPONENT_TYPES[type];
  if (!def) return;

  ctx.save();
  ctx.translate(x + def.width / 2, y + def.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-def.width / 2, -def.height / 2);

  const fg = isDark ? '#e2e8f0' : '#0f172a';
  const bg = isDark ? '#1a3a5c' : '#dbeafe';
  const accent = '#00e5ff';
  const red = '#ff6b6b';
  const blue = '#60a5fa';
  const green = '#4ade80';

  // Component background glow — stronger for visibility
  if (isDark) {
    ctx.shadowColor = 'rgba(0, 229, 255, 0.35)';
    ctx.shadowBlur = 18;
  }

  // Selection highlight
  if (isSelected) {
    ctx.strokeStyle = '#00ffea';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(-8, -8, def.width + 16, def.height + 16);
    ctx.setLineDash([]);
    if (isDark) {
      ctx.shadowColor = 'rgba(0, 229, 255, 0.6)';
      ctx.shadowBlur = 28;
    }
  }

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = fg;
  ctx.fillStyle = bg;
  ctx.font = '9px Inter';
  ctx.textAlign = 'center';

  switch (type) {
    case 'PUMP': {
      ctx.beginPath();
      ctx.arc(40, 40, 34, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(30, 52); ctx.lineTo(50, 52); ctx.lineTo(40, 28);
      ctx.closePath(); ctx.fillStyle = accent; ctx.fill();
      ctx.beginPath();
      ctx.moveTo(40, 6); ctx.lineTo(40, 0);
      ctx.moveTo(40, 74); ctx.lineTo(40, 80);
      ctx.strokeStyle = fg; ctx.stroke();
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.fillText(`${params?.pressure || 200} bar`, 40, -6);
      break;
    }
    case 'DCV43': {
      const pos = params?.position || 'center';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.rect(i * 40, 0, 40, 65);
        ctx.fillStyle = i === 0 && pos === 'extend' ? 'rgba(34,197,94,0.35)' :
                        i === 2 && pos === 'retract' ? 'rgba(239,68,68,0.35)' :
                        i === 1 && pos === 'center' ? 'rgba(0,229,255,0.2)' : bg;
        ctx.fill(); ctx.strokeStyle = fg; ctx.stroke();
      }
      const labels = ['E', 'C', 'R'];
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = 'bold 10px Inter';
      for (let i = 0; i < 3; i++) ctx.fillText(labels[i], i * 40 + 20, -6);
      ctx.font = '9px Inter';
      ctx.fillStyle = red; ctx.fillText('P', 40, 78);
      ctx.fillStyle = blue; ctx.fillText('T', 80, 78);
      ctx.fillStyle = green;
      ctx.fillText('A', 40, -16); ctx.fillText('B', 80, -16);
      break;
    }
    case 'CYLINDER_DA': {
      const extension = params?.extension || 0;
      const rodLen = 55 + extension * 0.5;
      ctx.beginPath();
      ctx.roundRect(0, 8, 108, 40, 3);
      ctx.fill(); ctx.stroke();
      const pistonX = 15 + extension * 0.8;
      ctx.beginPath();
      ctx.rect(pistonX, 5, 5, 46);
      ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.rect(pistonX + 5, 20, rodLen, 12);
      ctx.fillStyle = isDark ? '#64748b' : '#cbd5e1';
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.rect(108, 12, 5, 32);
      ctx.fillStyle = bg; ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(15, 8); ctx.lineTo(15, 0);
      ctx.moveTo(145, 8); ctx.lineTo(145, 0);
      ctx.strokeStyle = fg; ctx.stroke();
      break;
    }
    case 'RELIEF_VALVE': {
      ctx.beginPath();
      ctx.rect(7, 12, 42, 40);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(16, 46); ctx.lineTo(28, 18); ctx.lineTo(40, 46);
      ctx.strokeStyle = red; ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        ctx.moveTo(16 + i * 8, 50); ctx.lineTo(20 + i * 8, 58); ctx.lineTo(24 + i * 8, 50);
      }
      ctx.strokeStyle = fg; ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(28, 0); ctx.lineTo(28, 12);
      ctx.moveTo(28, 52); ctx.lineTo(28, 65);
      ctx.stroke();
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.fillText(`${params?.setting || 250}`, 28, -4);
      break;
    }
    case 'MOTOR': {
      ctx.beginPath();
      ctx.arc(35, 35, 30, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = fg;
      ctx.font = 'bold 16px Inter';
      ctx.fillText('M', 35, 40);
      ctx.beginPath();
      ctx.arc(35, 35, 22, -0.5, 1.5);
      ctx.strokeStyle = accent; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 35); ctx.lineTo(5, 35);
      ctx.moveTo(65, 35); ctx.lineTo(70, 35);
      ctx.strokeStyle = fg; ctx.lineWidth = 2; ctx.stroke();
      break;
    }
    case 'TANK': {
      ctx.beginPath();
      ctx.moveTo(5, 12); ctx.lineTo(60, 12);
      ctx.moveTo(12, 12); ctx.lineTo(12, 38);
      ctx.lineTo(53, 38); ctx.lineTo(53, 12);
      ctx.strokeStyle = fg; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath();
      ctx.rect(12, 24, 41, 14);
      ctx.fillStyle = isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(33, 0); ctx.lineTo(33, 12);
      ctx.strokeStyle = fg; ctx.stroke();
      break;
    }
    case 'FLOW_CONTROL': {
      ctx.beginPath();
      ctx.rect(5, 5, 40, 30);
      ctx.fill();
      ctx.stroke();
      // Arrow with restriction
      ctx.beginPath();
      ctx.moveTo(10, 20);
      ctx.lineTo(40, 20);
      ctx.strokeStyle = accent;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(22, 10);
      ctx.lineTo(28, 20);
      ctx.lineTo(22, 30);
      ctx.strokeStyle = fg;
      ctx.stroke();
      // Port lines
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.lineTo(5, 20);
      ctx.moveTo(45, 20);
      ctx.lineTo(50, 20);
      ctx.stroke();
      break;
    }
    case 'CHECK_VALVE': {
      ctx.beginPath();
      ctx.moveTo(10, 5);
      ctx.lineTo(10, 25);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(10, 15);
      ctx.lineTo(30, 5);
      ctx.lineTo(30, 25);
      ctx.closePath();
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.stroke();
      // Port lines
      ctx.beginPath();
      ctx.moveTo(0, 20); ctx.lineTo(14, 20);
      ctx.moveTo(40, 20); ctx.lineTo(55, 20);
      ctx.stroke();
      break;
    }
    case 'PRESSURE_GAUGE': {
      ctx.beginPath();
      ctx.arc(24, 22, 20, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = fg;
      ctx.font = 'bold 10px Inter';
      ctx.fillText('bar', 24, 26);
      ctx.beginPath();
      ctx.moveTo(24, 42); ctx.lineTo(24, 48);
      ctx.stroke();
      break;
    }
    case 'OIL_COOLER': {
      ctx.beginPath();
      ctx.rect(6, 8, 53, 40);
      ctx.fill(); ctx.stroke();
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(12 + i * 10, 8); ctx.lineTo(12 + i * 10, 2);
        ctx.strokeStyle = isDark ? '#60a5fa' : '#3b82f6';
        ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(14, 26);
      for (let i = 0; i < 4; i++) {
        ctx.quadraticCurveTo(18 + i * 10, 18, 22 + i * 10, 26);
        ctx.quadraticCurveTo(26 + i * 10, 34, 30 + i * 10, 26);
      }
      ctx.strokeStyle = red; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 28); ctx.lineTo(6, 28);
      ctx.moveTo(59, 28); ctx.lineTo(65, 28);
      ctx.strokeStyle = fg; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = '9px Inter';
      ctx.fillText('Cooler', 33, 56);
      break;
    }
    case 'SUCTION_STRAINER': {
      ctx.beginPath();
      ctx.rect(8, 10, 40, 34);
      ctx.fill(); ctx.stroke();
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(14, 16 + i * 8); ctx.lineTo(42, 16 + i * 8);
        ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
        ctx.lineWidth = 0.8; ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(28, 0); ctx.lineTo(28, 10);
      ctx.moveTo(28, 44); ctx.lineTo(28, 55);
      ctx.strokeStyle = fg; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = '8px Inter';
      ctx.fillText('Strainer', 28, -4);
      break;
    }
    case 'STEERING_UNIT': {
      ctx.beginPath();
      ctx.arc(40, 40, 34, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = fg;
      ctx.font = 'bold 13px Inter';
      ctx.fillText('STG', 40, 38);
      ctx.font = '9px Inter';
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.fillText(`${params?.displacement || 12}cc`, 40, 52);
      ctx.beginPath();
      ctx.arc(40, 40, 24, -0.5, 1.2);
      ctx.strokeStyle = accent; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 40); ctx.lineTo(6, 40);
      ctx.moveTo(74, 40); ctx.lineTo(80, 40);
      ctx.strokeStyle = fg; ctx.lineWidth = 2; ctx.stroke();
      break;
    }
    case 'CLUTCH_PACK': {
      ctx.beginPath();
      ctx.roundRect(0, 6, 110, 53, 4);
      ctx.fill(); ctx.stroke();
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.rect(14 + i * 15, 12, 4, 42);
        ctx.fillStyle = i % 2 === 0 ? (isDark ? '#475569' : '#94a3b8') : (isDark ? '#334155' : '#cbd5e1');
        ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = fg;
      ctx.font = 'bold 10px Inter';
      ctx.fillText('CLUTCH', 55, -2);
      break;
    }
    case 'TEMP_SWITCH': {
      ctx.beginPath();
      ctx.arc(24, 22, 20, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = red;
      ctx.font = 'bold 10px Inter';
      ctx.fillText('T°', 24, 20);
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = '8px Inter';
      ctx.fillText(`${params?.threshold || 90}°C`, 24, 32);
      ctx.beginPath();
      ctx.moveTo(24, 42); ctx.lineTo(24, 48);
      ctx.strokeStyle = fg; ctx.stroke();
      break;
    }
    case 'DCV32': {
      const pos32 = params?.position || 'off';
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.rect(i * 40, 0, 40, 65);
        ctx.fillStyle = i === 0 && pos32 === 'on' ? 'rgba(34,197,94,0.35)' : bg;
        ctx.fill(); ctx.strokeStyle = fg; ctx.stroke();
      }
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = 'bold 10px Inter';
      ctx.fillText(pos32 === 'on' ? 'ON' : 'OFF', 40, -6);
      ctx.font = '9px Inter';
      ctx.fillStyle = red; ctx.fillText('P', 20, 78);
      ctx.fillStyle = blue; ctx.fillText('T', 60, 78);
      ctx.fillStyle = green; ctx.fillText('A', 40, -16);
      break;
    }
    case 'PRESSURE_REDUCING': {
      ctx.beginPath();
      ctx.rect(7, 7, 42, 52);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(16, 48); ctx.lineTo(28, 14); ctx.lineTo(40, 48);
      ctx.strokeStyle = blue; ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 33); ctx.lineTo(7, 33);
      ctx.moveTo(49, 33); ctx.lineTo(55, 33);
      ctx.strokeStyle = fg; ctx.stroke();
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = '9px Inter';
      ctx.fillText(`${params?.setting || 100}`, 28, -4);
      break;
    }
    case 'FLOW_METER': {
      ctx.beginPath();
      ctx.rect(7, 4, 42, 32);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = fg;
      ctx.font = 'bold 10px Inter';
      ctx.fillText('Q', 28, 24);
      ctx.beginPath();
      ctx.moveTo(0, 20); ctx.lineTo(7, 20);
      ctx.moveTo(49, 20); ctx.lineTo(55, 20);
      ctx.strokeStyle = fg; ctx.stroke();
      break;
    }
    default: {
      // Generic box
      ctx.beginPath();
      ctx.rect(0, 0, def.width, def.height);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = fg;
      ctx.font = '8px Inter';
      ctx.fillText(def.label, def.width / 2, def.height / 2 + 3);
    }
  }

  // Reset shadow before ports
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Draw port circles — larger and brighter for visibility
  for (const port of def.ports) {
    // Glow ring
    ctx.beginPath();
    ctx.arc(port.x, port.y, 9, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? 'rgba(0, 229, 255, 0.12)' : 'rgba(0, 184, 212, 0.08)';
    ctx.fill();
    // Port circle
    ctx.beginPath();
    ctx.arc(port.x, port.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#0f1729' : '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Port label
    ctx.fillStyle = isDark ? '#cbd5e1' : '#475569';
    ctx.font = 'bold 9px Inter';
    const labelOffset = port.dir === 'up' ? -13 : port.dir === 'down' ? 16 : 0;
    const labelX = port.dir === 'left' ? port.x - 14 : port.dir === 'right' ? port.x + 14 : port.x;
    ctx.fillText(port.label, labelX, port.y + labelOffset);
  }

  ctx.restore();
}

// Get absolute port position for a placed component
export function getPortPosition(comp, portId) {
  const def = COMPONENT_TYPES[comp.type];
  if (!def) return null;
  const port = def.ports.find(p => p.id === portId);
  if (!port) return null;

  const cx = def.width / 2;
  const cy = def.height / 2;
  const rot = ((comp.rotation || 0) * Math.PI) / 180;
  const dx = port.x - cx;
  const dy = port.y - cy;
  const rx = dx * Math.cos(rot) - dy * Math.sin(rot);
  const ry = dx * Math.sin(rot) + dy * Math.cos(rot);

  return {
    x: comp.x + cx + rx,
    y: comp.y + cy + ry,
  };
}

// Hit test: check if point is inside component bounding box
export function hitTestComponent(comp, px, py) {
  const def = COMPONENT_TYPES[comp.type];
  if (!def) return false;
  return px >= comp.x && px <= comp.x + def.width &&
         py >= comp.y && py <= comp.y + def.height;
}

// Hit test: check if point is on a port
export function hitTestPort(comp, px, py, radius = 12) {
  const def = COMPONENT_TYPES[comp.type];
  if (!def) return null;
  for (const port of def.ports) {
    const pos = getPortPosition(comp, port.id);
    const dx = px - pos.x;
    const dy = py - pos.y;
    if (dx * dx + dy * dy <= radius * radius) {
      return { componentId: comp.id, portId: port.id, x: pos.x, y: pos.y };
    }
  }
  return null;
}
