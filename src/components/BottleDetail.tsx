import type { Perfume } from '../types'
import { daysSince } from '../lib/storage'

interface BottleDetailProps {
  bottle: Perfume
  onBack: () => void
  onEdit: () => void
  onMarkWorn: () => void
  onDelete: () => void
}

function TagList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className="tag-block">
      <h3>{label}</h3>
      <div className="tags">
        {items.map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

export function BottleDetail({
  bottle,
  onBack,
  onEdit,
  onMarkWorn,
  onDelete,
}: BottleDetailProps) {
  const days = daysSince(bottle.lastWorn)
  const hasNotes =
    bottle.notes.top.length + bottle.notes.heart.length + bottle.notes.base.length > 0

  return (
    <section className="detail">
      <button type="button" className="btn ghost back" onClick={onBack}>
        ← Catalog
      </button>

      <header className="detail-header">
        <p className="house">{bottle.house}</p>
        <h1 className="display">{bottle.name}</h1>
        <p className="family">
          {bottle.family} · {bottle.concentration}
        </p>
      </header>

      <div className="detail-actions">
        <button type="button" className="btn primary" onClick={onMarkWorn}>
          Mark worn today
        </button>
        <button type="button" className="btn secondary" onClick={onEdit}>
          Edit
        </button>
        <button
          type="button"
          className="btn ghost danger"
          onClick={() => {
            if (confirm(`Delete ${bottle.name}?`)) onDelete()
          }}
        >
          Delete
        </button>
      </div>

      <div className="stat-row">
        <div className="stat">
          <span className="stat-label">Sillage</span>
          <span className="stat-value">{bottle.sillage}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Longevity</span>
          <span className="stat-value">
            {bottle.longevityHours != null ? `${bottle.longevityHours}h` : '—'}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Sweetness</span>
          <span className="stat-value">{bottle.sweetness}/5</span>
        </div>
        <div className="stat">
          <span className="stat-label">Remaining</span>
          <span className="stat-value">
            {bottle.mlRemaining != null
              ? `${bottle.mlRemaining}${bottle.bottleSizeMl != null ? ` / ${bottle.bottleSizeMl}` : ''} ml`
              : '—'}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Worn</span>
          <span className="stat-value">{bottle.wearCount}×</span>
        </div>
        <div className="stat">
          <span className="stat-label">Last worn</span>
          <span className="stat-value">
            {days === null
              ? 'Never'
              : days === 0
                ? 'Today'
                : `${bottle.lastWorn} (${days}d ago)`}
          </span>
        </div>
      </div>

      {bottle.notesText && <p className="notes-text">{bottle.notesText}</p>}

      {hasNotes && (
        <div className="pyramid">
          <h2>Notes</h2>
          <TagList label="Top" items={bottle.notes.top} />
          <TagList label="Heart" items={bottle.notes.heart} />
          <TagList label="Base" items={bottle.notes.base} />
        </div>
      )}

      <div className="tag-grid">
        <TagList label="Season" items={bottle.season} />
        <TagList label="Weather" items={bottle.weather} />
        <TagList label="Time of day" items={bottle.timeOfDay} />
        <TagList label="Occasion" items={bottle.occasion} />
        <TagList label="Mood" items={bottle.mood} />
      </div>
    </section>
  )
}
