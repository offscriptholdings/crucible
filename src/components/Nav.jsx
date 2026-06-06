import Icon from './Icon.jsx'

export function NavRail({ active, onNav, nav, width }) {
  return (
    <nav data-testid="nav-rail" className="cx-nav" style={{ width, flex: "none" }}>
      <div style={{ padding: "18px 0 14px", display: "grid", placeItems: "center" }}>
        <div style={{ width: 30, height: 30, display: "grid", placeItems: "center" }}>
          <span style={{ width: 13, height: 13, background: "var(--accent)", transform: "rotate(45deg)", borderRadius: 3, boxShadow: "0 0 0 4px rgba(227,106,44,0.14)" }} />
        </div>
      </div>
      <div style={{ width: "60%", height: 1, background: "var(--line)", margin: "0 auto 6px" }} />
      <div style={{ flex: 1, width: "100%" }}>
        {nav.map(n => (
          <button key={n.id} data-testid={"nav-" + n.id} className={"cx-nav-item" + (active === n.id ? " on" : "")} onClick={() => onNav(n.id)}>
            <Icon name={n.icon} size={21} />
            <span className="lbl">{n.label}</span>
          </button>
        ))}
      </div>
      <div style={{ padding: "0 0 16px", display: "grid", placeItems: "center" }}>
        <div style={{ width: 30, height: 30, borderRadius: 999, background: "var(--panel-3)", border: "1px solid var(--line-strong)", display: "grid", placeItems: "center", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 15, color: "var(--ink)" }}>J</div>
      </div>
    </nav>
  );
}

export function TabBar({ active, onNav, nav }) {
  return (
    <div data-testid="tabbar" className="cx-tabbar" style={{ paddingBottom: 22 }}>
      {nav.map(n => (
        <button key={n.id} data-testid={"nav-" + n.id} className={"tab" + (active === n.id ? " on" : "")} onClick={() => onNav(n.id)}>
          <Icon name={n.icon} size={21} />
          <span className="lbl">{n.label}</span>
        </button>
      ))}
    </div>
  );
}
