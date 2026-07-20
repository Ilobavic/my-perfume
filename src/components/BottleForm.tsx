import { useState, type FormEvent } from 'react'
import type {
  Mood,
  Occasion,
  Perfume,
  Season,
  Sillage,
  TimeOfDay,
  Weather,
} from '../types'
import { slugify } from '../lib/storage'

const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter', 'any']
const WEATHERS: Weather[] = ['hot', 'humid', 'cool', 'cold', 'any']
const TIMES: TimeOfDay[] = ['day', 'evening']
const OCCASIONS: Occasion[] = [
  'casual',
  'date',
  'formal',
  'statement',
  'work',
  'semi-formal',
  'playful',
]
const MOODS: Mood[] = ['confident', 'sexy', 'cozy', 'sharp', 'fresh', 'playful']
const SILLAGES: Sillage[] = ['light', 'moderate', 'heavy', 'strong']

function parseList(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function emptyForm(): Omit<Perfume, 'id' | 'wearCount' | 'lastWorn' | 'rating'> & {
  id?: string
  topNotes: string
  heartNotes: string
  baseNotes: string
} {
  return {
    name: '',
    house: '',
    concentration: 'EDP',
    bottleSizeMl: 100,
    mlRemaining: 100,
    family: '',
    notes: { top: [], heart: [], base: [] },
    topNotes: '',
    heartNotes: '',
    baseNotes: '',
    sillage: 'moderate',
    longevityHours: 8,
    sweetness: 3,
    season: ['fall'],
    weather: ['cool'],
    timeOfDay: ['evening'],
    occasion: ['casual'],
    mood: ['confident'],
    notesText: '',
  }
}

function fromBottle(b: Perfume) {
  return {
    ...b,
    topNotes: b.notes.top.join(', '),
    heartNotes: b.notes.heart.join(', '),
    baseNotes: b.notes.base.join(', '),
  }
}

interface BottleFormProps {
  initial?: Perfume
  existingIds: string[]
  onSave: (bottle: Perfume) => void
  onCancel: () => void
}

function toggleIn<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value]
}

