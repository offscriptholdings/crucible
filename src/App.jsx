import { useState, useEffect, useRef } from 'react'
import { NavRail, TabBar } from './components/Nav.jsx'
import RelationshipsSurface from './components/RelationshipsSurface.jsx'
import TasksSurface from './components/TasksSurface.jsx'
import HomeSurface from './components/HomeSurface.jsx'
import SoapSurface from './components/SoapSurface.jsx'
import NotesSurface from './components/NotesSurface.jsx'

const NAV = [
  { id: 'home',  icon: 'home',  label: 'Home' },
  { id: 'tasks', icon: 'tasks', label: 'Tasks' },
  { id: 'soap',  icon: 'soap',  label: 'SOAP' },
  { id: 'people', icon: 'people', label: 'People' },
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
  const [appKey, setAppKey] = useState(0)
  const loadDay = useRef(new Date().toLocaleDateString('en-CA'))

  // Re-fetch when returning to the app on a new day, so the morning brief / SOAP
  // appears without a manual reload (an open PWA otherwise shows yesterday's data).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      const today = new Date().toLocaleDateString('en-CA')
      if (today !== loadDay.current) {
        loadDay.current = today
        setAppKey(k => k + 1)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [])

  const surface = () => {
    switch (tab) {
      case 'tasks':  return <TasksSurface key={appKey} bp={bp} />
      case 'soap':   return <SoapSurface key={appKey} bp={bp} />
      case 'people': return <RelationshipsSurface key={appKey} bp={bp} />
      case 'notes':  return <NotesSurface key={appKey} bp={bp} />
      default: return null
    }
  }

  if (bp === 'iphone') {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--sans)' }}>
        <div className="cx-scroll" style={{ flex: 1, padding: '56px 16px 52px' }}>
          {tab === 'home' ? <HomeSurface key={appKey} bp={bp} /> : surface()}
        </div>
        <TabBar active={tab} onNav={setTab} nav={NAV} />
      </div>
    )
  }

  const railW = bp === 'ipad' ? 84 : 74
  const padMain = bp === 'ipad' ? 28 : 22
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', display: 'flex', fontFamily: 'var(--sans)' }}>
      <NavRail active={tab} onNav={setTab} nav={NAV} width={railW} />
      <main className="cx-scroll" style={{ flex: 1, padding: padMain, paddingBottom: padMain + 78 }}>
        {tab === 'home' ? <HomeSurface key={appKey} bp={bp} /> : <div style={{ maxWidth: bp === 'ipad' ? 1180 : 980 }}>{surface()}</div>}
      </main>
    </div>
  )
}
