import seed from '../data/perfumes.json'
import type { Perfume } from '../types'

const STORAGE_KEY = 'perfume-catalog'

export function getSeedCatalog(): Perfume[] {
  return structuredClone(seed as Perfume[])
}

export function loadCatalog(): Perfume[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seeded = getSeedCatalog()
      saveCatalog(seeded)
      return seeded
    }
    return JSON.parse(raw) as Perfume[]
  } catch {
    const seeded = getSeedCatalog()
    saveCatalog(seeded)
    return seeded
  }
}

export function saveCatalog(bottles: Perfume[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bottles))
}

export function resetCatalog(): Perfume[] {
  const seeded = getSeedCatalog()
  saveCatalog(seeded)
  return seeded
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null
  const then = new Date(dateStr + 'T12:00:00')
  const now = new Date()
  const diff = now.getTime() - then.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}
