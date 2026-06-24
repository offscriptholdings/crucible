import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { Sheet, SheetHead } from './Sheet.jsx'

export default function TaskDetail({ task, projects, onClose, onSave, onDelete }) {
  const [text, setText] = useState(task.text)
  const [horizon, setHorizon] = useState(task.horizon)
  const [done, setDone] = useState(task.done)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const proj = projects.find(p => p.id === task.project_id)
  const createdDate = task.created_at
    ? new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

  async function save() {
    setSaving(true)
    if (supabase) {
      await supabase.from('tasks').update({ text, horizon, done }).eq('id', task.id)
    }
    onSave({ ...task, text, horizon, done })
    setSaving(false)
  }

  async function del() {
    setDeleting(true)
    if (supabase) {
      await supabase.from('tasks').delete().eq('id', task.id)
    }
    onDelete(task.id)
  }

  return (
    <Sheet data-testid="task-detail-sheet" onClose={onClose} maxWidth={480}>
      <SheetHead eyebrow="Task" title={text || 'Untitled'} onClose={onClose} />
      <div className="cx-scroll" style={{ padding: '18px 18px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        <div>
          <div className="eyebrow" style={{ marginBottom: 7 }}>Task text</div>
          <textarea
            data-testid="task-detail-text"
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            style={{
              width: '100%', resize: 'vertical', padding: '10px 12px',
              background: 'var(--bg-sunken)', border: '1px solid var(--line-strong)',
              borderRadius: 10, color: 'var(--ink)', fontFamily: 'var(--sans)',
              fontSize: 14, lineHeight: 1.5, boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 7 }}>Horizon</div>
          <div data-testid="task-detail-horizon" style={{ display: 'flex', gap: 8 }}>
            {[
              { v: 'today', label: 'Today' },
              { v: 'week',  label: 'This week' },
              { v: 'rest',  label: 'The rest' },
            ].map(h => (
              <button
                key={h.v}
                data-testid={`task-horizon-${h.v}`}
                onClick={() => setHorizon(h.v)}
                style={{
                  padding: '7px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600,
                  background: horizon === h.v ? 'var(--accent)' : 'var(--panel-2)',
                  color: horizon === h.v ? '#1f2a30' : 'var(--ink-3)',
                  transition: 'background .14s ease, color .14s ease',
                }}
              >{h.label}</button>
            ))}
          </div>
        </div>

        <div>
          <button
            data-testid="task-detail-done"
            onClick={() => setDone(d => !d)}
            style={{
              padding: '8px 16px', borderRadius: 9, border: '1px solid var(--line-strong)',
              background: done ? 'var(--accent)' : 'var(--panel-2)',
              color: done ? '#1f2a30' : 'var(--ink-2)',
              fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'background .14s ease, color .14s ease',
            }}
          >{done ? '✓ Done' : 'Mark done'}</button>
        </div>

        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          {proj && (
            <div>
              <div className="eyebrow" style={{ marginBottom: 3 }}>Project</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-2)' }}>{proj.name}</div>
            </div>
          )}
          <div>
            <div className="eyebrow" style={{ marginBottom: 3 }}>Created</div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-2)' }}>{createdDate}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', paddingTop: 4 }}>
          <button
            data-testid="task-detail-delete"
            onClick={del}
            disabled={deleting}
            style={{
              padding: '9px 18px', borderRadius: 10, border: '1px solid var(--line-strong)',
              background: 'none', color: deleting ? 'var(--ink-4)' : 'var(--ink-3)',
              fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer',
            }}
          >{deleting ? 'Deleting…' : 'Delete'}</button>
          <button
            data-testid="task-detail-save"
            onClick={save}
            disabled={saving}
            style={{
              padding: '9px 22px', borderRadius: 10, border: 'none',
              background: saving ? 'var(--panel-2)' : 'var(--accent)',
              color: saving ? 'var(--ink-4)' : '#1f2a30',
              fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background .14s ease',
            }}
          >{saving ? 'Saving…' : 'Save'}</button>
        </div>

      </div>
    </Sheet>
  )
}
