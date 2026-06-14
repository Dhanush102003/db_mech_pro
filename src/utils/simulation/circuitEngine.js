// ============================================
// HYDRAULIC CIRCUIT SIMULATION ENGINE
// Graph-based pressure/flow solver
// ============================================

/**
 * Simulate one tick of the hydraulic circuit.
 * Takes components array and connections array,
 * returns updated component states and connection pressures/flows.
 */
export function simulateCircuit(components, connections) {
  const states = {};
  const connStates = {};

  // Initialize states
  for (const comp of components) {
    states[comp.id] = { ...comp.params, pressure: 0, flow: 0, active: false };
  }

  // Find pump(s)
  const pumps = components.filter(c => c.type === 'PUMP');
  if (pumps.length === 0) return { states, connStates };

  // For each pump, propagate pressure through connections
  for (const pump of pumps) {
    const pumpPressure = pump.params?.pressure || 200;
    const pumpFlow = pump.params?.flowRate || 40;
    states[pump.id].pressure = pumpPressure;
    states[pump.id].flow = pumpFlow;
    states[pump.id].active = true;

    // BFS from pump output port
    const visited = new Set();
    const queue = [{ compId: pump.id, portId: 'P', pressure: pumpPressure, flow: pumpFlow }];

    while (queue.length > 0) {
      const { compId, portId, pressure, flow } = queue.shift();
      const key = `${compId}:${portId}`;
      if (visited.has(key)) continue;
      visited.add(key);

      // Find connections from this port
      const outConns = connections.filter(c =>
        (c.fromComp === compId && c.fromPort === portId) ||
        (c.toComp === compId && c.toPort === portId)
      );

      for (const conn of outConns) {
        const targetCompId = conn.fromComp === compId ? conn.toComp : conn.fromComp;
        const targetPortId = conn.fromComp === compId ? conn.toPort : conn.fromPort;
        const connKey = conn.id;

        if (connStates[connKey]) continue;

        const targetComp = components.find(c => c.id === targetCompId);
        if (!targetComp) continue;

        let outPressure = pressure;
        let outFlow = flow;

        // Process component logic
        switch (targetComp.type) {
          case 'RELIEF_VALVE': {
            const setting = targetComp.params?.setting || 250;
            if (pressure > setting) {
              outPressure = setting;
              states[targetComp.id].active = true;
            }
            break;
          }
          case 'DCV43': {
            const pos = targetComp.params?.position || 'center';
            if (pos === 'center') {
              outFlow = 0;
              outPressure = 0;
            }
            states[targetComp.id].active = pos !== 'center';
            break;
          }
          case 'DCV32': {
            const pos = targetComp.params?.position || 'off';
            if (pos === 'off') {
              outFlow = 0;
              outPressure = 0;
            }
            states[targetComp.id].active = pos !== 'off';
            break;
          }
          case 'FLOW_CONTROL': {
            const maxFlow = targetComp.params?.maxFlow || 30;
            outFlow = Math.min(outFlow, maxFlow);
            states[targetComp.id].active = true;
            break;
          }
          case 'CHECK_VALVE': {
            // Only allow flow in one direction (IN → OUT)
            if (targetPortId !== 'IN') {
              outFlow = 0;
              outPressure = 0;
            }
            break;
          }
          case 'PRESSURE_REDUCING': {
            const setting = targetComp.params?.setting || 100;
            outPressure = Math.min(outPressure, setting);
            break;
          }
          case 'CYLINDER_DA': {
            const bore = targetComp.params?.bore || 63;
            const rod = targetComp.params?.rod || 36;
            const area = Math.PI * Math.pow(bore / 2, 2) / 100; // cm²
            const annArea = Math.PI * (Math.pow(bore / 2, 2) - Math.pow(rod / 2, 2)) / 100;
            if (targetPortId === 'A') {
              states[targetComp.id].force = (outPressure * area) / 10; // kN
              states[targetComp.id].direction = 'extend';
              states[targetComp.id].speed = (outFlow * 1000) / (60 * area); // mm/s
            } else {
              states[targetComp.id].force = (outPressure * annArea) / 10;
              states[targetComp.id].direction = 'retract';
              states[targetComp.id].speed = (outFlow * 1000) / (60 * annArea);
            }
            states[targetComp.id].active = outFlow > 0;
            break;
          }
          case 'CYLINDER_SA': {
            const bore = targetComp.params?.bore || 50;
            const area = Math.PI * Math.pow(bore / 2, 2) / 100;
            states[targetComp.id].force = (outPressure * area) / 10;
            states[targetComp.id].direction = 'extend';
            states[targetComp.id].speed = (outFlow * 1000) / (60 * area);
            states[targetComp.id].active = outFlow > 0;
            break;
          }
          case 'MOTOR': {
            const disp = targetComp.params?.displacement || 25;
            states[targetComp.id].rpm = (outFlow * 1000) / disp;
            states[targetComp.id].torque = (outPressure * disp) / (20 * Math.PI);
            states[targetComp.id].active = outFlow > 0;
            break;
          }
          case 'PRESSURE_GAUGE': {
            states[targetComp.id].reading = outPressure;
            states[targetComp.id].active = true;
            break;
          }
          case 'FLOW_METER': {
            states[targetComp.id].reading = outFlow;
            states[targetComp.id].active = true;
            break;
          }
          case 'OIL_COOLER': {
            // Oil cooler passes flow, reduces temperature conceptually
            states[targetComp.id].active = outFlow > 0;
            states[targetComp.id].coolingCapacity = targetComp.params?.capacity || 1.5;
            break;
          }
          case 'SUCTION_STRAINER': {
            // Minor pressure drop through strainer mesh
            const micron = targetComp.params?.micron || 100;
            const dropFactor = micron < 50 ? 0.5 : 0.2;
            outPressure = Math.max(0, outPressure - dropFactor);
            states[targetComp.id].active = outFlow > 0;
            break;
          }
          case 'STEERING_UNIT': {
            // Consumes portion of flow based on displacement & RPM
            const disp = targetComp.params?.displacement || 12;
            const rpm = targetComp.params?.rpm || 2000;
            const consumed = (disp * rpm) / 1000; // L/min
            states[targetComp.id].flowConsumed = consumed;
            outFlow = Math.max(0, outFlow - consumed);
            states[targetComp.id].active = outFlow >= 0;
            break;
          }
          case 'CLUTCH_PACK': {
            // Engagement force from pressure × plate area
            const plateArea = targetComp.params?.plateArea || 70; // cm²
            const numPlates = targetComp.params?.numPlates || 5;
            const mu = 0.12; // friction coefficient
            const engagementForce = (outPressure * plateArea) / 10; // kN
            const torqueCapacity = engagementForce * 1000 * mu * numPlates * 0.08; // Nm (0.08m mean radius)
            states[targetComp.id].engagementForce = engagementForce;
            states[targetComp.id].torqueCapacity = torqueCapacity;
            states[targetComp.id].engaged = outPressure > 5;
            states[targetComp.id].active = outPressure > 5;
            break;
          }
          case 'TEMP_SWITCH': {
            // Reads temperature state, warns if above threshold
            const threshold = targetComp.params?.threshold || 90;
            states[targetComp.id].reading = outPressure > 0 ? 72 : 25; // simulated temp
            states[targetComp.id].warning = states[targetComp.id].reading > threshold;
            states[targetComp.id].active = true;
            break;
          }
          default:
            break;
        }

        states[targetComp.id].pressure = outPressure;
        states[targetComp.id].flow = outFlow;

        connStates[connKey] = {
          pressure: outPressure,
          flow: outFlow,
          active: outFlow > 0,
        };

        // Continue propagation through component's other ports
        const otherPorts = getOutputPorts(targetComp.type, targetPortId, targetComp);
        for (const op of otherPorts) {
          queue.push({ compId: targetCompId, portId: op, pressure: outPressure, flow: outFlow });
        }
      }
    }
  }

  return { states, connStates };
}

