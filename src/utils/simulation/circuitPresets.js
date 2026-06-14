// ============================================
// PRE-BUILT HYDRAULIC CIRCUIT TEMPLATES
// 6 standard circuits for learning
// ============================================

let _id = 0;
const uid = () => `preset_${++_id}`;

export function getPresets() {
  // Reset ID counter for consistent IDs
  _id = 0;
  return PRESETS.map(p => ({ ...p, build: () => { _id = 0; return p.build(); } }));
}

const PRESETS = [
  {
    id: 'basic',
    name: 'Basic Extend/Retract',
    desc: 'Pump → DCV 4/3 → Double-Acting Cylinder → Tank',
    icon: '🔧',
    build: () => {
      const pumpId = uid();
      const dcvId = uid();
      const cylId = uid();
      const rvId = uid();
      const tankId = uid();
      return {
        components: [
          { id: pumpId, type: 'PUMP', x: 250, y: 400, rotation: 0, params: { pressure: 200, flowRate: 40 } },
          { id: dcvId, type: 'DCV43', x: 220, y: 250, rotation: 0, params: { position: 'center' } },
          { id: cylId, type: 'CYLINDER_DA', x: 190, y: 100, rotation: 0, params: { bore: 63, rod: 36, stroke: 200, extension: 0 } },
          { id: rvId, type: 'RELIEF_VALVE', x: 380, y: 350, rotation: 0, params: { setting: 250 } },
          { id: tankId, type: 'TANK', x: 380, y: 460, rotation: 0, params: {} },
        ],
        connections: [
          { id: uid(), fromComp: pumpId, fromPort: 'P', toComp: dcvId, toPort: 'P' },
          { id: uid(), fromComp: dcvId, fromPort: 'A', toComp: cylId, toPort: 'A' },
          { id: uid(), fromComp: dcvId, fromPort: 'B', toComp: cylId, toPort: 'B' },
          { id: uid(), fromComp: dcvId, fromPort: 'T', toComp: tankId, toPort: 'IN' },
          { id: uid(), fromComp: pumpId, fromPort: 'P', toComp: rvId, toPort: 'IN' },
          { id: uid(), fromComp: rvId, fromPort: 'OUT', toComp: tankId, toPort: 'IN' },
        ],
      };
    },
  },
  {
    id: 'meter-in',
    name: 'Meter-In Speed Control',
    desc: 'Flow control on pressure line for resistive loads',
    icon: '🎛️',
    build: () => {
      const pumpId = uid();
      const dcvId = uid();
      const fcvId = uid();
      const cylId = uid();
      const rvId = uid();
      const tankId = uid();
      return {
        components: [
          { id: pumpId, type: 'PUMP', x: 250, y: 450, rotation: 0, params: { pressure: 200, flowRate: 40 } },
          { id: dcvId, type: 'DCV43', x: 220, y: 300, rotation: 0, params: { position: 'center' } },
          { id: fcvId, type: 'FLOW_CONTROL', x: 230, y: 190, rotation: 0, params: { maxFlow: 15 } },
          { id: cylId, type: 'CYLINDER_DA', x: 190, y: 80, rotation: 0, params: { bore: 63, rod: 36, stroke: 200, extension: 0 } },
          { id: rvId, type: 'RELIEF_VALVE', x: 400, y: 400, rotation: 0, params: { setting: 250 } },
          { id: tankId, type: 'TANK', x: 400, y: 500, rotation: 0, params: {} },
        ],
        connections: [
          { id: uid(), fromComp: pumpId, fromPort: 'P', toComp: dcvId, toPort: 'P' },
          { id: uid(), fromComp: dcvId, fromPort: 'A', toComp: fcvId, toPort: 'IN' },
          { id: uid(), fromComp: fcvId, fromPort: 'OUT', toComp: cylId, toPort: 'A' },
          { id: uid(), fromComp: dcvId, fromPort: 'B', toComp: cylId, toPort: 'B' },
          { id: uid(), fromComp: dcvId, fromPort: 'T', toComp: tankId, toPort: 'IN' },
          { id: uid(), fromComp: pumpId, fromPort: 'P', toComp: rvId, toPort: 'IN' },
          { id: uid(), fromComp: rvId, fromPort: 'OUT', toComp: tankId, toPort: 'IN' },
        ],
      };
    },
  },
  {
    id: 'meter-out',
    name: 'Meter-Out Speed Control',
    desc: 'Flow control on return line for overrunning loads',
    icon: '🎚️',
    build: () => {
      const pumpId = uid();
      const dcvId = uid();
      const fcvId = uid();
      const cylId = uid();
      const rvId = uid();
      const tankId = uid();
      return {
        components: [
          { id: pumpId, type: 'PUMP', x: 250, y: 450, rotation: 0, params: { pressure: 200, flowRate: 40 } },
          { id: dcvId, type: 'DCV43', x: 220, y: 300, rotation: 0, params: { position: 'center' } },
          { id: cylId, type: 'CYLINDER_DA', x: 190, y: 80, rotation: 0, params: { bore: 63, rod: 36, stroke: 200, extension: 0 } },
          { id: fcvId, type: 'FLOW_CONTROL', x: 360, y: 190, rotation: 0, params: { maxFlow: 15 } },
          { id: rvId, type: 'RELIEF_VALVE', x: 400, y: 400, rotation: 0, params: { setting: 250 } },
          { id: tankId, type: 'TANK', x: 400, y: 500, rotation: 0, params: {} },
        ],
        connections: [
          { id: uid(), fromComp: pumpId, fromPort: 'P', toComp: dcvId, toPort: 'P' },
          { id: uid(), fromComp: dcvId, fromPort: 'A', toComp: cylId, toPort: 'A' },
          { id: uid(), fromComp: cylId, fromPort: 'B', toComp: fcvId, toPort: 'IN' },
          { id: uid(), fromComp: fcvId, fromPort: 'OUT', toComp: dcvId, toPort: 'B' },
          { id: uid(), fromComp: dcvId, fromPort: 'T', toComp: tankId, toPort: 'IN' },
          { id: uid(), fromComp: pumpId, fromPort: 'P', toComp: rvId, toPort: 'IN' },
          { id: uid(), fromComp: rvId, fromPort: 'OUT', toComp: tankId, toPort: 'IN' },
        ],
      };
    },
  },
  {
    id: 'regenerative',
    name: 'Regenerative Circuit',
    desc: 'Rod-side oil recirculated for faster extension',
    icon: '♻️',
    build: () => {
      const pumpId = uid();
      const dcvId = uid();
      const cylId = uid();
      const rvId = uid();
      const tankId = uid();
      const teeId = uid();
      return {
        components: [
          { id: pumpId, type: 'PUMP', x: 250, y: 450, rotation: 0, params: { pressure: 200, flowRate: 40 } },
          { id: dcvId, type: 'DCV43', x: 220, y: 300, rotation: 0, params: { position: 'center' } },
          { id: cylId, type: 'CYLINDER_DA', x: 190, y: 80, rotation: 0, params: { bore: 80, rod: 45, stroke: 300, extension: 0 } },
          { id: teeId, type: 'T_CONNECTOR', x: 240, y: 180, rotation: 0, params: {} },
          { id: rvId, type: 'RELIEF_VALVE', x: 420, y: 400, rotation: 0, params: { setting: 250 } },
          { id: tankId, type: 'TANK', x: 420, y: 500, rotation: 0, params: {} },
        ],
        connections: [
          { id: uid(), fromComp: pumpId, fromPort: 'P', toComp: dcvId, toPort: 'P' },
          { id: uid(), fromComp: dcvId, fromPort: 'A', toComp: teeId, toPort: 'A' },
          { id: uid(), fromComp: teeId, fromPort: 'B', toComp: cylId, toPort: 'A' },
          { id: uid(), fromComp: cylId, fromPort: 'B', toComp: teeId, toPort: 'C' },
          { id: uid(), fromComp: dcvId, fromPort: 'T', toComp: tankId, toPort: 'IN' },
          { id: uid(), fromComp: pumpId, fromPort: 'P', toComp: rvId, toPort: 'IN' },
          { id: uid(), fromComp: rvId, fromPort: 'OUT', toComp: tankId, toPort: 'IN' },
        ],
      };
    },
  },
  {
    id: 'motor',
    name: 'Hydraulic Motor Drive',
    desc: 'Pump → DCV → Hydraulic Motor for rotary motion',
    icon: '⚙️',
    build: () => {
      const pumpId = uid();
      const dcvId = uid();
      const motorId = uid();
      const rvId = uid();
      const tankId = uid();
      return {
        components: [
          { id: pumpId, type: 'PUMP', x: 250, y: 400, rotation: 0, params: { pressure: 180, flowRate: 30 } },
          { id: dcvId, type: 'DCV43', x: 220, y: 260, rotation: 0, params: { position: 'center' } },
          { id: motorId, type: 'MOTOR', x: 230, y: 120, rotation: 0, params: { displacement: 25 } },
          { id: rvId, type: 'RELIEF_VALVE', x: 400, y: 350, rotation: 0, params: { setting: 220 } },
          { id: tankId, type: 'TANK', x: 400, y: 460, rotation: 0, params: {} },
        ],
        connections: [
          { id: uid(), fromComp: pumpId, fromPort: 'P', toComp: dcvId, toPort: 'P' },
          { id: uid(), fromComp: dcvId, fromPort: 'A', toComp: motorId, toPort: 'IN' },
          { id: uid(), fromComp: motorId, fromPort: 'OUT', toComp: dcvId, toPort: 'B' },
          { id: uid(), fromComp: dcvId, fromPort: 'T', toComp: tankId, toPort: 'IN' },
          { id: uid(), fromComp: pumpId, fromPort: 'P', toComp: rvId, toPort: 'IN' },
          { id: uid(), fromComp: rvId, fromPort: 'OUT', toComp: tankId, toPort: 'IN' },
        ],
      };
    },
  },
  {
    id: 'safety',
    name: 'Safety Circuit',
    desc: 'Relief valve + check valve overpressure protection',
    icon: '🛡️',
    build: () => {
      const pumpId = uid();
      const cvId = uid();
      const dcvId = uid();
      const cylId = uid();
      const rvId = uid();
      const tankId = uid();
      return {
        components: [
          { id: pumpId, type: 'PUMP', x: 250, y: 450, rotation: 0, params: { pressure: 200, flowRate: 35 } },
          { id: cvId, type: 'CHECK_VALVE', x: 255, y: 370, rotation: 0, params: {} },
          { id: dcvId, type: 'DCV43', x: 220, y: 260, rotation: 0, params: { position: 'center' } },
          { id: cylId, type: 'CYLINDER_DA', x: 190, y: 100, rotation: 0, params: { bore: 63, rod: 36, stroke: 200, extension: 0 } },
          { id: rvId, type: 'RELIEF_VALVE', x: 400, y: 380, rotation: 0, params: { setting: 240 } },
          { id: tankId, type: 'TANK', x: 400, y: 500, rotation: 0, params: {} },
        ],
        connections: [
          { id: uid(), fromComp: pumpId, fromPort: 'P', toComp: cvId, toPort: 'IN' },
          { id: uid(), fromComp: cvId, fromPort: 'OUT', toComp: dcvId, toPort: 'P' },
          { id: uid(), fromComp: dcvId, fromPort: 'A', toComp: cylId, toPort: 'A' },
          { id: uid(), fromComp: dcvId, fromPort: 'B', toComp: cylId, toPort: 'B' },
          { id: uid(), fromComp: dcvId, fromPort: 'T', toComp: tankId, toPort: 'IN' },
          { id: uid(), fromComp: pumpId, fromPort: 'P', toComp: rvId, toPort: 'IN' },
          { id: uid(), fromComp: rvId, fromPort: 'OUT', toComp: tankId, toPort: 'IN' },
        ],
      };
    },
  },
  {
    id: 'tractor-pst',
    name: 'Tractor PST System (60HP)',
    desc: 'Power Shift Transmission — Pump → PST Valve → FWD/REV Clutch → Oil Cooler → Tank',
    icon: '🚜',
    build: () => {
      const pumpId = uid();
      const pstValveId = uid();
      const fwdCylId = uid();
      const revCylId = uid();
      const rvId = uid();
      const filterId = uid();
      const coolerId = uid();
      const tankId = uid();
      return {
        components: [
          // Power unit: 22.5 cc/rev single pump @ 2000 RPM = 45 L/min, 30 bar supply
          { id: pumpId, type: 'PUMP', x: 340, y: 520, rotation: 0, params: { pressure: 30, flowRate: 45 } },
          // PST Valve (DCV 4/3): FWD=20 bar, REV=30 bar clutch control
          { id: pstValveId, type: 'DCV43', x: 310, y: 350, rotation: 0, params: { position: 'center' } },
          // Forward clutch cylinder: 70 cm² piston, 3mm stroke
          { id: fwdCylId, type: 'CYLINDER_DA', x: 160, y: 160, rotation: 0, params: { bore: 94, rod: 50, stroke: 3, extension: 0 } },
          // Reverse clutch cylinder: same spec
          { id: revCylId, type: 'CYLINDER_DA', x: 480, y: 160, rotation: 0, params: { bore: 94, rod: 50, stroke: 3, extension: 0 } },
          // Relief valve: 30 bar system protection
          { id: rvId, type: 'RELIEF_VALVE', x: 530, y: 420, rotation: 0, params: { setting: 30 } },
          // Pressure line filter: 10 micron
          { id: filterId, type: 'FILTER', x: 355, y: 250, rotation: 0, params: { micron: 10 } },
          // Oil cooler: 1.46 kW capacity, 2 bar bypass
          { id: coolerId, type: 'OIL_COOLER', x: 530, y: 310, rotation: 0, params: { capacity: 1.5, bypassPressure: 2 } },
          // Tank / reservoir
          { id: tankId, type: 'TANK', x: 530, y: 540, rotation: 0, params: {} },
        ],
        connections: [
          // Pump P → Filter IN
          { id: uid(), fromComp: pumpId, fromPort: 'P', toComp: filterId, toPort: 'IN' },
          // Filter OUT → PST Valve P
          { id: uid(), fromComp: filterId, fromPort: 'OUT', toComp: pstValveId, toPort: 'P' },
          // PST Valve A → Forward Clutch A
          { id: uid(), fromComp: pstValveId, fromPort: 'A', toComp: fwdCylId, toPort: 'A' },
          // PST Valve B → Reverse Clutch A
          { id: uid(), fromComp: pstValveId, fromPort: 'B', toComp: revCylId, toPort: 'A' },
          // PST Valve T → Oil Cooler IN
          { id: uid(), fromComp: pstValveId, fromPort: 'T', toComp: coolerId, toPort: 'IN' },
          // Oil Cooler OUT → Tank
          { id: uid(), fromComp: coolerId, fromPort: 'OUT', toComp: tankId, toPort: 'IN' },
          // Pump P → Relief Valve IN (overpressure protection)
          { id: uid(), fromComp: pumpId, fromPort: 'P', toComp: rvId, toPort: 'IN' },
          // Relief Valve OUT → Tank
          { id: uid(), fromComp: rvId, fromPort: 'OUT', toComp: tankId, toPort: 'IN' },
        ],
      };
    },
  },
  {
    id: 'tractor-pst-75',
    name: 'Tractor PST System (75HP)',
    desc: 'Power Shift Transmission — 22.5/28cc pump, 290 Nm engine torque, 550 Nm clutch',
    icon: '🚜',
    build: () => {
      const pumpId = uid();
      const pstValveId = uid();
      const fwdClutchId = uid();
      const revClutchId = uid();
      const rvId = uid();
      const filterId = uid();
      const coolerId = uid();
      const tankId = uid();
      const strainerId = uid();
      return {
        components: [
          { id: strainerId, type: 'SUCTION_STRAINER', x: 340, y: 620, rotation: 0, params: { micron: 100 } },
          { id: pumpId, type: 'PUMP', x: 340, y: 500, rotation: 0, params: { pressure: 30, flowRate: 56 } },
          { id: filterId, type: 'FILTER', x: 355, y: 380, rotation: 0, params: { micron: 10 } },
          { id: pstValveId, type: 'DCV43', x: 310, y: 260, rotation: 0, params: { position: 'center' } },
          { id: fwdClutchId, type: 'CLUTCH_PACK', x: 140, y: 120, rotation: 0, params: { plateArea: 70, numPlates: 6, clutchTorque: 550 } },
          { id: revClutchId, type: 'CLUTCH_PACK', x: 460, y: 120, rotation: 0, params: { plateArea: 70, numPlates: 6, clutchTorque: 550 } },
          { id: rvId, type: 'RELIEF_VALVE', x: 550, y: 400, rotation: 0, params: { setting: 30 } },
          { id: coolerId, type: 'OIL_COOLER', x: 550, y: 260, rotation: 0, params: { capacity: 2.0, bypassPressure: 2 } },
          { id: tankId, type: 'TANK', x: 550, y: 560, rotation: 0, params: {} },
        ],
        connections: [
          { id: uid(), fromComp: strainerId, fromPort: 'OUT', toComp: pumpId, toPort: 'T' },
          { id: uid(), fromComp: pumpId, fromPort: 'P', toComp: filterId, toPort: 'IN' },
          { id: uid(), fromComp: filterId, fromPort: 'OUT', toComp: pstValveId, toPort: 'P' },
          { id: uid(), fromComp: pstValveId, fromPort: 'A', toComp: fwdClutchId, toPort: 'IN' },
          { id: uid(), fromComp: pstValveId, fromPort: 'B', toComp: revClutchId, toPort: 'IN' },
          { id: uid(), fromComp: pstValveId, fromPort: 'T', toComp: coolerId, toPort: 'IN' },
          { id: uid(), fromComp: coolerId, fromPort: 'OUT', toComp: tankId, toPort: 'IN' },
          { id: uid(), fromComp: pumpId, fromPort: 'P', toComp: rvId, toPort: 'IN' },
          { id: uid(), fromComp: rvId, fromPort: 'OUT', toComp: tankId, toPort: 'IN' },
        ],
      };
    },
  },
  {
    id: 'oil-cooler-bypass',
    name: 'Oil Cooler Bypass Circuit',
    desc: 'Thermal management sub-circuit — 2 BAR bypass relief valve + oil cooler',
    icon: '❄️',
    build: () => {
      const pumpId = uid();
      const bypassRvId = uid();
      const coolerId = uid();
      const teeId = uid();
      const tankId = uid();
      const tempId = uid();
      return {
        components: [
          { id: pumpId, type: 'PUMP', x: 280, y: 450, rotation: 0, params: { pressure: 10, flowRate: 30 } },
          { id: teeId, type: 'T_CONNECTOR', x: 295, y: 320, rotation: 0, params: {} },
          { id: bypassRvId, type: 'RELIEF_VALVE', x: 200, y: 200, rotation: 0, params: { setting: 2 } },
          { id: coolerId, type: 'OIL_COOLER', x: 360, y: 200, rotation: 0, params: { capacity: 1.5, bypassPressure: 2 } },
          { id: tempId, type: 'TEMP_SWITCH', x: 440, y: 150, rotation: 0, params: { threshold: 90 } },
          { id: tankId, type: 'TANK', x: 320, y: 530, rotation: 0, params: {} },
        ],
        connections: [
          { id: uid(), fromComp: pumpId, fromPort: 'P', toComp: teeId, toPort: 'C' },
          { id: uid(), fromComp: teeId, fromPort: 'A', toComp: bypassRvId, toPort: 'IN' },
          { id: uid(), fromComp: teeId, fromPort: 'B', toComp: coolerId, toPort: 'IN' },
          { id: uid(), fromComp: bypassRvId, fromPort: 'OUT', toComp: tankId, toPort: 'IN' },
          { id: uid(), fromComp: coolerId, fromPort: 'OUT', toComp: tankId, toPort: 'IN' },
        ],
      };
    },
  },
];

export default PRESETS;
