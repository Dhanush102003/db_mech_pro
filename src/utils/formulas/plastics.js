// ============================================
// PLASTICS / INJECTION MOULDING FORMULAS
// ============================================

// ---- Material Database ----
// Properties sourced from typical processing datasheets
export const plasticMaterials = [
  'PP (Polypropylene)',
  'ABS',
  'PA6 (Nylon 6)',
  'PC (Polycarbonate)',
  'POM (Acetal)',
  'HDPE',
  'PEEK',
  'PBT',
  'PS (Polystyrene)',
  'PMMA (Acrylic)',
];

// meltTempRange [°C], mouldTemp [°C], density [g/cm³], specificHeat [J/(g·K)],
// thermalDiffusivity [mm²/s], shrinkageRange [%], recommendedPressure [MPa],
// viscosityIndex (relative 1-10, higher = more viscous)
export const materialProperties = {
  'PP (Polypropylene)':  { meltMin: 200, meltMax: 280, mouldTemp: 40,  density: 0.91, specificHeat: 1.92, thermalDiffusivity: 0.096, shrinkMin: 1.0, shrinkMax: 2.5, recPressure: 80,  viscosity: 3, ejectTemp: 90  },
  'ABS':                 { meltMin: 220, meltMax: 270, mouldTemp: 60,  density: 1.05, specificHeat: 1.40, thermalDiffusivity: 0.120, shrinkMin: 0.4, shrinkMax: 0.7, recPressure: 100, viscosity: 5, ejectTemp: 85  },
  'PA6 (Nylon 6)':       { meltMin: 230, meltMax: 290, mouldTemp: 80,  density: 1.13, specificHeat: 1.70, thermalDiffusivity: 0.110, shrinkMin: 0.8, shrinkMax: 1.5, recPressure: 100, viscosity: 4, ejectTemp: 100 },
  'PC (Polycarbonate)':  { meltMin: 280, meltMax: 320, mouldTemp: 90,  density: 1.20, specificHeat: 1.17, thermalDiffusivity: 0.130, shrinkMin: 0.5, shrinkMax: 0.7, recPressure: 120, viscosity: 7, ejectTemp: 130 },
  'POM (Acetal)':        { meltMin: 190, meltMax: 230, mouldTemp: 80,  density: 1.41, specificHeat: 1.47, thermalDiffusivity: 0.105, shrinkMin: 1.5, shrinkMax: 3.0, recPressure: 90,  viscosity: 4, ejectTemp: 110 },
  'HDPE':                { meltMin: 200, meltMax: 280, mouldTemp: 35,  density: 0.95, specificHeat: 2.30, thermalDiffusivity: 0.090, shrinkMin: 1.5, shrinkMax: 3.0, recPressure: 70,  viscosity: 3, ejectTemp: 80  },
  'PEEK':                { meltMin: 360, meltMax: 400, mouldTemp: 160, density: 1.30, specificHeat: 1.34, thermalDiffusivity: 0.180, shrinkMin: 1.0, shrinkMax: 1.5, recPressure: 140, viscosity: 9, ejectTemp: 200 },
  'PBT':                 { meltMin: 230, meltMax: 270, mouldTemp: 60,  density: 1.31, specificHeat: 1.25, thermalDiffusivity: 0.115, shrinkMin: 1.5, shrinkMax: 2.0, recPressure: 100, viscosity: 5, ejectTemp: 100 },
  'PS (Polystyrene)':    { meltMin: 180, meltMax: 260, mouldTemp: 30,  density: 1.05, specificHeat: 1.30, thermalDiffusivity: 0.110, shrinkMin: 0.3, shrinkMax: 0.6, recPressure: 70,  viscosity: 3, ejectTemp: 75  },
  'PMMA (Acrylic)':      { meltMin: 220, meltMax: 270, mouldTemp: 60,  density: 1.18, specificHeat: 1.47, thermalDiffusivity: 0.120, shrinkMin: 0.2, shrinkMax: 0.8, recPressure: 100, viscosity: 6, ejectTemp: 85  },
};

// ============================================
// 1. CLAMP FORCE CALCULATIONS
// ============================================

/**
 * Calculate projected area of a rectangular part
 * @param {number} length - Part length (mm)
 * @param {number} width - Part width (mm)
 * @returns {number} Projected area (mm²)
 */
export const projectedArea = (length, width) => length * width;

/**
 * Calculate projected area of a circular part
 * @param {number} diameter - Part diameter (mm)
 * @returns {number} Projected area (mm²)
 */
