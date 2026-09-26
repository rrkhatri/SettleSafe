'use client'

import { useState } from 'react'
import type { ScamVerdict } from '@/lib/types'

const EXAMPLES: { label: string; text: string }[] = [
  {
    label: 'Government call',
    text: `This is Officer Ramirez from the Social Security Administration. Your Social Security Number has been suspended due to suspicious activity and a federal case has been opened in your name. There is an arrest warrant for your arrest unless you verify your identity today. Press 1 to speak to a federal officer to avoid deportation. Payment of the release fee must be made immediately using gift cards. Do not tell anyone about this call.`,
  },
  {
    label: 'Job offer',
    text: `Congratulations! You are hired for a remote position, $950 per week, no experience needed. Your first task: we will send you a check to purchase your home office equipment. Deposit the check, buy the equipment using gift cards and send us the codes, keep a 10% commission. Contact me on WhatsApp to start immediately.`,
  },
  {
    label: 'Apartment',
    text: `Hi, the apartment is still available, $900 month to month, no credit check needed. I am out of the country as a missionary so my cousin handles keys. Send the deposit and first month via Zelle or bitcoin to reserve the unit and I will mail the keys. Many people are asking so please pay today.`,
  },
  {
    label: 'Utility call',
    text: `Your electric service will be disconnected within 45 minutes because of an unpaid balance. A reconnection fee of $480 must be paid now via prepaid card or money pak. Do not contact the bank, stay on the line and we will guide you through the payment.`,
  },
  {
    label: 'Real-looking notice',
    text: `Department of Homeland Security, U.S. Citizenship and Immigration Services. Notice of Action, Form I-797C. Receipt Number: IOE0123456789. Your application was received and is being processed. You will be notified if further information is needed. Please visit uscis.gov/casestatus to check your case. Do not reply to this notice by mail unless instructed.`,
  },
]

export function ScamRadar() {
  const [text, setText] = useState('')
  const [verdict, setVerdict] = useState<ScamVerdict | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function scan() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Could not scan that.')
        setVerdict(null)
      } else {
        setVerdict(json.verdict as ScamVerdict)
      }
    } catch {
      setError('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="card">
        <label htmlFor="scan-text">
          Paste the message, offer, letter or listing — in any language. We only look at the words, and nothing is stored.
        </label>
        <textarea
          id="scan-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste a text message, email, job offer, lease clause, or a letter you received…"
        />
        <div className="row" style={{ marginTop: 10, justifyContent: 'space-between' }}>
          <div className="row">
            <button className="btn" onClick={scan} disabled={loading || text.trim().length < 15}>
              {loading ? 'Scanning…' : 'Check for red flags'}
            </button>
            {text ? (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setText('')
                  setVerdict(null)
                  setError('')
                }}
              >
                Clear
              </button>
            ) : null}
          </div>
          <span className="tiny muted">{text.trim().length} characters</span>
        </div>
        {error ? (
          <p className="small" style={{ color: 'var(--danger)', marginTop: 10, marginBottom: 0 }}>
            {error}
          </p>
        ) : null}
      </div>

      <div style={{ marginTop: 14 }}>
        <p className="small muted" style={{ marginBottom: 6 }}>
          Or try one of these examples:
        </p>
        <div className="chips">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              className="chip"
              onClick={() => {
                setText(ex.text)
                setVerdict(null)
                setError('')
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {verdict ? <Verdict verdict={verdict} /> : null}
    </div>
  )
}

function Verdict({ verdict }: { verdict: ScamVerdict }) {
  const label = verdict.looksOfficial
    ? 'This may be genuine — verify the identifiers before you act on it'
    : verdict.severity === 'red'
      ? 'High risk — treat this as a scam until you prove otherwise'
      : verdict.severity === 'orange'
        ? 'Suspicious — verify before you respond'
        : 'No strong pattern matched — still verify'

  const cls = verdict.severity === 'red' ? 'verdict-red' : verdict.severity === 'orange' ? 'verdict-orange' : 'verdict-yellow'
  const meterCls = verdict.severity === 'red' ? 'meter-red' : verdict.severity === 'orange' ? 'meter-orange' : 'meter-yellow'

  return (
    <div style={{ marginTop: 20 }}>
      <div className={`verdict ${cls}`}>
        <div className="spread">
          <h2 style={{ marginBottom: 0, fontSize: '1.2rem' }}>{label}</h2>
          <span className="badge badge-neutral mono">risk signals: {verdict.score}/100</span>
        </div>
        <div className={`meter ${meterCls}`} aria-hidden="true">
          <span style={{ width: `${Math.max(6, verdict.score)}%` }} />
        </div>
        <p className="tiny muted" style={{ marginBottom: 10 }}>
          This is not a probability. It counts how many independent red flags stacked up, weighted by how much they cost
          people in real cases.
        </p>
        <p style={{ marginBottom: 0 }}>{verdict.summary}</p>
      </div>

      {verdict.matches.length > 0 ? (
        <div className="grid grid-2">
          {verdict.matches.map((m) => (
            <section key={m.ruleId} className="block block-danger">
              <div className="block-head">
                <h3>{m.name}</h3>
              </div>
              <div className="block-body">
                <p style={{ marginBottom: 6 }}>{m.what}</p>
                <p style={{ marginBottom: 6 }}>
                  <strong>Why it works on people new to the US:</strong> {m.whyItWorks}
                </p>
                <p style={{ marginBottom: 6 }}>
                  <strong>What they want:</strong> {m.theAsk}
                </p>
                {m.never.length ? (
                  <>
                    <p style={{ marginBottom: 4 }}>
                      <strong>Never:</strong>
                    </p>
                    <ul>
                      {m.never.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {m.whatToDo.length ? (
                  <>
                    <p style={{ marginBottom: 4 }}>
                      <strong>Do:</strong>
                    </p>
                    <ul>
                      {m.whatToDo.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {m.reportTo.length ? (
                  <p className="tiny" style={{ marginBottom: 0 }}>
                    Report:{' '}
                    {m.reportTo.map((r, i) => (
                      <span key={r.url}>
                        {i > 0 ? ' · ' : ''}
                        <a href={r.url} target="_blank" rel="noreferrer noopener">
                          {r.name}
                        </a>
                      </span>
                    ))}
                  </p>
                ) : null}
                {m.evidence.length ? (
                  <div>
                    {m.evidence.map((e, i) => (
                      <div className="evidence" key={i}>
                        {e}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      ) : null}

      {verdict.paymentRisks.length ? (
        <section className="block block-danger">
          <div className="block-head">
            <h3>How they want to be paid — this is the part that empties accounts</h3>
          </div>
          <div className="block-body">
            <ul>
              {verdict.paymentRisks.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="block">
        <div className="block-head">
          <h3>Do this next</h3>
        </div>
        <div className="block-body">
          <ul>
            {verdict.nextSteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </section>

      {verdict.benign.length ? (
        <section className="block block-ok">
          <div className="block-head">
            <h3>Details here that look genuinely official</h3>
          </div>
          <div className="block-body">
            <ul>
              {verdict.benign.map((b, i) => (
                <li key={i}>
                  <strong>{b.name}.</strong> {b.why}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="block">
        <div className="block-head">
          <h3>What we cannot tell you</h3>
        </div>
        <div className="block-body">
          <ul>
            {verdict.limitations.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
