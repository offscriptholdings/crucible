import { Sheet, SheetHead } from './Sheet.jsx'
import Icon from './Icon.jsx'

export function AskPill({ onClick, style, compact }) {
  return (
    <button data-testid="ask-pill" className="cx-ask" style={style} onClick={onClick}>
      <span className="spark" style={{ display: 'flex' }}><Icon name="spark" size={16} /></span>
      {!compact && <span>Ask Crucible</span>}
    </button>
  )
}

export function AskSheet({ onClose }) {
  return (
    <Sheet data-testid="ask-sheet" onClose={onClose} maxWidth={440}>
      <SheetHead eyebrow="Ask Crucible" title="Chat" onClose={onClose} />
      <div style={{ padding: '24px 18px', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.5 }}>
        Conversational assistant — coming soon.
      </div>
    </Sheet>
  )
}
