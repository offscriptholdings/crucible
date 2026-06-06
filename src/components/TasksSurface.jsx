import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import Icon from './Icon.jsx'

function SurfaceHeader({ title, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
      <h1 style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 26, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{title}</h1>
      {right}
    </div>
  )
}

function Segmented({ options, value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', gap: 3, padding: 3, background: 'var(--bg-sunken)', border: '1px solid var(--line)', borderRadius: 11 }}>
      {options.map(o => (
        <button
          key={o.v}
          data-testid={o.testid}
          onClick={() => onChange(o.v)}
          style={{
            padding: '7px 15px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--sans)', fontSize: 12.5, fontWeight: 600, letterSpacing: '0.01em',
            background: value === o.v ? 'var(--panel-2)' : 'transparent',
            color: value === o.v ? 'var(--ink)' : 'var(--ink-3)',
            transition: 'color .14s ease, background .14s ease',
          }}
        >{o.label}</button>
      ))}
    </div>
  )
}

function Panel({ eyebrow, title, action, children, pad = 18 }) {
  return (
    <section className="cx-panel">
      {(eyebrow || title || action) && (
        <header className="cx-panel-head" style={{ padding: `${pad}px ${pad}px 0` }}>
          <div>
            {eyebrow && <div className="eyebrow" style={{ marginBottom: 5 }}>{eyebrow}</div>}
            {title && <h3 className="panel-title">{title}</h3>}
          </div>
          {action}
        </header>
      )}
      <div style={{ padding: pad }}>{children}</div>
    </section>
  )
}

function Check({ on, onClick }) {
  return (
    <button className={'cx-check' + (on ? ' on' : '')} onClick={onClick} aria-pressed={on}>
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <path d="M2.5 7.5l3 3 6-7" stroke="#1f2a30" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}

function TaskRow({ task, projects, onToggle, showProject = true }) {
  const proj = projects.find(p => p.id === task.project_id)
  return (
    <div className="cx-row" style={{ alignItems: 'center', padding: '9px 0' }}>
      <Check on={task.done} onClick={() => onToggle(task.id)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--sans)', fontSize: 14.5, lineHeight: 1.3,
          color: task.done ? 'var(--ink-4)' : 'var(--ink)',
          textDecoration: task.done ? 'line-through' : 'none',
          textDecorationColor: 'var(--ink-4)',
        }}>{task.text}</div>
      </div>
      {showProject && proj && (
        <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-3)', whiteSpace: 'nowrap', flex: 'none' }}>
          {proj.name}
        </span>
      )}
    </div>
  )
}

