'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/guide', label: 'Ask the guide' },
  { href: '/radar', label: 'Scam radar' },
  { href: '/roadmap', label: 'My roadmap' },
  { href: '/library', label: 'Library' },
]

export function SiteNav() {
  const pathname = usePathname()
  return (
    <nav className="nav" aria-label="Main">
      <div className="wrap nav-inner">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          SettleSafe
        </Link>
        <div className="nav-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} data-active={pathname.startsWith(l.href)}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
