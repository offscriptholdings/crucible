export default function Icon({ name, size = 20, stroke = 1.6, style }) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: stroke,
    strokeLinecap: "round", strokeLinejoin: "round", style,
  };
  switch (name) {
    case "home":
      return <svg {...p}><path d="M4 11.2 12 5l8 6.2"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/></svg>;
    case "tasks":
      return <svg {...p}><path d="M5 7h11"/><path d="M5 12h11"/><path d="M5 17h7"/><path d="m18.5 6.5 1.4 1.4L23 5"/></svg>;
    case "soap":
      return <svg {...p}><path d="M5 5.5C5 4.7 5.7 4 6.5 4H18a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6.5C5.7 19 5 18.3 5 17.5z"/><path d="M5 16.5C5 15.7 5.7 15 6.5 15H19"/><path d="M9 8h6"/></svg>;
    case "chaos":
      return <svg {...p}><path d="M3 17l5-6 4 3 5-8"/><path d="M17 6h4v4"/></svg>;
    case "notes":
      return <svg {...p}><path d="M15.5 4.5l4 4L9 19l-4.5.9L5.4 15.5z"/><path d="M13.5 6.5l4 4"/></svg>;
    case "spark":
      return <svg {...p}><path d="M12 4.5l1.6 4.6 4.6 1.6-4.6 1.6L12 17l-1.6-4.7L5.8 10.7l4.6-1.6z"/></svg>;
    case "chevron":
      return <svg {...p}><path d="M9 5l7 7-7 7"/></svg>;
    case "chevron-down":
      return <svg {...p}><path d="M5 9l7 7 7-7"/></svg>;
    case "calendar":
      return <svg {...p}><rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M4 9.5h16"/><path d="M8 3.5v4M16 3.5v4"/></svg>;
    case "loop":
      return <svg {...p}><circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/></svg>;
    case "people":
      return <svg {...p}><circle cx="9" cy="9" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 6.5a3 3 0 0 1 0 5.6"/><path d="M17 14.2a5.5 5.5 0 0 1 3.5 4.8"/></svg>;
    case "protocol":
      return <svg {...p}><path d="M6.5 9v6M17.5 9v6"/><path d="M4 10.5v3M20 10.5v3"/><path d="M6.5 12h11"/></svg>;
    case "projects":
      return <svg {...p}><path d="M12 3 21 7.5 12 12 3 7.5z"/><path d="m3 12 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/></svg>;
    case "close":
      return <svg {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case "plus":
      return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case "arrow-up":
      return <svg {...p}><path d="M12 19V6M6 11l6-6 6 6"/></svg>;
    case "clock":
      return <svg {...p}><circle cx="12" cy="12" r="8"/><path d="M12 8v4.2l2.6 1.6"/></svg>;
    case "target":
      return <svg {...p}><circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="3.5"/></svg>;
    case "dot":
      return <svg {...p}><circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none"/></svg>;
    default:
      return <svg {...p}><circle cx="12" cy="12" r="8"/></svg>;
  }
}
