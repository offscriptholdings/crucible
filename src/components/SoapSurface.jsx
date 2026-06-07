import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import Icon from './Icon.jsx'

function SurfaceHeader({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
      <h1 style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 26, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{title}</h1>
    </div>
  )
}

function Panel({ eyebrow, title, children, pad = 18 }) {
  return (
    <section className="cx-panel">
      {(eyebrow || title) && (
        <header className="cx-panel-head" style={{ padding: `${pad}px ${pad}px 0` }}>
          <div>
            {eyebrow && <div className="eyebrow" style={{ marginBottom: 5 }}>{eyebrow}</div>}
            {title && <h3 className="panel-title">{title}</h3>}
          </div>
        </header>
      )}
      <div style={{ padding: pad }}>{children}</div>
    </section>
  )
}

function Area({ k, label, ph, rows = 2, f, set }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="eyebrow" style={{ marginBottom: 5 }}>{label}</div>
      <textarea
        data-testid={'soap-field-' + k}
        rows={rows}
        placeholder={ph}
        value={f[k]}
        onChange={e => set(k, e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'var(--bg-sunken)',
          border: `1px solid ${focused ? 'var(--accent)' : 'var(--line)'}`,
          borderRadius: 10,
          padding: '11px 13px',
          fontFamily: 'var(--sans)', fontSize: 14.5, lineHeight: 1.5,
          color: 'var(--ink)',
          resize: 'vertical',
          outline: 'none',
          transition: 'border-color .14s ease',
        }}
      />
    </div>
  )
}

export default function SoapSurface({ bp }) {
  const today = new Date().toISOString().slice(0, 10)
  const [loading, setLoading] = useState(true)
  const [brief, setBrief] = useState(null)
  const [entries, setEntries] = useState([])
  const [f, setF] = useState({ o: '', a: '', p: '' })
  const [open, setOpen] = useState(null)
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }))
  const filled = f.o.trim() || f.a.trim() || f.p.trim()

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    Promise.all([
      supabase.from('soap_entries').select('*').order('created_at', { ascending: false }),
      supabase.from('brief').select('ref, verse').eq('for_date', today).single(),
    ])
      .then(([entriesRes, briefRes]) => {
        setEntries(entriesRes.data || [])
        setBrief(briefRes.data || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    const payload = { ref: brief?.ref || '—', o: f.o, a: f.a, p: f.p }
    const { data, error } = await supabase.from('soap_entries').insert(payload).select().single()
    if (error) { console.error('soap_entries insert failed', error); return }
    setEntries(prev => [data, ...prev])
    setF({ o: '', a: '', p: '' })
  }

  if (loading) return (
    <div data-testid="surface-soap" style={{ color: 'var(--ink-3)', fontFamily: 'var(--sans)', fontSize: 14, padding: 16 }}>
      Loading…
    </div>
  )

  const columns = bp === 'iphone' ? 1 : 2

  return (
    <div data-testid="surface-soap">
      <SurfaceHeader title="SOAP" />
      <div style={{ display: 'grid', gridTemplateColumns: columns > 1 ? '1.1fr 0.9fr' : '1fr', gap: 18, alignItems: 'start' }}>

        <Panel>
          <div className="mono" data-testid="soap-ref" style={{ fontSize: 11.5, color: 'var(--accent)', letterSpacing: '0.05em', marginBottom: 8 }}>
            {brief?.ref || '—'}
          </div>
          <hr className="cx-div" style={{ margin: '0 0 18px' }} />
          <Area k="o" label="Observation" ph="What does the passage say?" rows={3} f={f} set={set} />
          <Area k="a" label="Application" ph="What does it ask of today?" rows={2} f={f} set={set} />
          <Area k="p" label="Prayer" ph="A line, honestly." rows={2} f={f} set={set} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              data-testid="soap-save"
              disabled={!filled}
              onClick={handleSave}
              style={{
                padding: '10px 18px', borderRadius: 10, border: 'none',
                cursor: filled ? 'pointer' : 'default',
                fontFamily: 'var(--sans)', fontSize: 13.5, fontWeight: 600,
                background: filled ? 'var(--accent)' : 'var(--panel-2)',
                color: filled ? '#1f2a30' : 'var(--ink-4)',
                transition: 'background .15s ease',
              }}
            >Save entry</button>
          </div>
        </Panel>

        <div>
          <div className="eyebrow" style={{ marginBottom: 12, paddingLeft: 2 }}>Past entries</div>
          <div data-testid="soap-history" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {entries.length === 0 && (
              <div style={{ fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--ink-3)' }}>No entries yet.</div>
            )}
            {entries.map(h => {
              const isOpen = open === h.id
              return (
                <button key={h.id} data-testid="soap-history-item" onClick={() => setOpen(isOpen ? null : h.id)}
                  className="cx-panel cx-press"
                  style={{ textAlign: 'left', padding: '14px 16px', cursor: 'pointer', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: '0.04em' }}>{h.ref}</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{h.date}</span>
                  </div>
                  <div style={{
                    fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5, marginTop: 8,
                    ...(isOpen ? {} : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }),
                  }}>{h.o}</div>
                  {isOpen && (
                    <div style={{ marginTop: 14 }}>
                      <div className="eyebrow" style={{ marginBottom: 5 }}>Application</div>
                      <div style={{ fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 12 }}>{h.a}</div>
                      <div className="eyebrow" style={{ marginBottom: 5 }}>Prayer</div>
                      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.5 }}>{h.p}</div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