export const projectedAreaCircular = (diameter) => Math.PI * (diameter / 2) ** 2;

/**
 * Calculate required clamp force
 * F_clamp = P_cavity × A_projected × N_cavities × safety_factor
 * @param {number} cavityPressureMPa - Avg cavity pressure (MPa)
 * @param {number} projAreaMM2 - Projected area per cavity (mm²)
 * @param {number} numCavities - Number of cavities
 * @param {number} safetyFactor - Safety factor (typically 1.1-1.2)
 * @returns {number} Clamp force in kN
 */
export const clampForce = (cavityPressureMPa, projAreaMM2, numCavities, safetyFactor = 1.1) =>
  (cavityPressureMPa * projAreaMM2 * numCavities * safetyFactor) / 1000;

/** Convert kN to metric tons */
export const kNToTons = (kN) => kN / 9.80665;

/** Convert kN to US tons */
export const kNToUSTons = (kN) => kN / 8.89644;

/**
 * Recommend machine size based on clamp force
 * Standard injection moulding machine sizes (tons)
 */
export const recommendMachine = (clampTons) => {
  const sizes = [50, 80, 100, 120, 150, 180, 200, 250, 300, 350, 400, 450, 500, 650, 800, 1000, 1300, 1600, 2000, 2500, 3000];
  for (const s of sizes) {
    if (s >= clampTons) return s;
  }
  return clampTons > 3000 ? Math.ceil(clampTons / 100) * 100 : sizes[sizes.length - 1];
};


// ============================================
// 2. INJECTION PRESSURE CALCULATIONS
// ============================================

/**
 * Pressure drop in a runner (simplified Hagen-Poiseuille for polymer melt)
 * ΔP = (128 × η × Q × L) / (π × D⁴)
 * Simplified using viscosity index
 */
export const runnerPressureDrop = (length, diameter, flowRate, viscosityIndex) => {
  // Apparent viscosity estimate: η = viscosityIndex × 100 Pa·s
  const eta = viscosityIndex * 100; // Pa·s
  const Q = flowRate / 1e6; // mm³/s → m³/s ... simplified
  const L = length / 1000; // mm → m
  const D = diameter / 1000; // mm → m
  if (D <= 0) return 0;
  return (128 * eta * Q * L) / (Math.PI * D ** 4) / 1e6; // Pa → MPa
};

/**
 * Pressure drop through the gate
 * Uses simplified orifice flow model
 */
export const gatePressureDrop = (gateArea, flowRate, viscosityIndex) => {
  if (gateArea <= 0) return 0;
  const eta = viscosityIndex * 100;
  const area = gateArea / 1e6; // mm² → m²
  const Q = flowRate / 1e6;
  // ΔP ≈ η × Q / (2 × A²) simplified
  return (eta * Q) / (2 * area * area) / 1e6;
};

/**
 * Cavity pressure drop using flow-length / wall-thickness ratio
 * ΔP_cavity ≈ K × (L/t)^1.6 × η_factor
 */
export const cavityPressureDrop = (flowLength, wallThickness, viscosityIndex) => {
  if (wallThickness <= 0) return 0;
  const ratio = flowLength / wallThickness;
  const K = 0.005; // empirical constant
  return K * Math.pow(ratio, 1.6) * viscosityIndex;
};

/**
 * Total injection pressure required
 */
export const totalInjectionPressure = (runnerDrop, gateDrop, cavityDrop, nozzleDrop = 5) =>
  nozzleDrop + runnerDrop + gateDrop + cavityDrop;

/**
 * Estimated fill time based on part volume and flow rate
 */
export const fillTime = (partVolumeCm3, flowRateCm3s) =>
  flowRateCm3s > 0 ? partVolumeCm3 / flowRateCm3s : 0;


// ============================================
// 3. COOLING TIME CALCULATIONS
// ============================================

/**
 * Cooling time using Fourier's equation for plate geometry
 * t_cool = (s² / (π² × α)) × ln((8/π²) × (T_melt - T_mould) / (T_eject - T_mould))
 * @param {number} wallThickness - Max wall thickness (mm)
 * @param {number} thermalDiffusivity - α (mm²/s)
 * @param {number} meltTemp - Melt temperature (°C)
 * @param {number} mouldTemp - Mould temperature (°C)
 * @param {number} ejectTemp - Ejection temperature (°C)
 * @returns {number} Cooling time (seconds)
 */
