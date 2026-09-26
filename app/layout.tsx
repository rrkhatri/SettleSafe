import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import './globals.css'
import { SiteNav } from '@/components/SiteNav'

export const metadata: Metadata = {
  title: 'SettleSafe — plain-language guide to US life, without the scams',
  description:
    'Rent, taxes, credit, insurance and scams explained in plain English, with a dated source for every claim. Paste any suspicious message and get a verdict.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f5c4a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        <main>{children}</main>
        <footer className="footer">
          <div className="wrap">
            <div className="footer-grid">
              <div>
                <p className="footer-brand">SettleSafe</p>
                <p style={{ marginBottom: 0 }}>
                  A plain-language guide to the US systems that cost newcomers money — rent, taxes, credit, insurance,
                  paperwork and the scams built on top of them.
                </p>
              </div>
              <div>
                <p className="footer-head">Read</p>
                <ul className="footer-links">
                  <li>
                    <Link href="/library">The library</Link>
                  </li>
                  <li>
                    <Link href="/guide">Ask the guide</Link>
                  </li>
                  <li>
                    <Link href="/radar">Scam Radar</Link>
                  </li>
                  <li>
                    <Link href="/roadmap">Your roadmap</Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="footer-head">If you need a human</p>
                <ul className="footer-links">
                  <li>
                    <a href="https://www.usa.gov/legal-aid" target="_blank" rel="noreferrer noopener">
                      Legal aid (usa.gov)
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.irs.gov/individuals/free-tax-return-preparation-for-you-by-volunteers"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Free VITA tax clinics
                    </a>
                  </li>
                  <li>
                    <a href="https://www.211.org/" target="_blank" rel="noreferrer noopener">
                      211 — local services, many languages
                    </a>
                  </li>
                  <li>Emergency: 911</li>
                </ul>
              </div>
            </div>
            <hr />
            <p className="tiny" style={{ marginBottom: 6 }}>
              <strong>Not legal, tax or financial advice.</strong> SettleSafe explains how these systems generally work
              and points you to official sources. It is not a lawyer, a tax professional or a financial adviser, and it
              cannot tell you what will happen in your own case.
            </p>
            <p className="tiny" style={{ marginBottom: 0 }}>
              Every fact on this site carries the date it was checked and the official page it came from. Rules change —
              re-check the source before you rely on something expensive. For anything involving your immigration
              status, your taxes, or a legal dispute, use a licensed attorney, a legal aid office, or a free VITA tax
              clinic. SettleSafe is not affiliated with any government agency.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