// Get output port(s) of a component given an input port
// For DCVs, routing depends on valve position
function getOutputPorts(type, inputPort, comp) {
  switch (type) {
    case 'PUMP':
      return inputPort === 'T' ? ['P'] : [];
    case 'DCV43': {
      const pos = comp?.params?.position || 'center';
      if (pos === 'center') return []; // All ports blocked
      if (pos === 'extend') {
        // P→A, B→T
        if (inputPort === 'P') return ['A'];
        if (inputPort === 'B') return ['T'];
        if (inputPort === 'A') return []; // dead end in extend
        if (inputPort === 'T') return [];
      }
      if (pos === 'retract') {
        // P→B, A→T
        if (inputPort === 'P') return ['B'];
        if (inputPort === 'A') return ['T'];
        if (inputPort === 'B') return []; // dead end in retract
        if (inputPort === 'T') return [];
      }
      return [];
    }
    case 'DCV32': {
      const pos = comp?.params?.position || 'off';
      if (pos === 'off') return []; // Blocked
      // 'on': P→A, A→T
      if (inputPort === 'P') return ['A'];
      if (inputPort === 'A') return ['T'];
      return [];
    }
    case 'FLOW_CONTROL': return inputPort === 'IN' ? ['OUT'] : [];
    case 'CHECK_VALVE': return inputPort === 'IN' ? ['OUT'] : [];
    case 'RELIEF_VALVE': return inputPort === 'IN' ? ['OUT'] : [];
    case 'PRESSURE_REDUCING': return inputPort === 'IN' ? ['OUT'] : [];
    case 'CYLINDER_DA': return inputPort === 'A' ? ['B'] : inputPort === 'B' ? ['A'] : [];
    case 'CYLINDER_SA': return [];
    case 'MOTOR': return inputPort === 'IN' ? ['OUT'] : [];
    case 'T_CONNECTOR': {
      const all = ['A', 'B', 'C'];
      return all.filter(p => p !== inputPort);
    }
    case 'PRESSURE_GAUGE': return [];
    case 'FLOW_METER': return inputPort === 'IN' ? ['OUT'] : [];
    case 'FILTER': return inputPort === 'IN' ? ['OUT'] : [];
    case 'TANK': return [];
    case 'OIL_COOLER': return inputPort === 'IN' ? ['OUT'] : [];
    case 'SUCTION_STRAINER': return inputPort === 'IN' ? ['OUT'] : [];
    case 'STEERING_UNIT': return inputPort === 'IN' ? ['OUT'] : [];
    case 'CLUTCH_PACK': return inputPort === 'IN' ? ['OUT'] : [];
    case 'TEMP_SWITCH': return [];
    default: return [];
  }
}

