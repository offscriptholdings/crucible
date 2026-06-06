import { useEffect } from 'react'
import Icon from './Icon.jsx'

export function Sheet({ onClose, children, maxWidth = 520, 'data-testid': testId }) {
  useEffect(() => {
    const k = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div data-testid={testId} className="cx-scrim" onClick={onClose}>
      <div className="cx-sheet" style={{ maxWidth }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function SheetHead({ eyebrow, title, onClose, right }) {
  return (
    <header style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "18px 18px 14px", borderBottom: "1px solid var(--line)",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>}
        <h2 style={{ margin: 0, fontFamily: "var(--sans)", fontSize: 19, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.01em" }}>{title}</h2>
      </div>
      {right}
      <button data-testid="ask-close" onClick={onClose} className="cx-press" style={{
        flex: "none", width: 34, height: 34, display: "grid", placeItems: "center",
        color: "var(--ink-3)", background: "none", border: "1px solid var(--line)", borderRadius: 10, cursor: "pointer",
      }}>
        <Icon name="close" size={17} />
      </button>
    </header>
  );
}
