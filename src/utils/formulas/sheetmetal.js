// ============================================
// SHEET METAL FORMULAS
// ============================================

export const bendAllowance = (angleDeg, radiusMM, thicknessMM, kFactor) =>
  (Math.PI / 180) * angleDeg * (radiusMM + kFactor * thicknessMM);

export const bendDeduction = (angleDeg, radiusMM, thicknessMM, kFactor) => {
  const ba = bendAllowance(angleDeg, radiusMM, thicknessMM, kFactor);
  const ossb = (radiusMM + thicknessMM) * Math.tan(angleDeg * Math.PI / 360);
  return 2 * ossb - ba;
};

export const outsideSetback = (angleDeg, radiusMM, thicknessMM) =>
  (radiusMM + thicknessMM) * Math.tan((angleDeg * Math.PI) / 360);

export const flatPatternLength = (leg1, leg2, angleDeg, radiusMM, thicknessMM, kFactor) =>
  leg1 + leg2 + bendAllowance(angleDeg, radiusMM, thicknessMM, kFactor);

export const kFactorFromMaterial = (material) => ({
  'Soft Copper': 0.35, 'Soft Brass': 0.35, 'Aluminium (soft)': 0.33,
  'Aluminium (hard)': 0.38, 'Mild Steel': 0.41, 'Stainless Steel': 0.45,
  'Spring Steel': 0.50, 'Titanium': 0.42,
}[material] || 0.41);

export const materials = [
  'Soft Copper','Soft Brass','Aluminium (soft)','Aluminium (hard)',
  'Mild Steel','Stainless Steel','Spring Steel','Titanium',
];

export const cylindricalBlankDiameter = (d, h) => Math.sqrt(d*d + 4*d*h);
export const drawRatio = (blankD, punchD) => punchD > 0 ? blankD / punchD : 0;

export const bendingForce = (t, l, uts, v, method='air') => {
  const C = method === 'air' ? 1.33 : 1.0;
  return v > 0 ? (C * t * t * l * uts) / (v * 1000) : 0;
};
export const recommendedDieOpening = (t) => 8 * t;
export const forceToTons = (kN) => kN / 9.80665;

export const utsValues = {
  'Soft Copper':220,'Soft Brass':350,'Aluminium (soft)':110,
  'Aluminium (hard)':310,'Mild Steel':400,'Stainless Steel':520,
  'Spring Steel':800,'Titanium':550,
};

export const springbackFactor = (sy, r, t, E) => {
  if (E <= 0 || t <= 0) return 0;
  return 1 - (3*sy*r)/(E*t) + 4*Math.pow(sy/E,3)*Math.pow(r/t,3);
};
export const correctedBendAngle = (angle, ks) => ks > 0 ? angle / ks : angle;
export const springbackAngle = (angle, ks) => correctedBendAngle(angle, ks) - angle;

export const elasticModulusValues = {
  'Soft Copper':117,'Soft Brass':100,'Aluminium (soft)':69,
  'Aluminium (hard)':69,'Mild Steel':200,'Stainless Steel':193,
  'Spring Steel':210,'Titanium':116,
};
export const yieldStrengthValues = {
  'Soft Copper':70,'Soft Brass':150,'Aluminium (soft)':35,
  'Aluminium (hard)':240,'Mild Steel':250,'Stainless Steel':215,
  'Spring Steel':600,'Titanium':380,
};