/**
 * Generate oil flow particles for animation
 */
export function generateFlowParticles(connections, components, connStates, existing = []) {
  const particles = [...existing];
  const now = Date.now();

  for (const conn of connections) {
    const cs = connStates[conn.id];
    if (!cs || !cs.active || cs.flow <= 0) continue;

    // Spawn rate based on flow
    const rate = Math.max(200, 1000 - cs.flow * 15);
    const lastSpawn = conn._lastSpawn || 0;
    if (now - lastSpawn < rate) continue;
    conn._lastSpawn = now;

    const fromComp = components.find(c => c.id === conn.fromComp);
    const toComp = components.find(c => c.id === conn.toComp);
    if (!fromComp || !toComp) continue;

    particles.push({
      id: `p_${now}_${Math.random().toString(36).substr(2, 5)}`,
      connId: conn.id,
      t: 0,
      speed: 0.005 + cs.flow * 0.0003,
      pressure: cs.pressure,
      born: now,
    });
  }

  // Update and filter
  return particles
    .map(p => ({ ...p, t: p.t + p.speed }))
    .filter(p => p.t <= 1 && now - p.born < 10000);
}

/**
 * Validate circuit for common issues
 */
export function validateCircuit(components, connections) {
  const warnings = [];
  const errors = [];

  // Check for pump
  const hasPump = components.some(c => c.type === 'PUMP');
  if (!hasPump && components.length > 0) {
    errors.push('No pump found — every circuit needs a power unit');
  }

  // Check for relief valve
  const hasRelief = components.some(c => c.type === 'RELIEF_VALVE');
  if (hasPump && !hasRelief) {
    warnings.push('No relief valve — circuit lacks overpressure protection');
  }

  // Check for unconnected components
  const connectedIds = new Set();
  for (const conn of connections) {
    connectedIds.add(conn.fromComp);
    connectedIds.add(conn.toComp);
  }
  for (const comp of components) {
    if (!connectedIds.has(comp.id)) {
      warnings.push(`${comp.params?.label || comp.type} is not connected`);
    }
  }

  // Check for tank/return path
  const hasTank = components.some(c => c.type === 'TANK');
  if (hasPump && !hasTank && components.length > 2) {
    warnings.push('No reservoir/tank — circuit needs a return path');
  }

  const status = errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'ok';
  return { status, errors, warnings };
}
