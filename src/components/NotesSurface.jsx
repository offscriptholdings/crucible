import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import Icon from './Icon.jsx'

function formatWhen(ts) {
  const d = new Date(ts)
  const now = new Date()
  const today = now.toDateString()
  const yesterday = new Date(now - 86400000).toDateString()
  if (d.toDateString() === today) {
    return 'Today · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }
  if (d.toDateString() === yesterday) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function SurfaceHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1 style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 26, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{title}</h1>
      {sub && <div className="eyebrow" style={{ marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function NoteCapture({ onAdd }) {
  const [v, setV] = useState('')
  const submit = () => { if (v.trim()) { onAdd(v.trim()); setV('') } }
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 24 }}>
      <textarea
        data-testid="notes-input"
        value={v}
        onChange={e => setV(e.target.value)}
        placeholder="Capture a thought…"
        rows={2}
        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit() }}
        style={{
          flex: 1, resize: 'none',
          background: 'var(--bg-sunken)', border: '1px solid var(--line)',
          borderRadius: 12, padding: '12px 14px',
          color: 'var(--ink)', fontFamily: 'var(--sans)', fontSize: 15, lineHeight: 1.45,
          outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--line)'}
      />
      <button
        data-testid="notes-submit"
        onClick={submit}
        style={{
          flex: 'none', width: 44, height: 44, borderRadius: 12,
          border: 'none', cursor: v.trim() ? 'pointer' : 'default',
          display: 'grid', placeItems: 'center',
          background: v.trim() ? 'var(--accent)' : 'var(--panel-2)',
          color: v.trim() ? '#1f2a30' : 'var(--ink-4)',
          transition: 'background .15s ease',
        }}
      >
        <Icon name="arrow-up" size={19} />
      </button>
    </div>
  )
}

export default function NotesSurface({ bp }) {
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState([])

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase
      .from('notes')
      .select('id, content, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setNotes(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleAdd(text) {
    const { data, error } = await supabase
      .from('notes')
      .insert({ content: text })
      .select('id, content, created_at')
      .single()
    if (error) { console.error('notes insert failed', error); return }
    setNotes(prev => [data, ...prev])
  }

  if (loading) return (
    <div data-testid="surface-notes"
      style={{ color: 'var(--ink-3)', fontFamily: 'var(--sans)', fontSize: 14, padding: 16 }}>
      Loading…
    </div>
  )

  const cols = bp === 'ipad' ? 3 : bp === 'mini' ? 2 : 1

  return (
    <div data-testid="surface-notes">
      <SurfaceHeader title="Notes" sub="Capture only — no dates, no status" />
      <NoteCapture onAdd={handleAdd} />
      <div
        data-testid="notes-list"
        style={{ columns: cols, columnGap: 14 }}
      >
        {notes.length === 0 && (
          <div style={{ fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--ink-3)' }}>
            No notes yet.
          </div>
        )}
        {notes.map(n => (
          <div
            key={n.id}
            data-testid="notes-list-item"
            className="cx-panel"
            style={{ padding: '16px 18px', marginBottom: 14, breakInside: 'avoid' }}
          >
            <p style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 14.5, lineHeight: 1.55, color: 'var(--ink)', textWrap: 'pretty' }}>
              {n.content}
            </p>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-4)', marginTop: 12, letterSpacing: '0.03em' }}>
              {formatWhen(n.created_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
