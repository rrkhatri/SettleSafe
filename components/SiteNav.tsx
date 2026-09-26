'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon, type IconName } from './Icon'

const LINKS: { href: string; label: string; icon: IconName; tag?: string }[] = [
  { href: '/', label: 'Overview', icon: 'grid' },
  { href: '/radar', label: 'Scam Shield', icon: 'shield-alert', tag: 'Live' },
  { href: '/guide', label: 'Ask the guide', icon: 'chat' },
  { href: '/roadmap', label: 'My roadmap', icon: 'calendar' },
  { href: '/library', label: 'Library', icon: 'book' },
]

export function SiteNav({ factCount, sourceCount }: { factCount: number; sourceCount: number }) {
  const pathname = usePathname()

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">
              <Icon name="shield-check" size={20} />
            </span>
            <span className="brand-text">
              <span className="brand-name">SettleSafe</span>
              <span className="brand-sub">Plain-language US guide</span>
            </span>
          </Link>

          <span className="topbar-pill">
            <Icon name="verified" className="icon-sm" />
            Every claim dated &amp; sourced
          </span>

          <form className="search-box" action="/library" method="get" role="search">
            <Icon name="search" className="icon-sm" />
            <label htmlFor="site-search" className="sr-only">
              Search the library
            </label>
            <input
              id="site-search"
              type="text"
              name="q"
              placeholder="Search any US rule, form or document — deposit, ITIN, 1099…"
            />
          </form>

          <div className="topbar-actions">
            <span className="chip-quiet" title="Answers are written in simple English">
              <Icon name="globe" className="icon-sm" />
              <span className="wide-only">Simple English</span>
            </span>
            <Link className="hotline" href="/radar">
              <Icon name="shield-alert" className="icon-sm" />
              <span className="wide-only">Check a message</span>
            </Link>
          </div>
        </div>
      </header>

      <aside className="sidebar">
        <p className="sidebar-heading">Modules</p>
        <nav className="sidebar-nav" aria-label="Main">
          {LINKS.map((l) => {
            const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href)
            return (
              <Link key={l.href} href={l.href} className="nav-link" data-active={active} aria-current={active ? 'page' : undefined}>
                <Icon name={l.icon} />
                <span>{l.label}</span>
                {l.tag ? <span className="nav-tag">{l.tag}</span> : null}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-foot">
          <p className="sidebar-foot-head">
            <Icon name="verified" className="icon-sm" />
            Sources synced
          </p>
          <p>
            {factCount} facts from {sourceCount} official sources — each one carries the date it was checked.
          </p>
        </div>
      </aside>
    </>
  )
}
