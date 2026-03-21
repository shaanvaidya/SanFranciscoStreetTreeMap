import { TreeInfo } from '../types/tree'

export interface BirthdayResults {
  exactDate: TreeInfo[]
  sameDayAnyYear: TreeInfo[]
  withinWeek: TreeInfo[]
}

/**
 * Parse a plantDate string ("YYYY-MM-DD ...") into month (1-12) and day (1-31).
 */
function parsePlantDate(plantDate: string): { month: number; day: number; year: number } | null {
  const parts = plantDate.slice(0, 10).split('-')
  if (parts.length < 3) return null
  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10)
  const day = parseInt(parts[2], 10)
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null
  return { year, month, day }
}

/**
 * Calculate how many days apart two month/day pairs are, ignoring year.
 * Accounts for year wrap (e.g., Dec 30 is 3 days from Jan 2).
 */
function dayOfYear(month: number, day: number): number {
  // Use a non-leap year as reference
  return Math.floor((Date.UTC(2001, month - 1, day) - Date.UTC(2001, 0, 1)) / 86400000)
}

function dayDistance(m1: number, d1: number, m2: number, d2: number): number {
  const a = dayOfYear(m1, d1)
  const b = dayOfYear(m2, d2)
  const diff = Math.abs(a - b)
  return Math.min(diff, 365 - diff)
}

/**
 * Find birthday trees in three tiers:
 * 1. exactDate — planted on the exact same date (month, day, year)
 * 2. sameDayAnyYear — planted on the same month/day in any year
 * 3. withinWeek — planted within 7 calendar days of the actual birthday (year matters)
 */
export function findBirthdayTrees(
  allTrees: TreeInfo[],
  month: number,
  day: number,
  year: number
): BirthdayResults {
  const exactDate: TreeInfo[] = []
  const sameDayAnyYear: TreeInfo[] = []
  const withinWeek: TreeInfo[] = []

  const birthdayMs = Date.UTC(year, month - 1, day)
  const weekMs = 7 * 86400000

  for (const tree of allTrees) {
    if (!tree.plantDate) continue
    const parsed = parsePlantDate(tree.plantDate)
    if (!parsed) continue

    if (parsed.month === month && parsed.day === day) {
      if (parsed.year === year) {
        exactDate.push(tree)
      }
      sameDayAnyYear.push(tree)
    } else {
      // Within 7 days of the actual birthday date (year-specific)
      const plantMs = Date.UTC(parsed.year, parsed.month - 1, parsed.day)
      if (Math.abs(plantMs - birthdayMs) <= weekMs) {
        withinWeek.push(tree)
      }
    }
  }

  return { exactDate, sameDayAnyYear, withinWeek }
}

/**
 * Calculate signed day difference: positive = tree is younger, negative = tree is older.
 */
export function daysDifference(birthday: Date, plantDateStr: string): number {
  const plantDate = new Date(plantDateStr)
  const diffMs = plantDate.getTime() - birthday.getTime()
  return Math.round(diffMs / 86400000)
}

/**
 * Find the geographically nearest tree from a list, given a coordinate.
 */
export function findNearestTree(
  trees: TreeInfo[],
  lat: number,
  lng: number
): TreeInfo | null {
  if (trees.length === 0) return null

  let nearest = trees[0]
  let minDist = haversine(lat, lng, nearest.latitude, nearest.longitude)

  for (let i = 1; i < trees.length; i++) {
    const dist = haversine(lat, lng, trees[i].latitude, trees[i].longitude)
    if (dist < minDist) {
      minDist = dist
      nearest = trees[i]
    }
  }

  return nearest
}

/** Haversine distance in meters */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
