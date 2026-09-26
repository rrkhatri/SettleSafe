import Link from 'next/link'
import { notFound } from 'next/navigation'
import { categoryMeta, topicBySlug, topics } from '@/lib/knowledge'
import { scamRuleById } from '@/lib/scams'

export function generateStaticParams() {
  return topics.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const topic = topicBySlug.get(slug)
  if (!topic) return { title: 'Not found | SettleSafe' }
  return { title: `${topic.title} | SettleSafe`, description: topic.oneLiner }
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const topic = topicBySlug.get(slug)
  if (!topic) notFound()

  const related = topic.relatedScamIds.map((id) => scamRuleById.get(id)).filter(Boolean)
  const volatile = topic.facts.filter((f) => f.volatility === 'volatile')

  return (
    <div className="wrap">
      <header className="page-head">
        <p className="breadcrumb">
          <Link href="/library">Library</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/library?category=${topic.category}`}>{categoryMeta[topic.category].label}</Link>
        </p>
        <h1>{topic.title}</h1>
        <p className="lede">{topic.oneLiner}</p>
        <p className="tiny muted" style={{ marginBottom: 0 }}>
          {topic.facts.length} dated facts · {topic.steps.length} steps · {topic.traps.length} places people lose money
          · {topic.officialLinks.length} official links
        </p>
      </header>

      {volatile.length ? (
        <div className="alert alert-high" style={{ maxWidth: 880 }}>
          <strong>Part of this page is a moving target.</strong>
          <p className="small" style={{ margin: '5px 0 0' }}>
            {volatile.length} of the facts below were flagged as recently changed, in litigation, or phasing in. Each one
            shows its check date — verify at the source before relying on it for something expensive.
          </p>
        </div>
      ) : null}

      <div className="grid grid-2 prose" style={{ alignItems: 'start', marginTop: 22, paddingBottom: 46 }}>
        <div>
          {topic.explain.map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          <h2 style={{ marginTop: 26 }}>What to do, in order</h2>
          <ol>
            {topic.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>

          {topic.timeline?.length ? (
            <>
              <h2 style={{ marginTop: 26 }}>Timeline</h2>
              <ul>
                {topic.timeline.map((t, i) => (
                  <li key={i}>
                    <strong>{t.when}:</strong> {t.what}
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <h2 style={{ marginTop: 26 }}>Where people lose money here</h2>
          <ul>
            {topic.traps.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>

          {topic.questionsToAsk.length ? (
            <>
              <h2 style={{ marginTop: 26 }}>Say these out loud before you pay or sign anything</h2>
              <ul>
                {topic.questionsToAsk.map((q, i) => (
                  <li key={i}>&ldquo;{q}&rdquo;</li>
                ))}
              </ul>
            </>
          ) : null}

          {related.length ? (
            <>
              <h2 style={{ marginTop: 26 }}>The schemes attached to this</h2>
              {related.map((r) =>
                r ? (
                  <div className="block block-danger" key={r.id}>
                    <div className="block-head">
                      <h3>{r.name}</h3>
                    </div>
                    <div className="block-body">
                      <p style={{ marginBottom: 6 }}>{r.what}</p>
                      <p style={{ marginBottom: 6 }}>
                        <strong>What they want:</strong> {r.theAsk}
                      </p>
                      <ul>
                        {r.never.map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null
              )}
              <p className="small">
                <Link href="/radar">Check a message with Scam Radar →</Link>
              </p>
            </>
          ) : null}
        </div>

        <aside className="sidebar">
          <div className="card">
            <h3>Why this one bites immigrants specifically</h3>
            <p className="small" style={{ marginBottom: 0 }}>
              {topic.whyItMatters}
            </p>
          </div>

          <div className="card">
            <h3>Facts, with dates</h3>
            <ul className="facts">
              {topic.facts.map((f) => (
                <li key={f.id}>
                  <span className="fact-claim">{f.claim}</span>
                  {f.detail ? <span className="fact-claim"> {f.detail}</span> : null}
                  <span className="fact-meta">
                    Checked {f.asOf} ·{' '}
                    <a href={f.source.url} target="_blank" rel="noreferrer noopener">
                      {f.source.name}
                    </a>
                    {f.volatility === 'volatile' ? <span className="volatile"> · recently changing</span> : null}
                    {f.volatility === 'annual' ? ' · set annually' : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3>The words you will hear</h3>
            <dl style={{ margin: 0 }}>
              {topic.jargon.map((j) => (
                <div key={j.term} style={{ marginBottom: 12 }}>
                  <dt style={{ fontWeight: 680 }}>{j.term}</dt>
                  <dd className="small" style={{ margin: '2px 0 0', color: 'var(--ink-2)' }}>
                    {j.plain}
                    {j.watchOut ? (
                      <>
                        {' '}
                        <span style={{ color: 'var(--danger)' }}>Watch out: {j.watchOut}</span>
                      </>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card">
            <h3>Official sources</h3>
            <ul className="small" style={{ marginBottom: 0 }}>
              {topic.officialLinks.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noreferrer noopener">
                    {l.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3>Still stuck?</h3>
            <p className="small" style={{ marginBottom: 8 }}>
              Free help exists and it is not charity for other people — it is the normal path for everyone who does not
              have $400 an hour for a lawyer.
            </p>
            <ul className="small" style={{ marginBottom: 0 }}>
              <li>
                <a href="https://www.usa.gov/legal-aid" target="_blank" rel="noreferrer noopener">
                  Legal aid
                </a>{' '}
                for housing, wages and benefits problems
              </li>
              <li>
                <a href="https://www.justice.gov/eoir/list-pro-bono-legal-service-providers" target="_blank" rel="noreferrer noopener">
                  EOIR pro bono list
                </a>{' '}
                for immigration court
              </li>
              <li>
                <a href="https://www.irs.gov/individuals/free-tax-return-preparation-for-you-by-volunteers" target="_blank" rel="noreferrer noopener">
                  VITA
                </a>{' '}
                for free tax preparation
              </li>
              <li>
                Call <strong>211</strong> for local services in many languages
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
