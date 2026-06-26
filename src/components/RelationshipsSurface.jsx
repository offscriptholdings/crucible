import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

function Temp({ value }) {
  const attn = value === 'tense' || value === 'drifting'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 600,
      letterSpacing: '0.04em', textTransform: 'uppercase',
      color: attn ? 'var(--accent)' : 'var(--ink-3)',
    }}>
      {value || '—'}
    </span>
  )
}

export default function RelationshipsSurface({ bp }) {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase.from('people').select('*').order('name')
      .then(({ data }) => { setPeople(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div data-testid="surface-people" style={{ color: 'var(--ink-3)', fontFamily: 'var(--sans)', fontSize: 14, padding: 16 }}>Loading…</div>
  )

  return (
    <div data-testid="surface-people">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 26, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>Relationships</h1>
        <div className="eyebrow" style={{ marginTop: 4 }}>The people · {people.length}</div>
      </div>
      {people.length === 0 ? (
        <p style={{ fontFamily: 'var(--sans)', color: 'var(--ink-3)', fontSize: 14 }}>No relationships yet.</p>
      ) : (
        <div className="cx-panel" style={{ padding: '4px 18px', maxWidth: bp === 'ipad' ? 760 : 640 }}>
          {people.map((r, i) => (
            <div key={r.id}>
              {i > 0 && <hr className="cx-div" />}
              <div style={{ padding: '14px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{r.name}</span>
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 11.5, color: 'var(--ink-4)' }}>{r.rel}</span>
                  <span style={{ marginLeft: 'auto' }}><Temp value={r.temp} /></span>
                </div>
                {r.note && <div style={{ fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>{r.note}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
