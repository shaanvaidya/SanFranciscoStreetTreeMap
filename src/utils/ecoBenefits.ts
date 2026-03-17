/**
 * Ecological benefit estimates for SF street trees.
 *
 * Methodology: USDA Forest Service i-Tree approach, calibrated for San Francisco.
 * Canopy area estimated from DBH via allometric equation (Peper et al. 2001,
 * USDA PSW-GTR-174, western US street trees).
 *
 * Climate inputs:
 *   - Annual rainfall: 23.65 in/yr (NOAA 1991–2020 normals for SF)
 *   - Electricity: $0.25/kWh (PG&E residential average)
 *   - Water: $0.014/gallon (SFPUC 2024 rates)
 *   - Air pollutant damage cost: $7.20/lb (EPA social cost estimate)
 */

export interface EcoBenefits {
  stormwaterGal: number
  stormwaterValue: number
  energyKwh: number
  energyValue: number
  airLbs: number
  airValue: number
  totalValue: number
}

/** Canopy area (sq ft) estimated from DBH (inches). */
function canopyAreaSqFt(dbh: number): number {
  // canopy diameter (ft) from Peper et al. 2001 for western US street trees
  const canopyDiamFt = 1.1 * Math.pow(Math.max(1, dbh), 0.85)
  return Math.PI * Math.pow(canopyDiamFt / 2, 2)
}

export function calculateEcoBenefits(dbh: number | null): EcoBenefits | null {
  if (!dbh || dbh <= 0) return null

  const area = canopyAreaSqFt(dbh)

  // Stormwater: canopy intercepts ~17% of rainfall landing on it
  const stormwaterGal = area * (23.65 / 12) * 7.481 * 0.17
  const stormwaterValue = stormwaterGal * 0.014

  // Energy: shade (summer cooling) + windbreak (winter heating)
  // ~0.80 kWh/sqft/yr from McPherson et al. 2005 for Pacific Coast cities
  const energyKwh = area * 0.80
  const energyValue = energyKwh * 0.25

  // Air quality: O₃, NO₂, PM₂.₅, SO₂ absorbed by leaf surface
  // ~0.00045 lbs/sqft/yr (USDA, CA urban tree average)
  const airLbs = area * 0.00045
  const airValue = airLbs * 7.20

  const totalValue = stormwaterValue + energyValue + airValue

  return { stormwaterGal, stormwaterValue, energyKwh, energyValue, airLbs, airValue, totalValue }
}
