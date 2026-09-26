import Link from 'next/link'
import { categoryMeta, libraryStats, topics, oldestFactDate } from '@/lib/knowledge'
import type { TopicCategory } from '@/lib/types'
import { Icon } from '@/components/Icon'

export const metadata = {
  title: 'Library — plain-language guides | SettleSafe',
}

const CATEGORIES = Object.keys(categoryMeta) as TopicCategory[]

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const params = await searchParams
  const active = CATEGORIES.includes(params.category as TopicCategory)
    ? (params.category as TopicCategory)
    : undefined
  const query = (params.q ?? '').toLowerCase().trim()

  const visible = topics.filter((t) => {
    if (active && t.category !== active) return false
    if (!query) return true
    const hay = `${t.title} ${t.oneLiner} ${t.keywords.join(' ')} ${t.whyItMatters}`.toLowerCase()
    return hay.includes(query)
  })

  const stats = libraryStats()

  return (
    <div className="wrap">
      <section className="hero-banner compact" style={{ marginTop: 24 }}>
        <div className="hero-head-row">
          <div style={{ maxWidth: '62ch' }}>
            <span className="hero-pill">
              <Icon name="book" className="icon-sm" />
              The library
            </span>
            <h1 style={{ marginTop: 12 }}>Every guide carries its dates</h1>
            <p className="lede">
              {stats.topicCount} guides, {stats.factCount} dated facts, {stats.sourceCount} official sources. Every claim
              shows when it was checked and where it came from — the oldest check date is {oldestFactDate()}, so
              anything older than that deserves a fresh look at the source before you act on it.
            </p>
          </div>
          <div className="hero-side">
            <span className="hero-side-icon">
              <Icon name="verified" className="icon-lg" />
            </span>
            <div>
              <p className="hero-side-label">Verified facts</p>
              <p className="hero-side-value">{stats.factCount} dated &amp; sourced</p>
            </div>
          </div>
        </div>
      </section>

      <form method="get" className="card" style={{ marginBottom: 16 }}>
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 260px' }}>
            <label htmlFor="q">Search the library</label>
            <input
              id="q"
              type="text"
              name="q"
              defaultValue={params.q ?? ''}
              placeholder="deposit, overtime, ITIN, hospital bill…"
            />
          </div>
          {active ? <input type="hidden" name="category" value={active} /> : null}
          <button className="btn" type="submit">
            Search
          </button>
        </div>
      </form>

      <div className="chips">
        <Link
          className="chip"
          href="/library"
          style={!active ? { borderColor: 'var(--brand)', background: 'var(--brand-soft)', color: 'var(--brand-2)' } : undefined}
        >
          Everything
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            className="chip"
            href={`/library?category=${c}`}
            style={
              active === c ? { borderColor: 'var(--brand)', background: 'var(--brand-soft)', color: 'var(--brand-2)' } : undefined
            }
          >
            {categoryMeta[c].label}
          </Link>
        ))}
      </div>

      <p className="small muted" style={{ marginBottom: 16 }}>
        Showing {visible.length} of {stats.topicCount} guides
        {active ? ` in ${categoryMeta[active].label}` : ''}
        {query ? ` matching “${params.q}”` : ''}.
      </p>

      {visible.length === 0 ? (
        <div className="card">
          <h3>Nothing matched that</h3>
          <p className="small muted" style={{ marginBottom: 0 }}>
            Try a simpler word — &ldquo;deposit&rdquo;, &ldquo;taxes&rdquo;, &ldquo;work permit&rdquo;,
            &ldquo;scam&rdquo; — or <Link href="/guide">ask the guide directly</Link>.
          </p>
        </div>
      ) : null}

      <div className="grid grid-3">
        {visible.map((t) => (
          <Link key={t.id} href={`/library/${t.slug}`} className="card topic-card">
            <span className="badge badge-neutral">{categoryMeta[t.category].label}</span>
            <h3>{t.title}</h3>
            <p className="small muted">{t.oneLiner}</p>
            <p className="tiny muted" style={{ margin: 0 }}>
              {t.facts.length} dated facts · {t.steps.length} steps · {t.traps.length} traps
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