export function BottleForm({ initial, existingIds, onSave, onCancel }: BottleFormProps) {
  const [form, setForm] = useState(() =>
    initial ? fromBottle(initial) : emptyForm(),
  )
  const editing = Boolean(initial)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return

    let id = initial?.id ?? slugify(form.name)
    if (!editing) {
      let base = id || 'perfume'
      let n = 2
      while (existingIds.includes(id)) {
        id = `${base}-${n}`
        n += 1
      }
    }

    const bottle: Perfume = {
      id,
      name: form.name.trim(),
      house: form.house.trim() || 'Unknown',
      concentration: form.concentration.trim() || 'EDP',
      bottleSizeMl: form.bottleSizeMl,
      mlRemaining: form.mlRemaining,
      family: form.family.trim() || 'Uncategorized',
      notes: {
        top: parseList(form.topNotes),
        heart: parseList(form.heartNotes),
        base: parseList(form.baseNotes),
      },
      sillage: form.sillage,
      longevityHours: form.longevityHours,
      sweetness: form.sweetness,
      season: form.season.length ? form.season : (['any'] as Season[]),
      weather: form.weather.length ? form.weather : (['any'] as Weather[]),
      timeOfDay: form.timeOfDay.length ? form.timeOfDay : (['day'] as TimeOfDay[]),
      occasion: form.occasion.length ? form.occasion : (['casual'] as Occasion[]),
      mood: form.mood.length ? form.mood : (['confident'] as Mood[]),
      lastWorn: initial?.lastWorn ?? null,
      wearCount: initial?.wearCount ?? 0,
      rating: initial?.rating ?? null,
      notesText: form.notesText.trim(),
    }

    onSave(bottle)
  }

  return (
    <section className="form-view">
      <header className="section-header">
        <div>
          <p className="eyebrow">{editing ? 'Edit' : 'New'}</p>
          <h1 className="display">{editing ? 'Edit bottle' : 'Add bottle'}</h1>
        </div>
      </header>

      <form className="bottle-form" onSubmit={submit}>
        <div className="form-grid">
          <label>
            Name *
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            House
            <input
              value={form.house}
              onChange={(e) => setForm({ ...form, house: e.target.value })}
            />
          </label>
          <label>
            Family
            <input
              value={form.family}
              onChange={(e) => setForm({ ...form, family: e.target.value })}
            />
          </label>
          <label>
            Concentration
            <input
              value={form.concentration}
              onChange={(e) => setForm({ ...form, concentration: e.target.value })}
            />
          </label>
          <label>
            Bottle size (ml)
            <input
              type="number"
              min={0}
              value={form.bottleSizeMl ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  bottleSizeMl: e.target.value === '' ? null : Number(e.target.value),
                })
              }
            />
          </label>
          <label>
            Remaining (ml)
            <input
              type="number"
              min={0}
              value={form.mlRemaining ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  mlRemaining: e.target.value === '' ? null : Number(e.target.value),
                })
              }
            />
          </label>
          <label>
            Sillage
            <select
              value={form.sillage}
              onChange={(e) =>
                setForm({ ...form, sillage: e.target.value as Sillage })
              }
            >
              {SILLAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            Longevity (hours)
            <input
              type="number"
              min={0}
              value={form.longevityHours ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  longevityHours: e.target.value === '' ? null : Number(e.target.value),
                })
              }
            />
          </label>
          <label>
            Sweetness (1–5)
            <input
              type="number"
              min={1}
              max={5}
              value={form.sweetness}
              onChange={(e) => setForm({ ...form, sweetness: Number(e.target.value) })}
            />
          </label>
        </div>

        <label className="full">
          Top notes (comma-separated)
          <input
            value={form.topNotes}
            onChange={(e) => setForm({ ...form, topNotes: e.target.value })}
          />
        </label>
        <label className="full">
          Heart notes
          <input
            value={form.heartNotes}
            onChange={(e) => setForm({ ...form, heartNotes: e.target.value })}
          />
        </label>
        <label className="full">
          Base notes
          <input
            value={form.baseNotes}
            onChange={(e) => setForm({ ...form, baseNotes: e.target.value })}
          />
        </label>
        <label className="full">
          Personal notes
          <textarea
            rows={3}
            value={form.notesText}
            onChange={(e) => setForm({ ...form, notesText: e.target.value })}
          />
        </label>

        <fieldset className="chip-group">
          <legend>Season</legend>
          <div className="chips">
            {SEASONS.map((s) => (
              <button
                key={s}
                type="button"
                className={`chip ${form.season.includes(s) ? 'active' : ''}`}
                onClick={() => setForm({ ...form, season: toggleIn(form.season, s) })}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="chip-group">
          <legend>Weather</legend>
          <div className="chips">
            {WEATHERS.map((w) => (
              <button
                key={w}
                type="button"
                className={`chip ${form.weather.includes(w) ? 'active' : ''}`}
                onClick={() => setForm({ ...form, weather: toggleIn(form.weather, w) })}
              >
                {w}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="chip-group">
          <legend>Time of day</legend>
          <div className="chips">
            {TIMES.map((t) => (
              <button
                key={t}
                type="button"
                className={`chip ${form.timeOfDay.includes(t) ? 'active' : ''}`}
                onClick={() =>
                  setForm({ ...form, timeOfDay: toggleIn(form.timeOfDay, t) })
                }
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="chip-group">
          <legend>Occasion</legend>
          <div className="chips">
            {OCCASIONS.map((o) => (
              <button
                key={o}
                type="button"
                className={`chip ${form.occasion.includes(o) ? 'active' : ''}`}
                onClick={() =>
                  setForm({ ...form, occasion: toggleIn(form.occasion, o) })
                }
              >
                {o}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="chip-group">
          <legend>Mood</legend>
          <div className="chips">
            {MOODS.map((m) => (
              <button
                key={m}
                type="button"
                className={`chip ${form.mood.includes(m) ? 'active' : ''}`}
                onClick={() => setForm({ ...form, mood: toggleIn(form.mood, m) })}
              >
                {m}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn primary">
            {editing ? 'Save changes' : 'Add bottle'}
          </button>
        </div>
      </form>
    </section>
  )
}
