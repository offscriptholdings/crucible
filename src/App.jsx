import { useState, useEffect } from 'react'
import { NavRail, TabBar } from './components/Nav.jsx'
import { AskPill, AskSheet } from './components/Ask.jsx'
import TasksSurface from './components/TasksSurface.jsx'
import HomeSurface from './components/HomeSurface.jsx'
import SoapSurface from './components/SoapSurface.jsx'
import NotesSurface from './components/NotesSurface.jsx'

const NAV = [
  { id: 'home',  icon: 'home',  label: 'Home' },
  { id: 'tasks', icon: 'tasks', label: 'Tasks' },
  { id: 'soap',  icon: 'soap',  label: 'SOAP' },
  { id: 'chaos', icon: 'chaos', label: 'Chaos' },
  { id: 'notes', icon: 'notes', label: 'Notes' },
]

function getBreakpoint() {
  const w = window.innerWidth
  if (w >= 1133) return 'ipad'
  if (w >= 744) return 'mini'
  return 'iphone'
}

function useBreakpoint() {
  const [bp, setBp] = useState(() => getBreakpoint())
  useEffect(() => {
    const handler = () => setBp(getBreakpoint())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return bp
}

export default function App() {
  const bp = useBreakpoint()
  const [tab, setTab] = useState('home')
  const [ask, setAsk] = useState(false)

  const surface = () => {
    switch (tab) {
      case 'tasks': return <TasksSurface bp={bp} />
      case 'soap':  return <SoapSurface bp={bp} />
      case 'chaos': return <div data-testid="surface-chaos" style={{ color: 'var(--ink-3)', fontFamily: 'var(--sans)', fontSize: 14, padding: 16 }}>chaos</div>
      case 'notes': return <NotesSurface bp={bp} />
      default: return null
    }
  }

  if (bp === 'iphone') {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--sans)' }}>
        <div className="cx-scroll" style={{ flex: 1, padding: '56px 16px 52px' }}>
          {tab === 'home' ? <HomeSurface bp={bp} /> : surface()}
        </div>
        <AskPill compact onClick={() => setAsk(true)} style={{ position: 'absolute', right: 16, bottom: 92 }} />
        <TabBar active={tab} onNav={setTab} nav={NAV} />
        {ask && <AskSheet onClose={() => setAsk(false)} />}
      </div>
    )
  }

  const railW = bp === 'ipad' ? 84 : 74
  const padMain = bp === 'ipad' ? 28 : 22
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', display: 'flex', fontFamily: 'var(--sans)' }}>
      <NavRail active={tab} onNav={setTab} nav={NAV} width={railW} />
      <main className="cx-scroll" style={{ flex: 1, padding: padMain, paddingBottom: padMain + 78 }}>
        {tab === 'home' ? <HomeSurface bp={bp} /> : <div style={{ maxWidth: bp === 'ipad' ? 1180 : 980 }}>{surface()}</div>}
      </main>
      <AskPill onClick={() => setAsk(true)} style={{ position: 'absolute', right: padMain, bottom: padMain }} />
      {ask && <AskSheet onClose={() => setAsk(false)} />}
    </div>
  )
}
