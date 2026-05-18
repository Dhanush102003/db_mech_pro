// ============================================
// CAE FORMULAS — FEA, NVH, CFD
// ============================================

// --- Von Mises Stress ---
export const vonMisesStress = (sx, sy, txy) =>
  Math.sqrt(sx*sx + sy*sy - sx*sy + 3*txy*txy);

export const principalStresses = (sx, sy, txy) => {
  const avg = (sx + sy) / 2;
  const R = Math.sqrt(Math.pow((sx - sy) / 2, 2) + txy * txy);
  return { s1: avg + R, s2: avg - R, tmax: R, angle: 0.5 * Math.atan2(2 * txy, sx - sy) * 180 / Math.PI };
};

// --- Beam Deflection ---
export const beamDeflection = {
  simplySupportedCenter: (P, L, E, I) => (P * Math.pow(L, 3)) / (48 * E * I),
  cantileverEnd: (P, L, E, I) => (P * Math.pow(L, 3)) / (3 * E * I),
  simplySupportedUDL: (w, L, E, I) => (5 * w * Math.pow(L, 4)) / (384 * E * I),
  cantileverUDL: (w, L, E, I) => (w * Math.pow(L, 4)) / (8 * E * I),
};

export const bendingMoment = {
  simplySupportedCenter: (P, L) => (P * L) / 4,
  cantileverEnd: (P, L) => P * L,
  simplySupportedUDL: (w, L) => (w * L * L) / 8,
  cantileverUDL: (w, L) => (w * L * L) / 2,
};

export const bendingStress = (M, y, I) => I > 0 ? (M * y) / I : 0;
export const momentOfInertiaRect = (b, h) => (b * Math.pow(h, 3)) / 12;
export const momentOfInertiaCircle = (d) => (Math.PI * Math.pow(d, 4)) / 64;

// --- NVH / Vibration ---
export const naturalFrequency = (k, m) => m > 0 ? (1 / (2 * Math.PI)) * Math.sqrt(k / m) : 0;
export const dampedFrequency = (fn, zeta) => fn * Math.sqrt(1 - zeta * zeta);
export const criticalDamping = (k, m) => 2 * Math.sqrt(k * m);
export const dampingRatio = (c, cc) => cc > 0 ? c / cc : 0;

export const transmissibility = (r, zeta) => {
  const num = Math.sqrt(1 + Math.pow(2 * zeta * r, 2));
  const den = Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(2 * zeta * r, 2));
  return den > 0 ? num / den : 0;
};

export const springMassPosition = (A, fn, zeta, t) => {
  const wd = 2 * Math.PI * dampedFrequency(fn, zeta);
  return A * Math.exp(-zeta * 2 * Math.PI * fn * t) * Math.cos(wd * t);
};

// --- CFD / Reynolds ---
export const reynoldsNumber = (rho, v, D, mu) => mu > 0 ? (rho * v * D) / mu : 0;
export const reynoldsKinematic = (v, D, nu) => nu > 0 ? (v * D) / nu : 0;
export const flowRegime = (re) => re < 2300 ? 'Laminar' : re < 4000 ? 'Transitional' : 'Turbulent';

// --- Heat Transfer ---
export const conduction = (k, A, dT, L) => L > 0 ? (k * A * dT) / L : 0;
export const convection = (h, A, dT) => h * A * dT;
export const radiation = (eps, A, Ts, Tsurr) => {
  const sigma = 5.67e-8;
  return eps * sigma * A * (Math.pow(Ts, 4) - Math.pow(Tsurr, 4));
};
export const thermalResistanceConduction = (L, k, A) => k * A > 0 ? L / (k * A) : 0;
export const thermalResistanceConvection = (h, A) => h * A > 0 ? 1 / (h * A) : 0;

// Material properties for beams
export const beamMaterials = {
  'Steel': { E: 200, color: '#64748b' },
  'Aluminium': { E: 69, color: '#94a3b8' },
  'Copper': { E: 117, color: '#f59e0b' },
  'Titanium': { E: 116, color: '#8b5cf6' },
  'Cast Iron': { E: 170, color: '#475569' },
};

// Fluid properties
export const fluidProperties = {
  'Water (20°C)': { rho: 998, mu: 0.001002, nu: 1.004e-6 },
  'Air (20°C)': { rho: 1.204, mu: 1.825e-5, nu: 1.516e-5 },
  'Engine Oil (40°C)': { rho: 870, mu: 0.0319, nu: 3.667e-5 },
  'Hydraulic Oil VG46': { rho: 870, mu: 0.04002, nu: 4.6e-5 },
};
