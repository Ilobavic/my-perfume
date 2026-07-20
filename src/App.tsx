import { useCallback, useEffect, useState } from 'react'
import type { Perfume, View } from './types'
import { loadCatalog, resetCatalog, saveCatalog, todayISO } from './lib/storage'
import { TodayPick } from './components/TodayPick'
import { Catalog } from './components/Catalog'
import { BottleDetail } from './components/BottleDetail'
import { BottleForm } from './components/BottleForm'
import { Insights } from './components/Insights'

export default function App() {
  const [bottles, setBottles] = useState<Perfume[]>(() => loadCatalog())
  const [view, setView] = useState<View>({ name: 'today' })
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(t)
  }, [toast])

  const persist = useCallback((next: Perfume[]) => {
    setBottles(next)
    saveCatalog(next)
  }, [])

  const markWorn = useCallback(
    (id: string) => {
      const bottle = bottles.find((b) => b.id === id)
      persist(
        bottles.map((b) =>
          b.id === id
            ? {
                ...b,
                lastWorn: todayISO(),
                wearCount: b.wearCount + 1,
                mlRemaining:
                  b.mlRemaining != null ? Math.max(0, b.mlRemaining - 0.5) : null,
              }
            : b,
        ),
      )
      setToast(bottle ? `Logged wear · ${bottle.name}` : 'Logged wear')
    },
    [bottles, persist],
  )

  const saveBottle = useCallback(
    (bottle: Perfume) => {
      const exists = bottles.some((b) => b.id === bottle.id)
      const next = exists
        ? bottles.map((b) => (b.id === bottle.id ? bottle : b))
        : [...bottles, bottle]
      persist(next)
      setView({ name: 'detail', id: bottle.id })
      setToast(exists ? 'Bottle updated' : 'Bottle added')
    },
    [bottles, persist],
  )

  const deleteBottle = useCallback(
    (id: string) => {
      persist(bottles.filter((b) => b.id !== id))
      setView({ name: 'catalog' })
      setToast('Bottle removed')
    },
    [bottles, persist],
  )

  const detailBottle =
    view.name === 'detail' ? bottles.find((b) => b.id === view.id) : undefined

  return (
    <div className="app-shell">
      <div className="atmosphere" aria-hidden="true" />
      <header className="topbar">
        <button type="button" className="brand" onClick={() => setView({ name: 'today' })}>
          <span className="brand-mark">Perfume Picker</span>
        </button>
        <nav className="nav" aria-label="Primary">
          <button
            type="button"
            className={view.name === 'today' ? 'active' : ''}
            onClick={() => setView({ name: 'today' })}
          >
            Today
          </button>
          <button
            type="button"
            className={view.name === 'catalog' || view.name === 'detail' ? 'active' : ''}
            onClick={() => setView({ name: 'catalog' })}
          >
            Catalog
          </button>
          <button
            type="button"
            className={view.name === 'insights' ? 'active' : ''}
            onClick={() => setView({ name: 'insights' })}
          >
            Insights
          </button>
          <button
            type="button"
            className={view.name === 'form' && !view.id ? 'active' : ''}
            onClick={() => setView({ name: 'form' })}
          >
            Add
          </button>
        </nav>
      </header>

      <main className="main">
        {view.name === 'today' && (
          <TodayPick
            bottles={bottles}
            onOpen={(id) => setView({ name: 'detail', id })}
            onMarkWorn={markWorn}
          />
        )}

        {view.name === 'catalog' && (
          <Catalog
            bottles={bottles}
            onOpen={(id) => setView({ name: 'detail', id })}
            onAdd={() => setView({ name: 'form' })}
            onReset={() => {
              persist(resetCatalog())
              setToast('Catalog reset to seed')
            }}
          />
        )}

        {view.name === 'detail' && detailBottle && (
          <BottleDetail
            bottle={detailBottle}
            onBack={() => setView({ name: 'catalog' })}
            onEdit={() => setView({ name: 'form', id: detailBottle.id })}
            onMarkWorn={() => markWorn(detailBottle.id)}
            onDelete={() => deleteBottle(detailBottle.id)}
          />
        )}

        {view.name === 'detail' && !detailBottle && (
          <p className="empty">That bottle isn’t in your catalog.</p>
        )}

        {view.name === 'form' && (
          <BottleForm
            initial={view.id ? bottles.find((b) => b.id === view.id) : undefined}
            existingIds={bottles.map((b) => b.id)}
            onSave={saveBottle}
            onCancel={() =>
              setView(view.id ? { name: 'detail', id: view.id } : { name: 'catalog' })
            }
          />
        )}

        {view.name === 'insights' && (
          <Insights
            bottles={bottles}
            onOpen={(id) => setView({ name: 'detail', id })}
          />
        )}
      </main>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}