export default function TasksSurface({ bp }) {
  const [rawTasks, setRawTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [sub, setSub] = useState('tasks')
  const [proj, setProj] = useState(null)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    Promise.all([
      supabase.from('tasks').select('*').order('text'),
      supabase.from('projects').select('*').order('name'),
    ]).then(([tRes, pRes]) => {
      setRawTasks(tRes.data || [])
      setProjects(pRes.data || [])
      setLoading(false)
    })
  }, [])

  const toggle = async (id) => {
    setRawTasks(prev => prev.map(t => t.id === id ? { ...t, done: true } : t))
    if (supabase) await supabase.from('tasks').update({ done: true }).eq('id', id)
  }

  const open = rawTasks.filter(t => !t.done)
  const grouped = {
    today: open.filter(t => t.horizon === 'today'),
    week:  open.filter(t => t.horizon === 'week'),
    rest:  open.filter(t => t.horizon === 'rest'),
  }
  const columns = bp === 'ipad' ? 2 : 1

  const SEG_OPTIONS = [
    { v: 'tasks',    label: 'Tasks',    testid: 'tasks-seg-tasks' },
    { v: 'projects', label: 'Projects', testid: 'tasks-seg-projects' },
  ]

  if (sub === 'projects') {
    if (proj) {
      const p = projects.find(x => x.id === proj)
      const projTasks = open.filter(t => t.project_id === proj)
      return (
        <div data-testid="surface-tasks">
          <SurfaceHeader title="Tasks" right={
            <Segmented options={SEG_OPTIONS} value={sub} onChange={(v) => { setSub(v); setProj(null) }} />
          } />
          <button
            data-testid="tasks-back-btn"
            onClick={() => setProj(null)}
            className="cx-press"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--ink-3)', fontFamily: 'var(--sans)', fontSize: 13, cursor: 'pointer', padding: '6px 10px 6px 6px', marginBottom: 12 }}
          >
            <span style={{ display: 'flex', transform: 'rotate(180deg)' }}><Icon name="chevron" size={15} /></span>
            All projects
          </button>
          <div data-testid="tasks-project-detail">
            <Panel eyebrow="Project" title={p ? p.name : ''} pad={18}>
              {p && <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-3)', marginTop: -2, marginBottom: 12 }}>{p.blurb}</div>}
              <div style={{ marginTop: 2 }}>
                {projTasks.length
                  ? projTasks.map(t => <TaskRow key={t.id} task={t} projects={projects} onToggle={toggle} showProject={false} />)
                  : <div style={{ fontFamily: 'var(--sans)', color: 'var(--ink-3)', fontSize: 14, padding: '8px 0' }}>Nothing open here.</div>}
              </div>
            </Panel>
          </div>
        </div>
      )
    }

    return (
      <div data-testid="surface-tasks">
        <SurfaceHeader title="Tasks" right={
          <Segmented options={SEG_OPTIONS} value={sub} onChange={setSub} />
        } />
        <div data-testid="tasks-projects-list" style={{ display: 'grid', gridTemplateColumns: columns > 1 ? '1fr 1fr' : '1fr', gap: 14 }}>
          {projects.map(p => {
            const openCount = open.filter(t => t.project_id === p.id).length
            return (
              <button key={p.id} onClick={() => setProj(p.id)} className="cx-panel cx-press" style={{ textAlign: 'left', padding: 18, cursor: 'pointer', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 15.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.25 }}>{p.name}</span>
                  <span style={{ display: 'flex', color: 'var(--ink-4)', marginTop: 2 }}><Icon name="chevron" size={16} /></span>
                </div>
                {p.blurb && <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-3)', marginTop: 8 }}>{p.blurb}</div>}
                <div style={{ fontFamily: 'var(--sans)', fontSize: 11.5, color: 'var(--ink-4)', marginTop: 14 }}>{openCount} open</div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const Group = ({ label, items, testid }) => (
    <Panel
      eyebrow={label}
      action={<span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{items.length}</span>}
      pad={16}
    >
      <div data-testid={testid} style={{ marginTop: -4 }}>
        {items.length
          ? items.map(t => <TaskRow key={t.id} task={t} projects={projects} onToggle={toggle} />)
          : <div style={{ fontFamily: 'var(--sans)', color: 'var(--ink-4)', fontSize: 13, padding: '6px 0' }}>—</div>}
      </div>
    </Panel>
  )

  return (
    <div data-testid="surface-tasks">
      <SurfaceHeader title="Tasks" right={
        <Segmented options={SEG_OPTIONS} value={sub} onChange={setSub} />
      } />
      {loading && <div style={{ fontFamily: 'var(--sans)', color: 'var(--ink-3)', fontSize: 14 }}>Loading…</div>}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: columns > 1 ? '1fr 1fr' : '1fr', gap: 14, alignItems: 'start' }}>
          <div data-testid="tasks-group-today"><Group label="Today" items={grouped.today} testid="tasks-today-items" /></div>
          <div data-testid="tasks-group-week"><Group label="This week" items={grouped.week} testid="tasks-week-items" /></div>
          <div data-testid="tasks-group-rest"><Group label="The rest" items={grouped.rest} testid="tasks-rest-items" /></div>
        </div>
      )}
    </div>
  )
}
