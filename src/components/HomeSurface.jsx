import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import Icon from './Icon.jsx'
import { Sheet, SheetHead } from './Sheet.jsx'

const SRC = {
  personal: { label: 'Personal', color: 'var(--tag-personal)' },
  '98':     { label: '98',       color: 'var(--tag-98)' },
  offscript:{ label: 'offscript',color: 'var(--tag-offscript)' },
}

function SrcTag({ src }) {
  const s = SRC[src] || SRC.personal
  return (
    <span className="cx-tag">
      <span className="dot" style={{ background: s.color }} />
      {s.label}
    </span>
  )
}

function Panel({ title, eyebrow, action, children, pad = 18, style, bodyStyle, 'data-testid': testId }) {
  return (
    <section className="cx-panel" style={style} data-testid={testId}>
      {(title || eyebrow || action) && (
        <header className="cx-panel-head" style={{ padding: `${pad}px ${pad}px 0` }}>
          <div>
            {eyebrow && <div className="eyebrow" style={{ marginBottom: 5 }}>{eyebrow}</div>}
            {title && <h3 className="panel-title">{title}</h3>}
          </div>
          {action}
        </header>
      )}
      <div style={{ padding: pad, ...bodyStyle }}>{children}</div>
    </section>
  )
}

function Temp({ value }) {
  const attn = value === 'tense' || value === 'drifting'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 600,
      letterSpacing: '0.04em', textTransform: 'uppercase',
      color: attn ? 'var(--accent)' : 'var(--ink-3)',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: 'currentColor' }} />
      {value}
    </span>
  )
}

function Field({ label, children }) {
  if (!children || children === '—') return null
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="eyebrow" style={{ marginBottom: 7 }}>{label}</div>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 14.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>{children}</div>
    </div>
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

function UpNextNudge({ count, onClick }) {
  if (count === 0) return null
  return (
    <button
      data-testid="staged-nudge"
      className="cx-press"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '6px 0',
        fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-3)',
        textAlign: 'left', width: '100%',
      }}
    >
      <span style={{
        background: 'var(--accent)', color: '#1f2a30',
        borderRadius: 6, padding: '2px 7px',
        fontWeight: 600, fontSize: 12, letterSpacing: '0.02em',
        flex: 'none',
      }}>{count}</span>
      <span>staged for your next session →</span>
    </button>
  )
}

function CockpitTaskRow({ task, projects }) {
  const proj = projects.find(p => p.id === task.project_id)
  return (
    <div className="cx-row" style={{ alignItems: 'center', padding: '9px 0' }}>
      <span style={{ width: 21, height: 21, flex: 'none', border: '1.5px solid var(--line-strong)', borderRadius: 7 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 14.5, lineHeight: 1.3, color: 'var(--ink)' }}>{task.text}</div>
      </div>
      {proj && (
        <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-3)', flex: 'none', whiteSpace: 'nowrap' }}>
          {proj.name.replace(/ —.*/, '')}
        </span>
      )}
    </div>
  )
}

