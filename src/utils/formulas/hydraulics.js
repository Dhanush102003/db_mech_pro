// ============================================
// HYDRAULIC SYSTEM FORMULAS
// All formulas verified against Excel resource files
// ============================================

/** Convert HP to kW */
export const hpToKw = (hp) => hp * 0.7457;

/** Pump theoretical flow (L/min) = displacement(cc/rev) × RPM / 1000 */
export const pumpFlowTheoretical = (displacement, rpm) => (displacement * rpm) / 1000;

/** Pump actual flow (L/min) = theoretical × volumetric efficiency */
export const pumpFlowActual = (displacement, rpm, volEff) =>
  pumpFlowTheoretical(displacement, rpm) * (volEff / 100);

/** Relief valve setting (bar) = working pressure × 1.1 */
export const reliefValveSetting = (workingPressure) => workingPressure * 1.1;

/** Hydraulic power (kW) = Q(L/min) × P(bar) / 600 */
export const hydraulicPower = (flow, pressure) => (flow * pressure) / 600;

/** Pump safety factor = relief setting / working pressure */
export const pumpSafetyFactor = (reliefSetting, workingPressure) =>
  reliefSetting / workingPressure;

/** Minimum pipe ID (mm) = √(4Q / (π×v)) × 1000, Q in m³/s, v in m/s */
export const minPipeID = (flowLPM, targetVelocity) => {
  const flowM3s = flowLPM / 60000;
  return Math.sqrt((4 * flowM3s) / (Math.PI * targetVelocity)) * 1000;
};

/** Flow velocity (m/s) in a pipe */
export const flowVelocity = (flowLPM, pipeIDmm) => {
  const flowM3s = flowLPM / 60000;
  const areaM2 = Math.PI * Math.pow(pipeIDmm / 2000, 2);
  return flowM3s / areaM2;
};

/** Reynolds number = v × D / ν */
export const reynoldsNumber = (velocity, diameterMM, viscosityCst) => {
  const kinVisc = viscosityCst * 1e-6; // cSt to m²/s
  return (velocity * (diameterMM / 1000)) / kinVisc;
};

/** Flow regime from Reynolds number */
export const flowRegime = (re) => {
  if (re < 2300) return 'Laminar';
  if (re < 4000) return 'Transitional';
  return 'Turbulent';
};

/** Darcy friction factor */
export const frictionFactor = (re) => {
  if (re < 2300) return 64 / re;
  return 0.3164 / Math.pow(re, 0.25); // Blasius
};

/** Pipe friction pressure drop (bar) */
export const pipeFrictionDrop = (re, lengthMM, diameterMM, density, velocity) => {
  if (lengthMM === 0) return 0;
  const f = frictionFactor(re);
  return f * (lengthMM / 1000 / (diameterMM / 1000)) * (density * velocity * velocity / 2) / 100000;
};

/** Fitting pressure drop (bar) */
export const fittingDrop = (kFactor, numFittings, density, velocity) => {
  return kFactor * numFittings * (density * velocity * velocity / 2) / 100000;
};

/** Hoop stress (MPa) = P(bar) × ID(mm) / (2 × wall(mm)) / 10 */
export const hoopStress = (pressureBar, idMM, wallMM) => {
  if (wallMM <= 0) return Infinity;
  return (pressureBar * idMM) / (2 * wallMM) / 10;
};

/** LMTD = (ΔT1 - ΔT2) / ln(ΔT1/ΔT2) */
export const lmtd = (dt1, dt2) => {
  if (dt1 === dt2) return dt1;
  if (dt1 <= 0 || dt2 <= 0) return 0;
  return (dt1 - dt2) / Math.log(dt1 / dt2);
};

/** Heat generated (W) = Power(kW) × (1 - efficiency) × 1000 */
export const heatGenerated = (powerKW, efficiency) =>
  powerKW * (1 - efficiency / 100) * 1000;

/** Cooler area (m²) = Q(W) / (U × LMTD) */
export const coolerArea = (heatW, uValue, lmtdVal) => {
  if (uValue <= 0 || lmtdVal <= 0) return 0;
  return heatW / (uValue * lmtdVal);
};

