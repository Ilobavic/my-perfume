import { useState } from 'react'
import type { Mood, Occasion, Perfume, ScoredPerfume, Weather } from '../types'
import { recommend } from '../lib/recommend'

const WEATHERS: { value: Weather; label: string }[] = [
  { value: 'hot', label: 'Hot' },
  { value: 'humid', label: 'Humid' },
  { value: 'cool', label: 'Cool' },
  { value: 'cold', label: 'Cold' },
]

const OCCASIONS: { value: Occasion; label: string }[] = [
  { value: 'casual', label: 'Casual' },
  { value: 'work', label: 'Work' },
  { value: 'date', label: 'Date' },
  { value: 'formal', label: 'Formal' },
  { value: 'semi-formal', label: 'Semi-formal' },
  { value: 'statement', label: 'Statement' },
  { value: 'playful', label: 'Playful' },
]

const MOODS: { value: Mood; label: string }[] = [
  { value: 'confident', label: 'Confident' },
  { value: 'cozy', label: 'Cozy' },
  { value: 'sexy', label: 'Sexy' },
  { value: 'fresh', label: 'Fresh' },
  { value: 'sharp', label: 'Sharp' },
  { value: 'playful', label: 'Playful' },
]

interface TodayPickProps {
  bottles: Perfume[]
  onOpen: (id: string) => void
  onMarkWorn: (id: string) => void
}

export function TodayPick({ bottles, onOpen, onMarkWorn }: TodayPickProps) {
  const [weather, setWeather] = useState<Weather | null>(null)
  const [occasion, setOccasion] = useState<Occasion | null>(null)
  const [mood, setMood] = useState<Mood | null>(null)
  const [picks, setPicks] = useState<ScoredPerfume[] | null>(null)
  const [searched, setSearched] = useState(false)

  const ready = weather && occasion && mood

  function runRecommend() {
    if (!weather || !occasion || !mood) return
    setPicks(recommend(bottles, { weather, occasion, mood }))
    setSearched(true)
  }

  return (
    <section className="today">
      <header className="today-header">
        <p className="eyebrow">Daily pick</p>
        <h1 className="display">What should I wear?</h1>
        <p className="lede">
          Three taps — weather, occasion, mood — then your top bottles, ranked with reasons.
        </p>
      </header>

      <div className="pick-inputs">
        <fieldset className="chip-group">
          <legend>Weather</legend>
          <div className="chips">
            {WEATHERS.map((w) => (
              <button
                key={w.value}
                type="button"
                className={`chip ${weather === w.value ? 'active' : ''}`}
                onClick={() => {
                  setWeather(w.value)
                  setSearched(false)
                }}
              >
                {w.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="chip-group">
          <legend>Occasion</legend>
          <div className="chips">
            {OCCASIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`chip ${occasion === o.value ? 'active' : ''}`}
                onClick={() => {
                  setOccasion(o.value)
                  setSearched(false)
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="chip-group">
          <legend>Mood</legend>
          <div className="chips">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                className={`chip ${mood === m.value ? 'active' : ''}`}
                onClick={() => {
                  setMood(m.value)
                  setSearched(false)
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          className="btn primary"
          disabled={!ready}
          onClick={runRecommend}
        >
          Find my scent
        </button>
      </div>

      {searched && picks && (
        <div className="picks" aria-live="polite">
          {picks.length === 0 ? (
            <p className="empty">
              Nothing matches those filters. Try a different occasion or weather.
            </p>
          ) : (
            picks.map((p, i) => (
              <article
                key={p.id}
                className="pick-card"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="pick-rank">#{i + 1}</div>
                <div className="pick-body">
                  <button type="button" className="pick-title" onClick={() => onOpen(p.id)}>
                    <span className="house">{p.house}</span>
                    <span className="name">{p.name}</span>
                  </button>
                  <p className="family">{p.family}</p>
                  <ul className="reasons">
                    {p.reasons.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                  <div className="pick-actions">
                    <button type="button" className="btn ghost" onClick={() => onOpen(p.id)}>
                      Details
                    </button>
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => onMarkWorn(p.id)}
                    >
                      Mark worn
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </section>
  )
}
