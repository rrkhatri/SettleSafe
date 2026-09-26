import Link from 'next/link'
import { ScamRadar } from '@/components/ScamRadar'
import { scamRules } from '@/lib/scams'

export const metadata = {
  title: 'Scam Radar — check any message before you pay | SettleSafe',
}

export default function RadarPage() {
  return (
    <>
      <div className="wrap">
        <header className="page-head page-head-rule">
        <p className="eyebrow">Protect</p>
        <h1>Scam Radar</h1>
        <p className="lede">
          Fraud aimed at immigrants is scripted, and the script barely changes: they know something true about you, they
          create a deadline, they move you to a private channel, and they ask for payment in a way that cannot be
          reversed. Paste the message and we will tell you which script it matches.
        </p>
        <p className="status-strip">
          <span className="status-dot status-dot-off" aria-hidden="true" />
          <span>
            Matching against {scamRules.length} named schemes · nothing you paste is stored or sent anywhere except this
            site&apos;s own checker
          </span>
        </p>
      </header>

      <ScamRadar />

      <div style={{ height: 46 }} />
    </div>

    <div className="band">
      <div className="wrap section">
        <h2>If money has already left</h2>
        <div className="grid grid-2">
        <div className="card">
          <h3>First hour — do these in order</h3>
          <ol className="small">
            <li>
              <strong>Call your bank or card issuer</strong> and use the words &ldquo;fraudulent transfer&rdquo;. Speed
              is the only real defense; some payment types have a short recall window.
            </li>
            <li>
              <strong>Report to the platform</strong> — the app or exchange used — and ask them to freeze the
              receiving account.
            </li>
            <li>
              <strong>Report at <a href="https://reportfraud.ftc.gov/" target="_blank" rel="noreferrer noopener">ReportFraud.ftc.gov</a></strong>, 
              and at <a href="https://www.ic3.gov/" target="_blank" rel="noreferrer noopener">IC3.gov</a> if money went
              by wire, crypto or a payment app.
            </li>
            <li>
              <strong>If personal information was shared</strong> (SSN, passport photo, card details), follow the
              personalized recovery plan at{' '}
              <a href="https://www.identitytheft.gov/" target="_blank" rel="noreferrer noopener">
                IdentityTheft.gov
              </a>{' '}
              and place free credit freezes.
            </li>
            <li>
              <strong>Change your passwords</strong> and turn on two-factor authentication, starting with email and
              banking.
            </li>
          </ol>
        </div>
        <div className="card">
          <h3>Do not do these things</h3>
          <ul className="small">
            <li>Do not send a &ldquo;recovery fee&rdquo; to anyone promising to get your money back. Recovery-fee scams target victims twice.</li>
            <li>Do not delete the messages. Screenshots and headers are evidence.</li>
            <li>Do not agree to a payment plan with a caller who contacted you first, without written verification of the debt.</li>
            <li>Do not let shame stop you reporting it. Under-reporting is the scammer&apos;s business model.</li>
          </ul>
          <p className="small muted" style={{ marginBottom: 0 }}>
            In the US, only a fraction of fraud gets reported at all, which is why the schemes keep working.
          </p>
        </div>
        </div>
      </div>
    </div>

    <div className="wrap section">
      <div className="section-head">
        <div>
          <h2>The named schemes, A to Z</h2>
          <p className="small muted narrow">
            Read them once. Recognition is faster than analysis when you are under pressure.
          </p>
        </div>
      </div>
      <p className="small muted">Read them once. Recognition is faster than analysis when you are under pressure.</p>
      <div className="grid grid-2">
        {scamRules
          .slice()
          .sort((a, b) => b.weight - a.weight)
          .map((r) => (
            <details key={r.id}>
              <summary>{r.name}</summary>
              <p className="small">
                <strong>What it is.</strong> {r.what}
              </p>
              <p className="small">
                <strong>Why it works on people new here.</strong> {r.whyItWorks}
              </p>
              <p className="small">
                <strong>The ask.</strong> {r.theAsk}
              </p>
              {r.relatedTopicId ? null : null}
              <p className="tiny muted" style={{ marginBottom: 0 }}>
                Report:{' '}
                {r.reportTo.map((x, i) => (
                  <span key={x.url}>
                    {i > 0 ? ' · ' : ''}
                    <a href={x.url} target="_blank" rel="noreferrer noopener">
                      {x.name}
                    </a>
                  </span>
                ))}
              </p>
            </details>
          ))}
      </div>

      <p className="small" style={{ marginTop: 20 }}>
        Want the version with examples and the psychology spelled out? Read{' '}
        <Link href="/library/seven-rules-that-stop-scams">Seven rules that stop almost every scam</Link> and{' '}
        <Link href="/library/never-move-money-for-someone">The &ldquo;job&rdquo; that makes you a criminal</Link>.
      </p>
      </div>
    </>
  )
}
