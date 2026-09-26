import type { Metadata, Viewport } from 'next'
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
            <p style={{ marginBottom: 6 }}>
              <strong>SettleSafe</strong> explains how US systems generally work and points you to official sources.
              It is not a lawyer, tax professional or financial adviser, and it cannot tell you what will happen in
              your own case.
            </p>
            <p style={{ marginBottom: 0 }}>
              Every fact on this site carries the date it was checked and the official page it came from. Rules change —
              re-check the source before you rely on something expensive. For anything involving your immigration
              status, your taxes, or a legal dispute, use a licensed attorney, a legal aid office, or a free VITA tax
              clinic. In an emergency call 911; for local help in many languages call 211.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
