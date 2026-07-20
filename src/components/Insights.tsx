import { useMemo } from 'react'
import type { Perfume } from '../types'
import { daysSince } from '../lib/storage'

interface InsightsProps {
  bottles: Perfume[]
  onOpen: (id: string) => void
}

export function Insights({ bottles, onOpen }: InsightsProps) {
  const stats = useMemo(() => {
    const withWear = [...bottles].sort((a, b) => b.wearCount - a.wearCount)
    const mostWorn = withWear.filter((b) => b.wearCount > 0).slice(0, 3)
    const leastWorn = [...bottles]
      .sort((a, b) => a.wearCount - b.wearCount || a.name.localeCompare(b.name))
      .slice(0, 3)

    const neglected = bottles
      .map((b) => ({ bottle: b, days: daysSince(b.lastWorn) }))
      .filter((x) => x.days === null || x.days >= 14)
      .sort((a, b) => {
        if (a.days === null && b.days === null) return a.bottle.name.localeCompare(b.bottle.name)
        if (a.days === null) return -1
        if (b.days === null) return 1
        return b.days - a.days
      })

    const lowMl = bottles.filter(
      (b) =>
        b.mlRemaining != null &&
        b.bottleSizeMl != null &&
        b.bottleSizeMl > 0 &&
        b.mlRemaining / b.bottleSizeMl <= 0.25,
    )

    const neverWorn = bottles.filter((b) => b.wearCount === 0)
    const totalWears = bottles.reduce((sum, b) => sum + b.wearCount, 0)

    return { mostWorn, leastWorn, neglected, lowMl, neverWorn, totalWears }
  }, [bottles])

  return (
    <section className="insights">
      <header className="section-header">
        <div>
          <p className="eyebrow">Rotation</p>
          <h1 className="display">Insights</h1>
          <p className="lede">
            {stats.totalWears} total wears · {stats.neverWorn.length} never worn
          </p>
        </div>
      </header>

      <div className="insight-grid">
        <article className="insight-block">
          <h2>Most worn</h2>
          {stats.mostWorn.length === 0 ? (
            <p className="empty-sm">No wears logged yet.</p>
          ) : (
            <ul>
              {stats.mostWorn.map((b) => (
                <li key={b.id}>
                  <button type="button" onClick={() => onOpen(b.id)}>
                    {b.name}
                  </button>
                  <span>{b.wearCount}×</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="insight-block">
          <h2>Least worn</h2>
          <ul>
            {stats.leastWorn.map((b) => (
              <li key={b.id}>
                <button type="button" onClick={() => onOpen(b.id)}>
                  {b.name}
                </button>
                <span>{b.wearCount}×</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="insight-block">
          <h2>Needs rotation</h2>
          <p className="hint">Never worn or 14+ days idle</p>
          {stats.neglected.length === 0 ? (
            <p className="empty-sm">Rotation looks balanced.</p>
          ) : (
            <ul>
              {stats.neglected.map(({ bottle, days }) => (
                <li key={bottle.id}>
                  <button type="button" onClick={() => onOpen(bottle.id)}>
                    {bottle.name}
                  </button>
                  <span>{days === null ? 'never' : `${days}d`}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="insight-block">
          <h2>Depletion watch</h2>
          <p className="hint">≤25% remaining</p>
          {stats.lowMl.length === 0 ? (
            <p className="empty-sm">No bottles running low.</p>
          ) : (
            <ul>
              {stats.lowMl.map((b) => (
                <li key={b.id}>
                  <button type="button" onClick={() => onOpen(b.id)}>
                    {b.name}
                  </button>
                  <span>
                    {b.mlRemaining}/{b.bottleSizeMl} ml
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  )
}
