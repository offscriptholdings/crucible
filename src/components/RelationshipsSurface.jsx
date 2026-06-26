import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { Sheet, SheetHead } from './Sheet.jsx'
import Icon from './Icon.jsx'

const CAT_ORDER = ['family', 'friend', 'church', 'business', 'other']
const CAT_LABEL = { family: 'Family', friend: 'Friends', church: 'Church', business: 'Business', other: 'Other' }

// last name = last token, ignoring any parenthetical suffix like "(Dad)"
function lastName(name) {
  const parts = (name || '').replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(Boolean)
  return (parts[parts.length - 1] || '').toLowerCase()
}

function catOf(rel) {
  const r = (rel || '').toLowerCase()
  return CAT_ORDER.includes(r) ? r : 'other'
}

// key_dates is freeform jsonb (e.g. { birthday: "May 13", anniversary: "Sep 2" }).
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
  try { return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
  catch { return '' }
}

function PersonRow({ r, factCount, onOpen, first }) {
  const hint = fmtKeyDates(r.key_dates)[0]
  return (
    <div>
      {!first && <hr className="cx-div" />}
      <button
        data-testid="person-row"
        onClick={() => onOpen(r)}
        className="cx-press"
        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '13px 0', display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <span style={{ fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600, color: 'var(--ink)', flex: 'none' }}>{r.name}</span>
        {hint && <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{hint}</span>}
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-4)' }}>
          {factCount > 0 && <span style={{ fontFamily: 'var(--sans)', fontSize: 11.5 }}>{factCount} note{factCount > 1 ? 's' : ''}</span>}
          <Icon name="chevron" size={15} />
        </span>
      </button>
    </div>
  )
}

function PersonSheet({ person, facts, onClose }) {
  const dates = fmtKeyDates(person.key_dates)
  return (
    <Sheet data-testid="person-sheet" onClose={onClose} maxWidth={460}>
      <SheetHead eyebrow={CAT_LABEL[catOf(person.relationship)]} title={person.name} onClose={onClose} />
      <div className="cx-scroll" style={{ padding: '18px 18px 24px' }}>
        {dates.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: facts.length ? 20 : 0 }}>
            {dates.map((d, j) => (
              <span key={j} className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)', padding: '3px 9px', border: '1px solid var(--line-strong)', borderRadius: 8 }}>{d}</span>
            ))}
          </div>
        )}
        {facts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="eyebrow">What I know</div>
            {facts.map(f => (
              <div key={f.id}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)', lineHeight: 1.5 }}>{f.detail}</div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-4)', marginTop: 3 }}>
                  {f.source || '—'}{fmtWhen(f.created_at) ? ` · ${fmtWhen(f.created_at)}` : ''}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--ink-4)', fontStyle: 'italic' }}>No details logged yet.</div>
        )}
      </div>
    </Sheet>
  )
}

export default function RelationshipsSurface({ bp }) {
  const [people, setPeople] = useState([])
  const [details, setDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    Promise.all([
      supabase.from('cos_people').select('*'),
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

  const groups = CAT_ORDER
    .map(cat => ({
      cat,
      list: people
        .filter(p => catOf(p.relationship) === cat)
        .sort((a, b) => lastName(a.name).localeCompare(lastName(b.name)) || (a.name || '').localeCompare(b.name || '')),
    }))
    .filter(g => g.list.length)

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: bp === 'ipad' ? 760 : 640 }}>
          {groups.map(g => (
            <div key={g.cat}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>{CAT_LABEL[g.cat]} · {g.list.length}</div>
              <div className="cx-panel" style={{ padding: '4px 18px' }}>
                {g.list.map((r, i) => (
                  <PersonRow key={r.id} r={r} factCount={(byPerson[r.id] || []).length} onOpen={setActive} first={i === 0} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {active && (
        <PersonSheet person={active} facts={byPerson[active.id] || []} onClose={() => setActive(null)} />
      )}
    </div>
  )
}
