import { useState } from 'react'
import { Sheet, SheetHead } from './Sheet.jsx'
import Icon from './Icon.jsx'

export function AskPill({ onClick, style, compact }) {
  return (
    <button data-testid="ask-pill" className="cx-ask" style={style} onClick={onClick}>
      <span className="spark" style={{ display: "flex" }}><Icon name="spark" size={16} /></span>
      {!compact && <span>Ask Crucible</span>}
    </button>
  );
}

export function AskSheet({ onClose }) {
  const [v, setV] = useState("");
  const tries = [
    "What actually matters today?",
    "Where does 98 stand right now?",
    "Draft the reply to Daniel.",
    "What am I avoiding?",
  ];
  return (
    <Sheet data-testid="ask-sheet" onClose={onClose} maxWidth={440}>
      <SheetHead eyebrow="Ask Crucible" title="What do you need?" onClose={onClose} />
      <div style={{ padding: "18px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input autoFocus value={v} onChange={e => setV(e.target.value)} placeholder="Type, or pick one below…"
            onKeyDown={e => { if (e.key === "Enter") onClose(); }}
            style={{ flex: 1, background: "var(--bg-sunken)", border: "1px solid var(--line-strong)", borderRadius: 11, padding: "12px 14px", color: "var(--ink)", fontFamily: "var(--sans)", fontSize: 15, outline: "none" }} />
          <button onClick={onClose} style={{ flex: "none", width: 44, height: 44, borderRadius: 11, border: "none", background: "var(--accent)", color: "#1f2a30", cursor: "pointer", display: "grid", placeItems: "center" }}>
            <Icon name="arrow-up" size={19} />
          </button>
        </div>
        <div className="eyebrow" style={{ margin: "20px 2px 10px" }}>Try</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {tries.map(t => (
            <button key={t} onClick={() => setV(t)} className="cx-press" style={{ display: "flex", alignItems: "center", gap: 11, textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "11px 10px", color: "var(--ink-2)", fontFamily: "var(--sans)", fontSize: 14 }}>
              <span style={{ color: "var(--accent)", display: "flex", flex: "none" }}><Icon name="spark" size={15} /></span>
              {t}
            </button>
          ))}
        </div>
        <div style={{ fontFamily: "var(--sans)", fontSize: 11.5, color: "var(--ink-4)", textAlign: "center", marginTop: 16 }}>A launcher, not a conversation.</div>
      </div>
    </Sheet>
  );
}
