import { useMemo, useState } from 'react'
import type { Perfume, Season } from '../types'
import { daysSince } from '../lib/storage'

type SortKey = 'name' | 'sweetness' | 'lastWorn' | 'family'

function getBottlePalette(value: string) {
  const seed = value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const palettes = [
    ['#5f7a4c', '#d9c07f'],
    ['#6b4e3d', '#b97d4b'],
    ['#3b5b4a', '#8f6f43'],
    ['#5a3c6d', '#9271b5'],
    ['#2f4f69', '#8b9d96'],
    ['#8a423b', '#d4a373'],
  ]

  return palettes[seed % palettes.length]
}

interface CatalogProps {
  bottles: Perfume[]
  onOpen: (id: string) => void
  onAdd: () => void
  onReset: () => void
}

export function Catalog({ bottles, onOpen, onAdd, onReset }: CatalogProps) {
  const [family, setFamily] = useState('all')
  const [season, setSeason] = useState<Season | 'all'>('all')
  const [minSweet, setMinSweet] = useState(0)
  const [sort, setSort] = useState<SortKey>('name')

  const families = useMemo(
    () => [...new Set(bottles.map((b) => b.family))].sort(),
    [bottles],
  )

  const filtered = useMemo(() => {
    let list = bottles.filter((b) => {
      if (family !== 'all' && b.family !== family) return false
      if (season !== 'all' && !b.season.includes(season) && !b.season.includes('any')) {
        return false
      }
      if (b.sweetness < minSweet) return false
      return true
    })

    list = [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'family') return a.family.localeCompare(b.family) || a.name.localeCompare(b.name)
      if (sort === 'sweetness') return b.sweetness - a.sweetness
      // lastWorn: nulls first (never worn), then oldest
      const da = daysSince(a.lastWorn)
      const db = daysSince(b.lastWorn)
      if (da === null && db === null) return a.name.localeCompare(b.name)
      if (da === null) return -1
      if (db === null) return 1
      return db - da
    })

    return list
  }, [bottles, family, season, minSweet, sort])

  return (
    <section className="catalog">
      <header className="section-header">
        <div>
          <p className="eyebrow">Collection</p>
          <h1 className="display">Your bottles</h1>
          <p className="lede">{bottles.length} in rotation — filter by family, season, or sweetness.</p>
        </div>
        <button type="button" className="btn primary" onClick={onAdd}>
          Add bottle
        </button>
      </header>

      <div className="filters">
        <label>
          Family
          <select value={family} onChange={(e) => setFamily(e.target.value)}>
            <option value="all">All</option>
            {families.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label>
          Season
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value as Season | 'all')}
          >
            <option value="all">All</option>
            <option value="spring">Spring</option>
            <option value="summer">Summer</option>
            <option value="fall">Fall</option>
            <option value="winter">Winter</option>
          </select>
        </label>
        <label>
          Min sweetness
          <select
            value={minSweet}
            onChange={(e) => setMinSweet(Number(e.target.value))}
          >
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n === 0 ? 'Any' : `${n}+`}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="name">Name</option>
            <option value="family">Family</option>
            <option value="sweetness">Sweetness</option>
            <option value="lastWorn">Last worn</option>
          </select>
        </label>
      </div>

      <div className="catalog-grid">
        {filtered.map((b) => {
          const days = daysSince(b.lastWorn)
          const [accent, accentSoft] = getBottlePalette(b.name)
          return (
            <button
              key={b.id}
              type="button"
              className="catalog-card"
              onClick={() => onOpen(b.id)}
            >
              <div className="catalog-title-row">
                <div className="catalog-avatar" aria-hidden="true">
                  <svg viewBox="0 0 80 112" role="img" aria-label={`${b.name} bottle illustration`}>
                    <rect x="16" y="12" width="48" height="18" rx="8" fill={accent} />
                    <rect x="24" y="28" width="32" height="58" rx="10" fill={accentSoft} />
                    <rect x="18" y="84" width="44" height="16" rx="8" fill={accent} />
                    <rect x="30" y="6" width="20" height="10" rx="4" fill={accent} />
                    <path d="M29 46h22" stroke={accent} strokeWidth="3" strokeLinecap="round" />
                    <path d="M29 60h22" stroke={accent} strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="catalog-text-block">
                  <span className="house">{b.house}</span>
                  <span className="name">{b.name}</span>
                </div>
              </div>
              <span className="meta">
                {b.family} · sweetness {b.sweetness}
              </span>
              <span className="worn">
                {days === null
                  ? 'Never worn'
                  : days === 0
                    ? 'Worn today'
                    : `${days}d ago`}
              </span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="empty">No bottles match these filters.</p>
      )}

      <footer className="catalog-footer">
        <button
          type="button"
          className="btn ghost danger"
          onClick={() => {
            if (confirm('Reset catalog to original seed data? Wear history will be lost.')) {
              onReset()
            }
          }}
        >
          Reset to seed
        </button>
      </footer>
    </section>
  )
}
