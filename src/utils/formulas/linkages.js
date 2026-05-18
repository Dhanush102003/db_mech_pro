// ============================================
// LINKAGE & MECHANISM FORMULAS
// Verified against FNR_Mechanism_Calculator.xlsx
// ============================================

/** Disc radius from diameter */
export const discRadius = (diameter) => diameter / 2;

/** Arc length = linear motion (for small angles) */
export const arcLength = (linearMotion) => linearMotion;

/** Rotation angle in radians = arcLength / radius */
export const rotationAngleRad = (arcLen, radius) => {
  if (radius <= 0) return 0;
  return arcLen / radius;
};

/** Radians to degrees */
export const radToDeg = (rad) => rad * (180 / Math.PI);

/** Degrees to radians */
export const degToRad = (deg) => deg * (Math.PI / 180);

/** Rotation angle from linear motion and connection radius */
export const rotationAngleDeg = (linearMotion, connectionRadius) => {
  if (connectionRadius <= 0) return 0;
  const arcLen = arcLength(linearMotion);
  const rad = rotationAngleRad(arcLen, connectionRadius);
  return radToDeg(rad);
};

/** Required radius for desired angle: r = L × 180 / (θ° × π) */
export const requiredRadius = (linearMotion, desiredAngleDeg) => {
  if (desiredAngleDeg <= 0) return 0;
  return (linearMotion * 180) / (desiredAngleDeg * Math.PI);
};

/** Error percentage between actual and target angle */
export const angleError = (actual, target) => {
  if (target === 0) return 0;
  return Math.abs(actual - target) / target * 100;
};

/** Cable required strength = Force × Safety Factor */
export const cableRequiredStrength = (force, safetyFactor) => force * safetyFactor;

/** Cable status check */
export const cableStatus = (breakingStrength, requiredStrength) => {
  if (breakingStrength >= requiredStrength) return { text: '✓ OK', cls: 'status-ok' };
  return { text: '✗ INSUFFICIENT', cls: 'status-fail' };
};

/** Cable types reference data */
export const cableTypes = [
  { name: 'Steel Wire 1.5mm', diameter: 1.5, breaking: 1500, yield: 1200 },
  { name: 'Steel Wire 2.0mm', diameter: 2.0, breaking: 2800, yield: 2240 },
  { name: 'Steel Wire 2.5mm', diameter: 2.5, breaking: 4500, yield: 3600 },
  { name: 'Bowden Cable 1.5mm', diameter: 1.5, breaking: 1200, yield: 960 },
  { name: 'Bowden Cable 2.0mm', diameter: 2.0, breaking: 2400, yield: 1920 },
  { name: 'Stainless Steel 1.5mm', diameter: 1.5, breaking: 1800, yield: 1440 },
  { name: 'Stainless Steel 2.0mm', diameter: 2.0, breaking: 3200, yield: 2560 },
];

// ============================================
// 4-BAR LINKAGE
// ============================================

/** 4-bar linkage position analysis using Freudenstein equation */
export const fourBarAnalysis = (a, b, c, d, theta2Deg) => {
  const theta2 = degToRad(theta2Deg);
  // Freudenstein constants
  const K1 = d / a;
  const K2 = d / c;
  const K3 = (a * a - b * b + c * c + d * d) / (2 * a * c);

  const A = Math.cos(theta2) - K1 - K2 * Math.cos(theta2) + K3;
  const B = -2 * Math.sin(theta2);
  const C = K1 - (K2 + 1) * Math.cos(theta2) + K3;

  const disc = B * B - 4 * A * C;
  if (disc < 0) return null;

  const t1 = (-B + Math.sqrt(disc)) / (2 * A);
  const theta4_1 = 2 * Math.atan(t1);

  // Calculate theta3
  const Ex = a * Math.cos(theta2) + b - c * Math.cos(theta4_1) - d;
  const Ey = a * Math.sin(theta2) - c * Math.sin(theta4_1);
  const theta3 = Math.atan2(Ey, -Ex);

  return {
    theta4: radToDeg(theta4_1),
    theta3: radToDeg(theta3),
    // Coupler point
    Bx: a * Math.cos(theta2),
    By: a * Math.sin(theta2),
    Cx: d + c * Math.cos(theta4_1),
    Cy: c * Math.sin(theta4_1),
  };
};
