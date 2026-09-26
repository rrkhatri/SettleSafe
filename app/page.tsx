import Link from 'next/link'
import { libraryStats, topics, categoryMeta, oldestFactDate } from '@/lib/knowledge'
import { scamRules } from '@/lib/scams'
import { states } from '@/lib/states'
import { Icon, type IconName } from '@/components/Icon'

const CATEGORY_ICON: Record<string, IconName> = {
  paperwork: 'doc',
  money: 'card',
  home: 'home',
  health: 'medical',
  work: 'briefcase',
  safety: 'shield-alert',
}

export default function HomePage() {
  const stats = libraryStats()

  const volatile = topics
    .flatMap((t) => t.facts.filter((f) => f.volatility === 'volatile').map((f) => ({ ...f, topic: t })))
    .slice(0, 6)

  const recentScams = scamRules
    .slice()
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6)

  return (
    <div className="wrap section">
      <section className="hero-banner">
        <div className="hero-grid">
          <div style={{ maxWidth: '58ch' }}>
            <span className="hero-pill">
              <Icon name="sparkle" className="icon-sm" />
              Built for people who had to learn this the hard way
            </span>
            <h1 style={{ marginTop: 14 }}>Settling in America, without the trial-and-error bills.</h1>
            <p className="lede">
              Rent, taxes, credit, insurance and paperwork explained in plain language — with the date and the official
              source attached to every single claim. Paste any suspicious message and get a straight answer about what
              it is trying to get from you.
            </p>
            <div className="row hero-actions">
              <Link className="btn" href="/guide">
                Ask the guide
              </Link>
              <Link className="btn btn-ghost" href="/radar">
                Check a message for scams
              </Link>
              <Link className="btn btn-ghost" href="/roadmap">
                Build my plan
              </Link>
            </div>
          </div>

          <div className="hero-side">
            <span className="hero-side-icon">
              <Icon name="verified" className="icon-lg" />
            </span>
            <div>
              <p className="hero-side-label">Live legal baseline</p>
              <p className="hero-side-value">Sourced from federal &amp; state agencies</p>
            </div>
          </div>
        </div>
      </section>

      <section className="stat-grid" style={{ marginTop: 18 }}>
        <div className="stat">
          <span className="stat-icon">
            <Icon name="book" />
          </span>
          <div className="stat-value">{stats.topicCount}</div>
          <div className="stat-label">vetted guides, written for first-year residents</div>
        </div>
        <div className="stat">
          <span className="stat-icon">
            <Icon name="verified" />
          </span>
          <div className="stat-value">{stats.factCount}</div>
          <div className="stat-label">facts, each carrying its own date and source</div>
        </div>
        <div className="stat">
          <span className="stat-icon">
            <Icon name="shield-alert" />
          </span>
          <div className="stat-value">{scamRules.length}</div>
          <div className="stat-label">named scam schemes we can recognise on sight</div>
        </div>
        <div className="stat">
          <span className="stat-icon">
            <Icon name="home" />
          </span>
          <div className="stat-value">{states.length}</div>
          <div className="stat-label">states with official agency links and local questions</div>
        </div>
      </section>

      <section style={{ marginTop: 26 }}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Start here</p>
            <h2>Three ways in</h2>
          </div>
        </div>
        <div className="grid grid-3">
          <Link href="/guide" className="card topic-card">
            <span className="badge badge-brand">Ask</span>
            <span className="stat-icon" style={{ marginBottom: 0 }}>
              <Icon name="chat" />
            </span>
            <h3>Plain-language answers with the source attached</h3>
            <p className="small muted">
              Type the question in your own words, in simple English. You get what the rule actually is, what the jargon
              means, the steps in order, and where people lose money on it. If we do not have a vetted answer, we say so
              and give you a search plan instead of making something up.
            </p>
          </Link>
          <Link href="/radar" className="card topic-card">
            <span className="badge badge-danger">Protect</span>
            <span className="stat-icon" style={{ marginBottom: 0 }}>
              <Icon name="shield-alert" />
            </span>
            <h3>Scam Shield</h3>
            <p className="small muted">
              Paste a text message, a job offer, a rental listing, a letter or a voice-message transcript. We match it
              against {scamRules.length} known schemes aimed at immigrants, name the one you are dealing with, and tell
              you exactly what not to do — and when a message is genuinely official, we say that too.
            </p>
          </Link>
          <Link href="/roadmap" className="card topic-card">
            <span className="badge badge-neutral">Plan</span>
            <span className="stat-icon" style={{ marginBottom: 0 }}>
              <Icon name="calendar" />
            </span>
            <h3>Your dated roadmap</h3>
            <p className="small muted">
              A short intake produces a plan: what to do in the next two weeks, what opens options in the first year, and
              which document expiry dates will cost you income if they slip. Alerts adapt to your status.
            </p>
          </Link>
        </div>
      </section>

      {volatile.length ? (
        <section style={{ marginTop: 26 }}>
          <div className="card card-accent">
            <div className="spread" style={{ marginBottom: 10 }}>
              <div>
                <p className="eyebrow" style={{ color: 'var(--tertiary)' }}>
                  Recently changed
                </p>
                <h2 style={{ margin: 0 }}>The expensive kind of news</h2>
              </div>
              <span className="badge badge-warn">re-check these</span>
            </div>
            <p className="small muted">
              Most advice people repeat was true two years ago. These are the parts of the system we have flagged as
              moving targets, each with the date it was checked.
            </p>
            <ul className="facts">
              {volatile.map((f) => (
                <li key={f.id}>
                  <span className="fact-claim">{f.claim}</span>
                  <span className="fact-meta">
                    Checked {f.asOf} ·{' '}
                    <a href={f.source.url} target="_blank" rel="noreferrer noopener">
                      {f.source.name}
                    </a>{' '}
                    · also in <Link href={`/library/${f.topic.slug}`}>{f.topic.title}</Link>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section style={{ marginTop: 26 }}>
        <div className="section-head">
          <div>
            <p className="eyebrow">The library</p>
            <h2>By area of life</h2>
            <p className="small muted narrow">
              Written for someone who has never dealt with a US lease, a credit file, a hospital bill or an IRS notice —
              and who has already been told at least one thing that turned out to be false.
            </p>
          </div>
          <Link className="btn btn-secondary btn-sm" href="/library">
            Browse all {stats.topicCount}
          </Link>
        </div>
        <div className="grid grid-3">
          {(Object.keys(categoryMeta) as (keyof typeof categoryMeta)[]).map((cat) => (
            <Link key={cat} href={`/library?category=${cat}`} className="card topic-card">
              <span className="stat-icon" style={{ marginBottom: 0 }}>
                <Icon name={CATEGORY_ICON[cat] ?? 'book'} />
              </span>
              <h3>{categoryMeta[cat].label}</h3>
              <p className="small muted">{categoryMeta[cat].blurb}</p>
              <span className="badge badge-brand">{topics.filter((t) => t.category === cat).length} guides</span>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 26 }}>
        <div className="grid grid-2">
          <div className="card">
            <p className="eyebrow">Patterns, not paranoia</p>
            <h2>The schemes that target newcomers specifically</h2>
            <p className="small muted">
              Immigrant-targeted fraud is not random. It has scripts, and knowing the script is most of the protection.
            </p>
            <ul className="small">
              {recentScams.map((r) => (
                <li key={r.id}>
                  <strong>{r.name}.</strong> {r.theAsk}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 14 }}>
              <Link className="btn btn-secondary btn-sm" href="/radar">
                Open Scam Shield
              </Link>
            </div>
          </div>
          <div className="card">
            <p className="eyebrow">Why this is different</p>
            <h2>How this is different from asking a friend</h2>
            <ul className="small">
              <li>
                <strong>Every fact carries its date and source.</strong> There are {stats.factCount} facts across the
                library, drawn from {stats.sourceCount} official sources. The oldest check date is {oldestFactDate()}.
              </li>
              <li>
                <strong>We say &ldquo;we do not know&rdquo; on purpose.</strong> Housing, wage and benefit rules are set
                state by state, so instead of inventing a number we route you to your state&apos;s own agency and tell
                you the exact question to ask.
              </li>
              <li>
                <strong>It never tells you to pay a stranger.</strong> No gift cards, no crypto, no wires, no payment
                app to an individual — the engine treats those as fraud signals, because they are.
              </li>
              <li>
                <strong>It is not a lawyer.</strong> For your status, your taxes or a real dispute, we push you toward a
                licensed attorney, a legal aid office, or a free VITA tax clinic, and we tell you how to check that the
                person you are about to pay is actually licensed.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
