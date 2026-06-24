import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { Sheet, SheetHead } from './Sheet.jsx'
import Icon from './Icon.jsx'

const CONVICTION_COLOR = {
  High: 'var(--accent)',
  Med:  'var(--ink-2)',
  Low:  'var(--ink-4)',
}

function SurfaceHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1 style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 26, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{title}</h1>
      {sub && <div className="eyebrow" style={{ marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function GroupHeader({ label, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div className="eyebrow">{label}</div>
      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{count}</span>
    </div>
  )
}

function SignalCard({ sig, onOpen }) {
  return (
    <button
      data-testid="chaos-signal-card"
      onClick={() => onOpen(sig)}
      className="cx-panel cx-press"
      style={{ textAlign: 'left', padding: 18, cursor: 'pointer', border: '1px solid var(--line)', width: '100%' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <span className="mono" style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)', letterSpacing: '0.02em' }}>{sig.ticker}</span>
        {sig.r_ratio != null && (
          <span className="mono" style={{ fontSize: 12.5, color: 'var(--ink-2)', padding: '3px 8px', border: '1px solid var(--line-strong)', borderRadius: 7 }}>
            {sig.r_ratio.toFixed(1)}R
          </span>
        )}
      </div>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-2)', marginBottom: 10 }}>{sig.setup_type}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600, color: CONVICTION_COLOR[sig.conviction] ?? 'var(--ink-3)' }}>
          {sig.conviction}
        </span>
        <span style={{ display: 'flex', color: 'var(--ink-4)', alignItems: 'center', gap: 4, fontFamily: 'var(--sans)', fontSize: 11.5 }}>
          memo <Icon name="chevron" size={13} />
        </span>
      </div>
    </button>
  )
}

function SignalSheet({ sig, onClose, onTake, onPass, isNew }) {
  const memo = sig.memo || sig.ai_reasoning || null
  const buyRange = (sig.entry_low != null && sig.entry_high != null)
    ? `$${sig.entry_low.toFixed(2)}–$${sig.entry_high.toFixed(2)}`
    : sig.entry_low != null ? `$${sig.entry_low.toFixed(2)}` : '—'

  return (
    <Sheet data-testid="chaos-signal-sheet" onClose={onClose} maxWidth={460}>
      <SheetHead
        eyebrow={sig.setup_type}
        title={sig.ticker}
        onClose={onClose}
        right={sig.r_ratio != null ? (
          <div className="mono" style={{ fontSize: 12.5, color: 'var(--ink-2)', alignSelf: 'center', marginRight: 4, padding: '3px 8px', border: '1px solid var(--line-strong)', borderRadius: 7 }}>
            {sig.r_ratio.toFixed(1)}R
          </div>
        ) : null}
      />
      <div className="cx-scroll" style={{ padding: '18px 18px 24px' }}>
        {memo ? (
          <div style={{ marginBottom: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 7 }}>Analyst memo</div>
            <p style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>{memo}</p>
          </div>
        ) : (
          <div style={{ marginBottom: 18, fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-4)', fontStyle: 'italic' }}>No memo available.</div>
        )}
        <div style={{ display: 'flex', background: 'var(--bg-sunken)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', marginBottom: isNew ? 18 : 0 }}>
          {[
            { label: 'Buy', val: buyRange },
            { label: 'Stop', val: sig.stop != null ? `$${sig.stop.toFixed(2)}` : '—' },
            { label: 'Sell', val: sig.target != null ? `$${sig.target.toFixed(2)}` : '—' },
          ].map((t, i) => (
            <div key={t.label} style={{ flex: 1, textAlign: 'center', padding: '12px 8px', borderLeft: i > 0 ? '1px solid var(--line)' : 'none' }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>{t.label}</div>
              <div className="mono" style={{ fontSize: 15.5, color: 'var(--ink)' }}>{t.val}</div>
            </div>
          ))}
        </div>
        {isNew && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              data-testid="chaos-pass-btn"
              onClick={onPass}
              style={{
                padding: '12px 16px', borderRadius: 12, border: '1px solid var(--line)',
                background: 'none', cursor: 'pointer',
                fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, color: 'var(--ink-3)',
              }}
            >
              Pass
            </button>
            <button
              data-testid="chaos-take-btn"
              onClick={onTake}
              style={{
                padding: '12px 16px', borderRadius: 12, border: 'none',
                background: 'var(--accent)', cursor: 'pointer',
                fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, color: '#1f2a30',
              }}
            >
              Take
            </button>
          </div>
        )}
      </div>
    </Sheet>
  )
}

export default function ChaosSurface({ bp }) {
  const [signals, setSignals] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase.schema('chaos').from('signals')
      .select('id, ticker, signal_date, setup_type, conviction, r_ratio, entry_low, entry_high, stop, target, memo, ai_reasoning, action, status')
      .then(({ data }) => {
        setSignals(data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Drop stale pending signals after 2 days; held ('take') positions stay regardless of age
  const cutoff = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10)
  const newSignals    = signals.filter(s => s.action === 'pending' && (!s.signal_date || s.signal_date >= cutoff))
  const activeSignals = signals.filter(s => s.action === 'take')
  const columns = bp === 'ipad' ? 3 : bp === 'mini' ? 2 : 1

  async function handleAction(sig, action) {
    setActive(null)
    if (!supabase) return
    await supabase.schema('chaos').from('signals').update({ action }).eq('id', sig.id)
    setSignals(prev => {
      if (action === 'take') return prev.map(s => s.id === sig.id ? { ...s, action: 'take' } : s)
      if (action === 'pass') return prev.filter(s => s.id !== sig.id)
      return prev
    })
  }

  if (loading) return (
    <div data-testid="surface-chaos" style={{ color: 'var(--ink-3)', fontFamily: 'var(--sans)', fontSize: 14, padding: 16 }}>
      Loading…
    </div>
  )

  return (
    <div data-testid="surface-chaos">
      <SurfaceHeader title="Chaos" sub="Signal queue · take or pass" />

      <div style={{ marginBottom: 28 }}>
        <GroupHeader label="New" count={newSignals.length} />
        {newSignals.length === 0 ? (
          <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-4)', padding: '8px 0' }}>—</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 14 }}>
            {newSignals.map(s => <SignalCard key={s.id} sig={s} onOpen={setActive} />)}
          </div>
        )}
      </div>

      <div>
        <GroupHeader label="Active" count={activeSignals.length} />
        {activeSignals.length === 0 ? (
          <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-4)', padding: '8px 0' }}>—</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 14 }}>
            {activeSignals.map(s => <SignalCard key={s.id} sig={s} onOpen={setActive} />)}
          </div>
        )}
      </div>

      {active && (
        <SignalSheet
          sig={active}
          onClose={() => setActive(null)}
          isNew={active.action === 'pending'}
          onTake={() => handleAction(active, 'take')}
          onPass={() => handleAction(active, 'pass')}
        />
      )}
    </div>
  )
}
