'use client'

import { useEffect, useMemo, useState } from 'react'
import { states } from '@/lib/states'
import type { Roadmap, RoadmapItem } from '@/lib/roadmap'

type FormState = {
  status: string
  state: string
  hasSSN: boolean
  hasITIN: boolean
  hasBankAccount: boolean
  hasCreditCard: boolean
  employed: boolean
  paidOnBooks: boolean
  hasCar: boolean
  hasKids: boolean
  age18to25Male: boolean
  hasForeignAccounts: boolean
  needsHealthCoverage: boolean
  eadExpiry: string
}

const DEFAULT: FormState = {
  status: 'unsure',
  state: 'CA',
  hasSSN: false,
  hasITIN: false,
  hasBankAccount: false,
  hasCreditCard: false,
  employed: false,
  paidOnBooks: true,
  hasCar: false,
  hasKids: false,
  age18to25Male: false,
  hasForeignAccounts: false,
  needsHealthCoverage: true,
  eadExpiry: '',
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'lpr', label: 'Green card holder (lawful permanent resident)' },
  { value: 'naturalized', label: 'US citizen (naturalized)' },
  { value: 'work-visa', label: 'Work visa (H-1B, L-1, O-1, TN…)' },
  { value: 'student', label: 'Student (F-1, J-1, M-1)' },
  { value: 'asylum-pending', label: 'Asylum case pending' },
  { value: 'refugee', label: 'Refugee' },
  { value: 'parolee', label: 'Humanitarian parolee' },
  { value: 'tps', label: 'Temporary Protected Status (TPS)' },
  { value: 'daca', label: 'DACA recipient' },
  { value: 'undocumented', label: 'No current status / undocumented' },
  { value: 'unsure', label: 'Not sure / prefer not to say' },
]