function parseBold(text) {
  if (!text) return null;
  return text.split(/\*\*(.+?)\*\*/).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

function BriefBlock({ brief, todayLabel }) {
  return (
    <section className="cx-panel" data-testid="panel-brief" style={{
      padding: '26px 30px',
      background: 'linear-gradient(180deg, #283740 0%, var(--panel) 70%)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <div className="eyebrow">The Brief</div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
          {todayLabel}
        </div>
      </div>
      {brief ? (
        <>
          <div className="mono" style={{ fontSize: 12.5, color: 'var(--accent)', letterSpacing: '0.06em', marginBottom: 10 }}>
            {brief.ref}
          </div>
          <p className="serif italic" style={{
            margin: 0, color: 'var(--ink)',
            fontSize: 30, lineHeight: 1.3, letterSpacing: '-0.01em',
            textWrap: 'pretty', maxWidth: '30em',
          }}>{brief.verse}</p>
          <hr className="cx-div" style={{ margin: '20px 0 16px' }} />
          <p style={{
            margin: 0, fontFamily: 'var(--sans)', color: 'var(--ink-2)',
            fontSize: 15.5, lineHeight: 1.5, textWrap: 'pretty',
          }}>{parseBold(brief.close)}</p>
        </>
      ) : (
        <p style={{ fontFamily: 'var(--sans)', color: 'var(--ink-3)', fontSize: 14 }}>
          Brief not written yet — morning COS session will populate this.
        </p>
      )}
    </section>
  )
}

function EventRow({ ev, onOpen }) {
  return (
    <button data-testid="event-row" className="cx-press" onClick={() => onOpen(ev)} style={{
      display: 'flex', alignItems: 'center', gap: 13, width: '100%',
      padding: '10px 10px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
    }}>
      <span className="mono" style={{ fontSize: 12.5, color: 'var(--ink-3)', width: 42, flex: 'none', letterSpacing: '0.02em' }}>{ev.time}</span>
      <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--line)', flex: 'none' }} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: 'var(--sans)', fontSize: 14.5, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 4 }}>{ev.title}</span>
        <SrcTag src={ev.src} />
      </span>
      <span style={{ color: 'var(--ink-4)', flex: 'none', display: 'flex' }}><Icon name="chevron" size={15} /></span>
    </button>
  )
}

function CalendarPanel({ calDays, onOpen }) {
  const list = calDays.slice(0, 4)
  return (
    <Panel eyebrow="Calendar" title="The week ahead" pad={16} bodyStyle={{ paddingTop: 6 }} data-testid="panel-calendar">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {list.length === 0 ? (
          <p style={{ fontFamily: 'var(--sans)', color: 'var(--ink-3)', fontSize: 13, padding: '8px 0' }}>No upcoming events.</p>
        ) : (
          list.map((d, di) => (
            <div key={d.for_date} style={{ marginTop: di === 0 ? 4 : 14 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '0 10px 4px', whiteSpace: 'nowrap' }}>
                <span className="eyebrow" style={{ color: di === 0 ? 'var(--ink-2)' : 'var(--ink-3)' }}>{d.label}</span>
              </div>
              {d.events.map(ev => <EventRow key={ev.id} ev={ev} onOpen={onOpen} />)}
            </div>
          ))
        )}
      </div>
    </Panel>
  )
}

function LoopsPanel({ loops }) {
  return (
    <Panel eyebrow="Open Loops" title="Threads to close" pad={16} data-testid="panel-loops"
      action={<span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{loops.length}</span>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {loops.length === 0 ? (
          <p style={{ fontFamily: 'var(--sans)', color: 'var(--ink-3)', fontSize: 14 }}>No open loops.</p>
        ) : (
          loops.map(l => (
            <div key={l.id} className="cx-row" style={{ alignItems: 'flex-start', padding: '9px 0 9px 14px' }}>
              {l.hot && <span className="cx-bar" />}
              <span style={{ color: l.hot ? 'var(--accent)' : 'var(--ink-4)', flex: 'none', marginTop: 1, display: 'flex' }}>
                <Icon name="loop" size={15} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)', lineHeight: 1.35 }}>{l.text}</div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{l.note}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </Panel>
  )
}

function TasksMini({ tasks, projects }) {
  const today = tasks.today
  const week = tasks.week.slice(0, 2)
  return (
    <Panel eyebrow="Tasks" title="Today & tomorrow" pad={16} data-testid="panel-tasks-mini">
      <div className="eyebrow" style={{ color: 'var(--ink-2)', marginBottom: 2 }}>Today</div>
      {today.map(t => <CockpitTaskRow key={t.id} task={t} projects={projects} />)}
      <hr className="cx-div" style={{ margin: '8px 0' }} />
      <div className="eyebrow" style={{ marginBottom: 2 }}>Tomorrow</div>
      {week.map(t => <CockpitTaskRow key={t.id} task={t} projects={projects} />)}
    </Panel>
  )
}

function ProtocolsPanel({ protocols }) {
  return (
    <Panel eyebrow="Protocols" title="What you're running" pad={16} data-testid="panel-protocols">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {protocols.length === 0 ? (
          <p style={{ fontFamily: 'var(--sans)', color: 'var(--ink-3)', fontSize: 14 }}>No protocols.</p>
        ) : (
          protocols.map(pr => (
            <div key={pr.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '9px 0' }}>
              <span style={{ color: 'var(--ink-4)', marginTop: 1, flex: 'none', display: 'flex' }}><Icon name="protocol" size={17} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)', lineHeight: 1.3 }}>{pr.title}</div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{pr.sub}</div>
              </div>
              <span className="eyebrow" style={{ flex: 'none', marginTop: 2 }}>{pr.kind}</span>
            </div>
          ))
        )}
      </div>
    </Panel>
  )
}

function PeoplePanel({ people }) {
  return (
    <Panel eyebrow="Relationships" title="The people" pad={16} data-testid="panel-people">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {people.length === 0 ? (
          <p style={{ fontFamily: 'var(--sans)', color: 'var(--ink-3)', fontSize: 14 }}>No relationships.</p>
        ) : (
          people.map((r, i) => (
            <div key={r.id}>
              {i > 0 && <hr className="cx-div" />}
              <div style={{ padding: '11px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{r.name}</span>
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 11.5, color: 'var(--ink-4)' }}>{r.rel}</span>
                  <span style={{ marginLeft: 'auto' }}><Temp value={r.temp} /></span>
                </div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.4 }}>{r.note}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </Panel>
  )
}

const KIND_LABEL = {
  note_triage: 'Notes',
  checklist_proposal: 'Checklist',
  recurring_due: 'Recurring',
  loop_nudge: 'Loop',
  brief_followup: 'Followup',
  other: 'Item',
}

function UpNextSheet({ staged: initialItems, onClose }) {
  const [items, setItems] = useState(initialItems)

  const dispatch = async (itemId, disposition) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'acting' } : i))
    if (!supabase) return
    await supabase.from('cos_session_requests')
      .insert({ scope: { staged_item_id: itemId, disposition } })
  }

  const runFull = async () => {
    if (!supabase) return
    await supabase.from('cos_session_requests').insert({})
    onClose()
  }

  return (
    <Sheet data-testid="up-next-sheet" onClose={onClose}>
      <SheetHead title="Up Next" onClose={onClose} />
      <div className="cx-scroll" style={{ padding: '14px 18px 22px' }}>
        {items.length === 0 && (
          <p style={{ fontFamily: 'var(--sans)', color: 'var(--ink-3)', fontSize: 14, margin: '8px 0' }}>
            No staged items — run a full session to plan your next one.
          </p>
        )}
        {items.map(item => (
          <div
            key={item.id}
            data-testid="up-next-item"
            style={{ padding: '14px 0', borderBottom: '1px solid var(--line)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'var(--sans)', fontSize: 14.5, fontWeight: 500, lineHeight: 1.3,
                color: item.status === 'acting' ? 'var(--ink-3)' : 'var(--ink)',
              }}>{item.title}</span>
              <span style={{
                fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 600,
                color: 'var(--ink-4)', background: 'var(--bg-sunken)',
                borderRadius: 5, padding: '1px 6px',
                letterSpacing: '0.04em', textTransform: 'uppercase', flex: 'none',
              }}>{KIND_LABEL[item.kind] || 'Item'}</span>
              {item.status === 'acting' && (
                <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--accent)', flex: 'none' }}>
                  acting…
                </span>
              )}
            </div>
            {item.detail && (
              <p style={{ margin: '0 0 10px', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.4 }}>
                {item.detail}
              </p>
            )}
            {item.dispositions && item.dispositions.length > 0 && item.status === 'staged' && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {item.dispositions.map(d => (
                  <button
                    key={d}
                    data-testid="disposition-btn"
                    onClick={() => dispatch(item.id, d)}
                    style={{
                      background: 'var(--bg-sunken)', border: '1px solid var(--line)',
                      borderRadius: 10, padding: '7px 14px', cursor: 'pointer',
                      fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500, color: 'var(--ink-2)',
                    }}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <button
          data-testid="up-next-full-session"
          onClick={runFull}
          style={{
            marginTop: 18, width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'var(--accent)', color: '#1f2a30', border: 'none',
            borderRadius: 12, padding: '13px 20px', cursor: 'pointer',
            fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600,
          }}
        >
          Run a full session
        </button>
      </div>
    </Sheet>
  )
}

function EventDetail({ ev, onClose }) {
  const [run, setRun] = useState(null)

  useEffect(() => {
    if (!supabase) return
    supabase.from('checklist_runs')
      .select('id, checklists(name), checklist_run_items(id, text, checked, sort_order)')
      .eq('calendar_event_id', ev.id)
      .eq('archived', false)
      .maybeSingle()
      .then(({ data }) => setRun(data || null))
  }, [ev.id])

  const toggleItem = async (itemId, current) => {
    setRun(prev => prev ? {
      ...prev,
      checklist_run_items: prev.checklist_run_items.map(i =>
        i.id === itemId ? { ...i, checked: !current } : i
      ),
    } : prev)
    if (supabase) await supabase.from('checklist_run_items').update({ checked: !current }).eq('id', itemId)
  }

  const items = run ? [...run.checklist_run_items].sort((a, b) => a.sort_order - b.sort_order) : []

  return (
    <Sheet data-testid="event-detail-sheet" onClose={onClose}>
      <SheetHead
        eyebrow={<SrcTag src={ev.src} />}
        title={ev.title}
        onClose={onClose}
        right={<div className="mono" style={{ fontSize: 13, color: 'var(--ink-2)', alignSelf: 'center', marginRight: 4 }}>{ev.time}</div>}
      />
      <div className="cx-scroll" style={{ padding: '18px 18px 22px' }}>
        <Field label="What it's about">{ev.about}</Field>
        <Field label="Prep">{ev.prep}</Field>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 140px' }}><Field label="Who">{ev.who}</Field></div>
        </div>
        {ev.thread && ev.thread !== '—' && (
          <div style={{ background: 'var(--bg-sunken)', border: '1px solid var(--line)', borderRadius: 12, padding: '14px 16px', marginTop: 2 }}>
            <div className="eyebrow" style={{ marginBottom: 7, color: 'var(--accent)' }}>The open thread</div>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16.5, lineHeight: 1.5, color: 'var(--ink-2)' }}>{ev.thread}</div>
          </div>
        )}
        {run && (
          <div data-testid="event-checklist" style={{ marginTop: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 10, color: 'var(--ink-2)' }}>
              Checklist — {run.checklists?.name}
            </div>
            {items.map(item => (
              <div key={item.id} className="cx-row" style={{ alignItems: 'center', padding: '9px 0' }}>
                <Check on={item.checked} onClick={() => toggleItem(item.id, item.checked)} />
                <div style={{
                  flex: 1, minWidth: 0,
                  fontFamily: 'var(--sans)', fontSize: 14.5, lineHeight: 1.3,
                  color: item.checked ? 'var(--ink-4)' : 'var(--ink)',
                  textDecoration: item.checked ? 'line-through' : 'none',
                  textDecorationColor: 'var(--ink-4)',
                }}>{item.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Sheet>
  )
}

export default function HomeSurface({ bp }) {
  const [loading, setLoading] = useState(true)
  const [brief, setBrief] = useState(null)
  const [calDays, setCalDays] = useState([])
  const [loops, setLoops] = useState([])
  const [protocols, setProtocols] = useState([])
  const [people, setPeople] = useState([])
  const [tasks, setTasks] = useState({ today: [], week: [] })
  const [projects, setProjects] = useState([])
  const [eventDetail, setEventDetail] = useState(null)
  const [staged, setStaged] = useState([])
  const [upNextOpen, setUpNextOpen] = useState(false)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const in3Days = new Date(today.getTime() + 3 * 86400000).toISOString().split('T')[0]

    Promise.all([
      supabase.from('brief').select('*').order('for_date', { ascending: false }).limit(1),
      supabase.from('calendar_events')
        .select('id, for_date, day_label, time, title, src, about, prep, who, thread')
        .gte('for_date', todayStr).lte('for_date', in3Days)
        .order('for_date').order('time'),
      supabase.from('open_loops').select('*').order('hot', { ascending: false }),
      supabase.from('protocols').select('*'),
      supabase.from('people').select('*'),
      supabase.from('tasks').select('*').eq('done', false).in('horizon', ['today', 'week']).order('horizon'),
      supabase.from('projects').select('id, name'),
      supabase.from('staged_items')
        .select('id, kind, title, detail, dispositions, status')
        .in('status', ['staged', 'acting'])
        .order('created_at'),
    ])
      .then(([briefRes, calRes, loopsRes, protosRes, peopleRes, tasksRes, projRes, stagedRes]) => {
        setBrief(briefRes.data?.[0] || null)

        const groups = []
        ;(calRes.data || []).forEach(ev => {
          const g = groups.find(x => x.for_date === ev.for_date)
          if (g) g.events.push(ev)
          else groups.push({ for_date: ev.for_date, label: ev.day_label, events: [ev] })
        })
        setCalDays(groups)

        setLoops(loopsRes.data || [])
        setProtocols(protosRes.data || [])
        setPeople(peopleRes.data || [])

        const all = tasksRes.data || []
        setTasks({
          today: all.filter(t => t.horizon === 'today'),
          week: all.filter(t => t.horizon === 'week'),
        })

        setProjects(projRes.data || [])
        setStaged(stagedRes.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div data-testid="cockpit" style={{ color: 'var(--ink-3)', fontFamily: 'var(--sans)', fontSize: 14, padding: 16 }}>
        Loading…
      </div>
    )
  }

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).toUpperCase()

  const stagedCount = staged.filter(s => s.status === 'staged').length
  const upNextNudge = stagedCount > 0 ? (
    <UpNextNudge count={stagedCount} onClick={() => setUpNextOpen(true)} />
  ) : null
  const upNextSheet = upNextOpen ? (
    <UpNextSheet staged={staged} onClose={() => setUpNextOpen(false)} />
  ) : null

  const detailSheet = eventDetail ? (
    <EventDetail ev={eventDetail} onClose={() => setEventDetail(null)} />
  ) : null

  if (bp === 'iphone') {
    return (
      <div data-testid="cockpit" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <BriefBlock brief={brief} todayLabel={todayLabel} />
        {upNextNudge}
        <CalendarPanel calDays={calDays} onOpen={setEventDetail} />
        <TasksMini tasks={tasks} projects={projects} />
        <LoopsPanel loops={loops} />
        {detailSheet}
        {upNextSheet}
      </div>
    )
  }

  if (bp === 'ipad') {
    return (
      <div data-testid="cockpit" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <BriefBlock brief={brief} todayLabel={todayLabel} />
        {upNextNudge}
        <div style={{ display: 'grid', gridTemplateColumns: '1.18fr 1fr 1fr', gap: 16, alignItems: 'start' }}>
          <CalendarPanel calDays={calDays} onOpen={setEventDetail} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <LoopsPanel loops={loops} />
            <TasksMini tasks={tasks} projects={projects} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ProtocolsPanel protocols={protocols} />
            <PeoplePanel people={people} />
          </div>
        </div>
        {detailSheet}
        {upNextSheet}
      </div>
    )
  }

  return (
    <div data-testid="cockpit" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <BriefBlock brief={brief} todayLabel={todayLabel} />
      {upNextNudge}
      <div style={{ display: 'grid', gridTemplateColumns: '1.08fr 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CalendarPanel calDays={calDays} onOpen={setEventDetail} />
          <PeoplePanel people={people} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <LoopsPanel loops={loops} />
          <TasksMini tasks={tasks} projects={projects} />
          <ProtocolsPanel protocols={protocols} />
        </div>
      </div>
      {detailSheet}
      {upNextSheet}
    </div>
  )
}
