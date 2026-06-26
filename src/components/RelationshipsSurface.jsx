import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

// key_dates is freeform jsonb (e.g. { birthday: "May 13", anniversary: "Sep 2" }).
// Flatten it to "label · value" strings, tolerant of nested objects / arrays.
function fmtKeyDates(kd) {
  if (!kd || typeof kd !== 'object') return []
  return Object.entries(kd).flatMap(([k, v]) => {
    if (v == null) return []
    if (Array.isArray(v)) return v.map(x => `${k} ${x}`)
    if (typeof v === 'object') return Object.entries(v).map(([kk, vv]) => `${kk} ${vv}`)
    return [`${k} ${v}`]
  })
}

function fmtWhen(ts) {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch { return '' }
}

export default function RelationshipsSurface({ bp }) {
  const [people, setPeople] = useState([])
  const [details, setDetails] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    Promise.all([
      supabase.from('cos_people').select('*').order('name'),
      supabase.from('cos_people_details').select('*').order('created_at', { ascending: false }),
    ]).then(([pRes, dRes]) => {
      setPeople(pRes.data || [])
      setDetails(dRes.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div data-testid="surface-people" style={{ color: 'var(--ink-3)', fontFamily: 'var(--sans)', fontSize: 14, padding: 16 }}>Loading…</div>
  )

  const byPerson = {}
  details.forEach(d => { (byPerson[d.person_id] = byPerson[d.person_id] || []).push(d) })

  return (
    <div data-testid="surface-people">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 26, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>Relationships</h1>
        <div className="eyebrow" style={{ marginTop: 4 }}>The people · {people.length}</div>
      </div>
      {people.length === 0 ? (
        <p style={{ fontFamily: 'var(--sans)', color: 'var(--ink-3)', fontSize: 14 }}>
          No people yet — Chief logs them here as you mention them.
        </p>
      ) : (
        <div className="cx-panel" style={{ padding: '4px 18px', maxWidth: bp === 'ipad' ? 760 : 640 }}>
          {people.map((r, i) => {
            const dates = fmtKeyDates(r.key_dates)
            const facts = byPerson[r.id] || []
            return (
              <div key={r.id}>
                {i > 0 && <hr className="cx-div" />}
                <div style={{ padding: '14px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: facts.length || dates.length ? 8 : 0 }}>
                    <span style={{ fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{r.name}</span>
                    {r.relationship && <span style={{ fontFamily: 'var(--sans)', fontSize: 11.5, color: 'var(--ink-4)' }}>{r.relationship}</span>}
                    {dates.map((d, j) => (
                      <span key={j} className="mono" style={{ marginLeft: j === 0 ? 'auto' : 0, fontSize: 11, color: 'var(--ink-3)', padding: '2px 8px', border: '1px solid var(--line)', borderRadius: 7 }}>{d}</span>
                    ))}
                  </div>
                  {facts.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {facts.map(f => (
                        <div key={f.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ color: 'var(--ink-4)', flex: 'none', marginTop: 6, width: 4, height: 4, borderRadius: 4, background: 'var(--ink-4)' }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>{f.detail}</span>
                            <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-4)', marginLeft: 8 }}>
                              {f.source || '—'}{fmtWhen(f.created_at) ? ` · ${fmtWhen(f.created_at)}` : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