export const coolingTime = (wallThickness, thermalDiffusivity, meltTemp, mouldTemp, ejectTemp) => {
  if (thermalDiffusivity <= 0 || ejectTemp <= mouldTemp) return 0;
  const s = wallThickness; // half-thickness for plate cooling
  const alpha = thermalDiffusivity;
  const tempRatio = (8 / (Math.PI * Math.PI)) * ((meltTemp - mouldTemp) / (ejectTemp - mouldTemp));
  if (tempRatio <= 0) return 0;
  return (s * s / (Math.PI * Math.PI * alpha)) * Math.log(tempRatio);
};

/**
 * Estimated total cycle time
 * cycle = injection + cooling + mould open/close + ejection
 */
export const cycleTime = (fillTimeSec, coolTimeSec, mouldMovementSec = 3, ejectionSec = 1) =>
  fillTimeSec + coolTimeSec + mouldMovementSec + ejectionSec;

/**
 * Heat removal rate per shot
 * Q = m × Cp × (T_melt - T_eject)
 * @param {number} partMassG - Part mass (g)
 * @param {number} specificHeat - Cp (J/(g·K))
 * @param {number} meltTemp - °C
 * @param {number} ejectTemp - °C
 * @returns {number} Heat per shot (J)
 */
export const heatPerShot = (partMassG, specificHeat, meltTemp, ejectTemp) =>
  partMassG * specificHeat * (meltTemp - ejectTemp);

/**
 * Required coolant flow rate
 * Q_flow = Q_heat / (ρ_water × Cp_water × ΔT_water × t_cool)
 */
export const coolantFlowRate = (heatJ, coolingTimeSec, waterTempRise = 5) => {
  if (coolingTimeSec <= 0) return 0;
  const rhoWater = 1; // g/cm³
  const cpWater = 4.186; // J/(g·K)
  // L/min
  return (heatJ / (rhoWater * cpWater * waterTempRise * coolingTimeSec)) / 1000 * 60;
};

/**
 * Temperature profile through wall thickness at time t
 * For animation — returns array of {x, temp} where x is position through wall
 */
export const temperatureProfile = (wallThickness, thermalDiffusivity, meltTemp, mouldTemp, timeSec, points = 50) => {
  const result = [];
  const s = wallThickness;
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * s; // position from mould wall
    let T = mouldTemp;
    // Fourier series solution (first 10 terms)
    for (let n = 1; n <= 10; n++) {
      const nPi = n * Math.PI;
      const term = (Math.pow(-1, n + 1) + 1) / (n * Math.PI);
      const spatial = Math.sin((nPi * x) / s);
      const temporal = Math.exp(-Math.pow(nPi / s, 2) * thermalDiffusivity * timeSec);
      T += 2 * (meltTemp - mouldTemp) * term * spatial * temporal;
    }
    result.push({ x, temp: Math.max(mouldTemp, Math.min(meltTemp, T)) });
  }
  return result;
};


// ============================================
// 4. SHRINKAGE CALCULATIONS
// ============================================

/**
 * Linear shrinkage (%)
 * Uses average of material shrinkage range, adjusted by packing pressure
 */
export const linearShrinkage = (shrinkMin, shrinkMax, packingPressureMPa, basePressure = 50) => {
  const avgShrink = (shrinkMin + shrinkMax) / 2;
  // Higher packing pressure reduces shrinkage (approximately linear relationship)
  const pressureFactor = Math.max(0.3, 1 - (packingPressureMPa - basePressure) / (basePressure * 4));
  return avgShrink * pressureFactor;
};

/**
 * Volumetric shrinkage (approx 3× linear for isotropic)
 */
export const volumetricShrinkage = (linearShrinkPct) => linearShrinkPct * 3;

/**
 * Corrected cavity dimension (mould dimension to achieve target part dimension)
 * D_mould = D_part / (1 - S/100)
 */
export const cavityDimension = (partDimension, shrinkagePct) =>
  partDimension / (1 - shrinkagePct / 100);

/**
 * Flow direction vs cross-flow shrinkage
 * Typically flow shrinkage is 10-30% lower than cross-flow for semi-crystalline
 */
export const flowShrinkage = (linearShrinkPct, isSemiCrystalline = true) =>
  isSemiCrystalline ? linearShrinkPct * 0.85 : linearShrinkPct * 0.95;

export const crossFlowShrinkage = (linearShrinkPct, isSemiCrystalline = true) =>
  isSemiCrystalline ? linearShrinkPct * 1.15 : linearShrinkPct * 1.05;

