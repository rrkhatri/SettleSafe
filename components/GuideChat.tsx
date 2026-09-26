'use client'

import { useEffect, useRef, useState } from 'react'
import type { Answer } from '@/lib/types'
import { AnswerView } from './AnswerView'
import { states } from '@/lib/states'

type Turn = { id: string; question: string; answer?: Answer; error?: string }

const SUGGESTIONS = [
  'My landlord wants 2 months deposit in cash with no receipt. Is that normal?',
  'How do I build credit with no SSN and no credit history?',
  'I got a text saying my package is held and I need to pay $2. Do I pay it?',
  'My employer pays me cash and says overtime is unpaid. What are my rights?',
  'My work permit expires in 4 months. What is the deadline to renew?',
  'How is a hospital bill different from a doctor bill, and what do I do if I cannot pay?',
]

export function GuideChat({ initialQuestion }: { initialQuestion?: string }) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [loading, setLoading] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)
  const askedOnce = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem('settlesafe:state')
    if (saved) setStateCode(saved)
  }, [])

  useEffect(() => {
    if (stateCode) window.localStorage.setItem('settlesafe:state', stateCode)
  }, [stateCode])

  async function ask(question: string) {
    const clean = question.trim()
    if (!clean || loading) return
    const id = `${Date.now()}`
    setTurns((prev) => [...prev, { id, question: clean }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: clean, stateCode: stateCode || undefined }),
      })
      const json = await res.json()
      setTurns((prev) =>
        prev.map((t) =>
          t.id === id
            ? res.ok
              ? { ...t, answer: json.answer as Answer }
              : { ...t, error: json.error ?? 'Something went wrong.' }
            : t
        )
      )
    } catch {
      setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, error: 'Network error. Try again.' } : t)))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuestion && !askedOnce.current) {
      askedOnce.current = true
      void ask(initialQuestion)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion])

  useEffect(() => {
    threadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [turns.length, loading])

  return (
    <div>
      <div className="card">
        <div className="field" style={{ marginBottom: 10, maxWidth: 320 }}>
          <label htmlFor="state-select">Your state (optional — makes answers specific)</label>
          <select id="state-select" value={stateCode} onChange={(e) => setStateCode(e.target.value)}>
            <option value="">Prefer not to say</option>
            {states.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void ask(input)
          }}
        >
          <label htmlFor="q">Ask anything about money, rent, taxes, paperwork or a suspicious message</label>
          <textarea
            id="q"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Example: I just moved and my landlord says the deposit is non-refundable. Is that legal in my state?"
            style={{ minHeight: 120 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                void ask(input)
              }
            }}
          />
          <div className="row" style={{ marginTop: 10, justifyContent: 'space-between' }}>
            <button className="btn" type="submit" disabled={loading || input.trim().length < 3}>
              {loading ? 'Working…' : 'Ask the guide'}
            </button>
            <span className="tiny muted">Press Ctrl/⌘ + Enter to send</span>
          </div>
        </form>
        <div className="suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="chip" onClick={() => void ask(s)} disabled={loading}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div ref={threadRef} style={{ marginTop: 22 }}>
        <div className="thread">
          {turns.map((t) => (
            <article key={t.id}>
              <div className="q-bubble">{t.question}</div>
              <div style={{ marginTop: 12 }}>
                {t.answer ? <AnswerView answer={t.answer} /> : null}
                {t.error ? (
                  <section className="block block-danger">
                    <div className="block-head">
                      <h3>That did not work</h3>
                    </div>
                    <div className="block-body">
                      <p style={{ marginBottom: 0 }}>{t.error}</p>
                    </div>
                  </section>
                ) : null}
                {!t.answer && !t.error ? (
                  <div className="thinking">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                    <span>Checking the library and the official sources…</span>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