export function RoadmapWizard() {
  const [form, setForm] = useState<FormState>(DEFAULT)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const savedForm = window.localStorage.getItem('settlesafe:profile')
      if (savedForm) setForm({ ...DEFAULT, ...(JSON.parse(savedForm) as Partial<FormState>) })
      const savedDone = window.localStorage.getItem('settlesafe:done')
      if (savedDone) setDone(JSON.parse(savedDone) as Record<string, boolean>)
    } catch {
      /* ignore corrupt storage */
    }
  }, [])

  // Reload the stored roadmap on first paint if the profile was saved before.
  useEffect(() => {
    if (!form.state) return
    const saved = window.localStorage.getItem('settlesafe:profile')
    if (saved) void generate(form, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function generate(next: FormState, silent = false) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(next),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Could not build the plan.')
        return
      }
      setRoadmap(json.roadmap as Roadmap)
      if (!silent) window.localStorage.setItem('settlesafe:profile', JSON.stringify(next))
      window.localStorage.setItem('settlesafe:profile', JSON.stringify(next))
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  function toggleDone(item: RoadmapItem) {
    const next = { ...done, [item.trackId]: !done[item.trackId] }
    setDone(next)
    window.localStorage.setItem('settlesafe:done', JSON.stringify(next))
  }

  const progress = useMemo(() => {
    if (!roadmap) return { total: 0, done: 0 }
    const items = roadmap.phases.flatMap((p) => p.items)
    return { total: items.length, done: items.filter((i) => done[i.trackId]).length }
  }, [roadmap, done])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="grid grid-2" style={{ alignItems: 'start' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.15rem' }}>A few questions</h2>
        <p className="small muted">
          Nothing is sent to a server we control and nothing is stored after your browser closes — the plan is generated
          from your answers and kept in your browser only.
        </p>

        <div className="field">
          <label htmlFor="status">Your current immigration status</label>
          <select id="status" value={form.status} onChange={(e) => set('status', e.target.value)}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="state">Your state</label>
          <select id="state" value={form.state} onChange={(e) => set('state', e.target.value)}>
            {states.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {(form.status === 'asylum-pending' || form.status === 'tps' || form.status === 'parolee' || form.status === 'student') && (
          <div className="field">
            <label htmlFor="ead">
              Work permit expiry date {form.status === 'student' ? '(OPT end date if you know it)' : ''}
            </label>
            <input id="ead" type="date" value={form.eadExpiry} onChange={(e) => set('eadExpiry', e.target.value)} />
            <p className="tiny muted" style={{ marginTop: 5, marginBottom: 0 }}>
              This is the date that costs the most money if it slips. Renewals filed on or after October 30, 2025 no
              longer get the automatic extension.
            </p>
          </div>
        )}

        <fieldset style={{ border: 0, padding: 0, margin: '6px 0 14px' }}>
          <legend style={{ fontWeight: 650, fontSize: '0.9rem', marginBottom: 8, color: 'var(--ink-2)', padding: 0 }}>
            Where you are right now
          </legend>
          {(
            [
              ['hasSSN', 'I have a Social Security number'],
              ['hasITIN', 'I have an ITIN'],
              ['hasBankAccount', 'I have a US bank or credit union account'],
              ['hasCreditCard', 'I have a US credit card or loan in my name'],
              ['employed', 'I am working right now'],
              ['paidOnBooks', 'My work is reported — pay stubs, W-2, taxes withheld'],
              ['hasCar', 'I have a car'],
              ['hasKids', 'I have children living with me'],
              ['hasForeignAccounts', 'I still have bank accounts or investments in my home country'],
              ['needsHealthCoverage', 'I need health coverage'],
              ['age18to25Male', 'I am male and between 18 and 25'],
            ] as [keyof FormState, string][]
          ).map(([key, label]) => (
            <label className="check" key={key} htmlFor={key}>
              <input
                id={key}
                type="checkbox"
                checked={Boolean(form[key])}
                onChange={(e) => set(key, e.target.checked as never)}
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>

        <button className="btn" onClick={() => void generate(form)} disabled={loading}>
          {loading ? 'Building…' : roadmap ? 'Rebuild my plan' : 'Build my plan'}
        </button>
        {error ? (
          <p className="small" style={{ color: 'var(--danger)', marginTop: 10, marginBottom: 0 }}>
            {error}
          </p>
        ) : null}
      </div>

      <div>
        {!roadmap ? (
          <div className="card">
            <h2 style={{ fontSize: '1.15rem' }}>What you get</h2>
            <p className="small">
              A dated plan instead of a list of worries: what to do in the next two weeks, what opens options in the
              first year, and what to put on a calendar forever.
            </p>
            <ul className="small">
              <li>Deadlines that actually cost money, like work-permit renewals.</li>
              <li>Zero-cost items that take ten minutes and prevent years of problems.</li>
              <li>Alerts specific to your status, including rules that changed recently.</li>
              <li>The official source for every step, so you can verify it yourself.</li>
              <li>Nothing that requires trusting an anonymous "agent".</li>
            </ul>
          </div>
        ) : (
          <div>
            <div className="card progress-card">
              <div className="spread">
                <div>
                  <div className="progress-count mono">
                    {progress.done}
                    <span className="muted">/{progress.total}</span>
                  </div>
                  <div className="small muted">steps marked done</div>
                </div>
                <div className="small muted" style={{ textAlign: 'right' }}>
                  {roadmap.stateName ? `${roadmap.stateName} · ` : ''}
                  generated {new Date(roadmap.generatedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="meter meter-brand" aria-hidden="true">
                <span style={{ width: `${progress.total ? Math.round((progress.done / progress.total) * 100) : 0}%` }} />
              </div>
            </div>

            {roadmap.alerts.map((a) => (
              <div key={a.id} className={`alert ${a.severity === 'high' ? 'alert-high' : a.severity === 'info' ? 'alert-info' : ''}`}>
                <strong>{a.title}</strong>
                <p className="small" style={{ margin: '5px 0 0' }}>
                  {a.detail}
                </p>
                {a.link ? (
                  <p className="tiny" style={{ margin: '6px 0 0' }}>
                    <a href={a.link.url} target="_blank" rel="noreferrer noopener">
                      {a.link.name}
                    </a>
                  </p>
                ) : null}
              </div>
            ))}

            {roadmap.phases.map((phase) =>
              phase.items.length ? (
                <section key={phase.id} style={{ marginTop: 18 }}>
                  <h2 style={{ fontSize: '1.12rem' }}>{phase.label}</h2>
                  <p className="small muted">{phase.blurb}</p>
                  {phase.items.map((item) => (
                    <div key={item.id} className={`roadmap-item${done[item.trackId] ? ' done' : ''}`}>
                      <div className="row" style={{ alignItems: 'flex-start', gap: 10 }}>
                        <input
                          type="checkbox"
                          checked={Boolean(done[item.trackId])}
                          onChange={() => toggleDone(item)}
                          aria-label={`Mark done: ${item.title}`}
                          style={{ marginTop: 5, width: 17, height: 17, flex: 'none' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="spread" style={{ gap: 8 }}>
                            <span className="rm-title">{item.title}</span>
                            <span className="match-badges">
                              <span className={`badge ${item.urgency === 'now' ? 'badge-danger' : item.urgency === 'recurring' ? 'badge-neutral' : 'badge-brand'}`}>
                                {item.urgency === 'now'
                                  ? 'do now'
                                  : item.urgency === 'soon'
                                    ? 'within 90 days'
                                    : item.urgency === 'this-year'
                                      ? 'first year'
                                      : 'recurring'}
                              </span>{' '}
                              <span className="badge badge-neutral">{item.cost}</span>
                            </span>
                          </div>
                          <p className="rm-why">{item.why}</p>
                          <div className="rm-action">
                            <strong>Do this:</strong> {item.action}
                          </div>
                          {item.links.length ? (
                            <p className="tiny" style={{ margin: '8px 0 0' }}>
                              Official:{' '}
                              {item.links.map((l, i) => (
                                <span key={l.url}>
                                  {i > 0 ? ' · ' : ''}
                                  <a href={l.url} target="_blank" rel="noreferrer noopener">
                                    {l.name}
                                  </a>
                                </span>
                              ))}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  )
}