/** Check if material is semi-crystalline */
export const isSemiCrystalline = (material) => {
  const semiCryst = ['PP (Polypropylene)', 'PA6 (Nylon 6)', 'POM (Acetal)', 'HDPE', 'PEEK', 'PBT'];
  return semiCryst.includes(material);
};


// ============================================
// 5. RUNNER & GATE SIZING
// ============================================

/**
 * Runner diameter recommendation
 * Based on part weight and flow length
 * D_runner ≈ (W^0.5 × L^0.25) / K
 * @param {number} partWeightG - Part weight per cavity (g)
 * @param {number} runnerLengthMM - Runner length (mm)
 * @returns {number} Recommended runner diameter (mm)
 */
export const runnerDiameter = (partWeightG, runnerLengthMM) => {
  if (partWeightG <= 0 || runnerLengthMM <= 0) return 4;
  const d = Math.pow(partWeightG, 0.5) * Math.pow(runnerLengthMM, 0.25) / 3.5;
  return Math.max(3, Math.min(16, Math.round(d * 2) / 2)); // round to nearest 0.5mm, clamp 3-16mm
};

/**
 * Runner cross-sectional area by type
 */
export const runnerArea = (diameter, type = 'full-round') => {
  switch (type) {
    case 'full-round': return Math.PI * (diameter / 2) ** 2;
    case 'half-round': return Math.PI * (diameter / 2) ** 2 / 2;
    case 'trapezoidal': return 0.75 * diameter * diameter; // approximation
    default: return Math.PI * (diameter / 2) ** 2;
  }
};

/**
 * Runner volume
 */
export const runnerVolume = (areaMM2, lengthMM) => areaMM2 * lengthMM; // mm³

/**
 * Gate thickness recommendation
 * Typically 50-80% of wall thickness
 */
export const gateThickness = (wallThickness, factor = 0.6) =>
  Math.max(0.5, wallThickness * factor);

/**
 * Gate width recommendation based on part weight
 */
export const gateWidth = (partWeightG, wallThickness) => {
  const w = Math.sqrt(partWeightG) * 0.8;
  return Math.max(1, Math.min(wallThickness * 3, w));
};

/**
 * Gate land length (typically 0.5-1.0mm)
 */
export const gateLandLength = (gateThicknessMM) =>
  Math.max(0.5, Math.min(1.5, gateThicknessMM * 0.8));

/**
 * Gate area
 */
export const gateArea = (width, thickness) => width * thickness;

/**
 * Gate freeze-off time estimate
 * t_freeze ≈ (gate_thickness² / (π² × α))
 */
export const gateFreezeTime = (gateThicknessMM, thermalDiffusivity) => {
  if (thermalDiffusivity <= 0) return 0;
  return (gateThicknessMM ** 2) / (Math.PI * Math.PI * thermalDiffusivity);
};

/**
 * Regrind percentage
 * regrind % = runner_volume / (runner_volume + total_part_volume) × 100
 */
export const regrindPercentage = (runnerVolMM3, partVolMM3perCavity, numCavities) => {
  const totalPart = partVolMM3perCavity * numCavities;
  const total = runnerVolMM3 + totalPart;
  return total > 0 ? (runnerVolMM3 / total) * 100 : 0;
};

/** Estimate part volume from weight and density */
export const partVolume = (weightG, densityGcm3) =>
  densityGcm3 > 0 ? (weightG / densityGcm3) * 1000 : 0; // mm³

/**
 * Gate type descriptions for UI
 */
export const gateTypes = [
  { id: 'edge', label: 'Edge Gate', desc: 'Most common, easy to trim' },
  { id: 'submarine', label: 'Submarine Gate', desc: 'Auto-degating, below parting line' },
  { id: 'pin-point', label: 'Pin-Point Gate', desc: 'Small mark, 3-plate mould' },
  { id: 'fan', label: 'Fan Gate', desc: 'Wide flow front, flat parts' },
  { id: 'tab', label: 'Tab Gate', desc: 'Reduces jetting, thick parts' },
];

export const runnerTypes = [
  { id: 'full-round', label: 'Full Round', desc: 'Best flow, highest cost' },
  { id: 'half-round', label: 'Half Round', desc: 'One-plate, moderate flow' },
  { id: 'trapezoidal', label: 'Trapezoidal', desc: 'Good flow, easy to machine' },
];