/** U value from cooler type */
export const uValueFromType = (type) => {
  const map = {
    'Air-Oil (Engine Fan)': 45,
    'Air-Oil (Separate Fan)': 65,
    'Water-Oil': 300,
  };
  return map[type] || 45;
};

/** Filter pressure drop = cleanDP × (flowRatio)^1.8 */
export const filterPressureDrop = (cleanDP, systemFlow, ratedFlow) => {
  const ratio = systemFlow / ratedFlow;
  return cleanDP * Math.pow(ratio, 1.8);
};

/** Filter life factor (%) */
export const filterLifeFactor = (currentDP, bypassSetting) => {
  if (bypassSetting <= 0) return 0;
  return Math.round((1 - currentDP / bypassSetting) * 1000) / 10;
};

/** Filter status */
export const filterStatus = (currentDP, bypassSetting) => {
  if (currentDP >= bypassSetting) return { text: '❌ BYPASSING', cls: 'status-fail' };
  if (currentDP / bypassSetting > 0.7) return { text: '⚠️ Replace Soon', cls: 'status-warn' };
  return { text: '✅ OK', cls: 'status-ok' };
};

/** Viscosity at temperature (Vogel approximation) */
export const viscosityAtTemp = (visc40, temp) => {
  return visc40 * Math.exp(-0.028 * (temp - 40));
};

/** Velocity check status for different line types */
export const velocityCheck = (velocity, lineType) => {
  const limits = {
    'Pressure': { min: 3, max: 5 },
    'Return': { min: 1, max: 2 },
    'Suction': { min: 0.5, max: 1 },
    'Case Drain': { min: 0.3, max: 1 },
    'Pilot': { min: 1, max: 4 },
    'Steering': { min: 2, max: 4 },
  };
  const lim = limits[lineType] || { min: 1, max: 5 };
  if (velocity > lim.max) return { text: '⚠️ Too Fast', cls: 'status-warn' };
  if (velocity < lim.min) return { text: '⚠️ Too Slow', cls: 'status-warn' };
  return { text: '✅ OK', cls: 'status-ok' };
};

/** K-factor reference table */
export const kFactors = {
  '90° Std Elbow': 0.9,
  '90° LR Elbow': 0.45,
  '45° Elbow': 0.35,
  '30° Bend': 0.2,
  '60° Bend': 0.55,
  '180° Return': 1.5,
  'Tee (through)': 0.4,
  'Tee (branch)': 1.8,
  'Gate Valve': 0.2,
  'Ball Valve': 0.05,
  'Check (swing)': 2,
  'Check (ball)': 4,
  'Sudden Contract': 0.5,
  'Sudden Expand': 1,
  'Entry (sharp)': 0.5,
  'Exit loss': 1,
  'Reducer': 0.1,
  'Strainer': 2,
  'DCV Open Centre': 5,
  'DCV Closed Centre': 8,
  'Filter': 3,
  'Oil Cooler': 3,
  'Quick Coupler': 3.5,
  'Hydraulic Motor': 10,
  'Hyd Cylinder': 1.5,
  'Straight': 0,
};

/** Standard pipe sizes (DIN 2391) */
export const standardPipeSizes = [4, 5, 6, 8, 10, 12, 14, 15, 16, 18, 20, 22, 25, 28, 30, 32, 35, 38];

/** Select nearest standard pipe size */
export const selectStdPipeSize = (minID) => {
  for (const size of standardPipeSizes) {
    if (size >= minID) return size;
  }
  return standardPipeSizes[standardPipeSizes.length - 1];
};

/** Standard hose sizes (SAE) */
export const standardHoseSizes = [5, 6, 8, 10, 12, 16, 19, 25, 32, 38, 51];

export const selectStdHoseSize = (minID) => {
  for (const size of standardHoseSizes) {
    if (size >= minID) return size;
  }
  return standardHoseSizes[standardHoseSizes.length - 1];
};
