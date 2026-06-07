import { useState, useEffect, useRef } from 'react'
import { Sheet, SheetHead } from './Sheet.jsx'
import { supabase } from '../lib/supabase.js'
import Icon from './Icon.jsx'

export function AskPill({ onClick, style, compact }) {
  return (
    <button data-testid="ask-pill" className="cx-ask" style={style} onClick={onClick}>
      <span className="spark" style={{ display: 'flex' }}><Icon name="spark" size={16} /></span>
      {!compact && <span>Ask Crucible</span>}
    </button>
  )
}

export function AskSheet({ onClose, onDone }) {
  const [phase, setPhase] = useState('idle') // 'idle' | 'running' | 'done' | 'error'
  const [errMsg, setErrMsg] = useState('')
  const [reqId, setReqId] = useState(null) // stored for MTC-321 Realtime forward-compat
  const timerRef = useRef(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  async function runSession() {
    if (!supabase) { setPhase('error'); setErrMsg('Supabase unavailable — check env vars.'); return }
    setPhase('running')
    const { data, error } = await supabase
      .from('cos_session_requests')
      .insert({})
      .select('id')
      .single()
    if (error) { setPhase('error'); setErrMsg(error.message); return }
    setReqId(data.id)
    timerRef.current = setInterval(async () => {
      const { data: row } = await supabase
        .from('cos_session_requests')
        .select('status, error')
        .eq('id', data.id)
        .single()
      if (!row) return
      if (row.status === 'done') {
        clearInterval(timerRef.current)
        setPhase('done')
        onDone()
      } else if (row.status === 'error') {
        clearInterval(timerRef.current)
        setPhase('error')
        setErrMsg(row.error || 'Session failed.')
      }
    }, 3000)
  }

  function body() {
    if (phase === 'idle') return (
      <div style={{ padding: '24px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>
          Runs the COS session on the box — reads calendar, triages tasks, writes your brief.
        </p>
        <button
          data-testid="ask-run"
          onClick={runSession}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'var(--accent)', color: '#1f2a30', border: 'none',
            borderRadius: 12, padding: '13px 20px', cursor: 'pointer',
            fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600,
          }}
        >
          <Icon name="spark" size={16} />
          Run a session
        </button>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 11.5, color: 'var(--ink-4)', textAlign: 'center' }}>
          A launcher, not a conversation.
        </div>
      </div>
    )
    if (phase === 'running') return (
      <div style={{ padding: '32px 18px', textAlign: 'center', fontFamily: 'var(--sans)' }}>
        <div style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.5 }}>Session running…</div>
        <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 8 }}>This takes a few minutes.</div>
      </div>
    )
    if (phase === 'done') return (
      <div style={{ padding: '32px 18px', textAlign: 'center', fontFamily: 'var(--sans)' }}>
        <div style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.5 }}>Done — brief updated.</div>
        <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 8 }}>Cockpit refreshed.</div>
      </div>
    )
    if (phase === 'error') return (
      <div style={{ padding: '32px 18px', textAlign: 'center', fontFamily: 'var(--sans)' }}>
        <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>Session failed.</div>
        {errMsg && (
          <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 8, wordBreak: 'break-word' }}>
            {errMsg}
          </div>
        )}
        <button onClick={() => setPhase('idle')} style={{
          marginTop: 16, background: 'none', border: '1px solid var(--line)', borderRadius: 10,
          padding: '9px 16px', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-3)',
        }}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <Sheet data-testid="ask-sheet" onClose={onClose} maxWidth={440}>
      <SheetHead eyebrow="Ask Crucible" title="Run a COS session" onClose={onClose} />
      {body()}
    </Sheet>
  )
}
