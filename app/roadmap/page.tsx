import { RoadmapWizard } from '@/components/RoadmapWizard'
import { Icon } from '@/components/Icon'

export const metadata = {
  title: 'Your settling roadmap | SettleSafe',
}

export default function RoadmapPage() {
  return (
    <div className="wrap">
      <section className="hero-banner compact" style={{ marginTop: 24 }}>
        <div className="hero-head-row">
          <div style={{ maxWidth: '62ch' }}>
            <span className="hero-pill">
              <Icon name="calendar" className="icon-sm" />
              Plan · your first years
            </span>
            <h1 style={{ marginTop: 12 }}>Your settling roadmap</h1>
            <p className="lede">
              The first years in a new country are a queue of administrative tasks with money attached — and nobody
              hands you the list. Answer a few questions and get the order, the cost, the reason, and the official link
              for each one.
            </p>
          </div>
          <div className="hero-side">
            <span className="hero-side-icon">
              <Icon name="lock" className="icon-lg" />
            </span>
            <div>
              <p className="hero-side-label">Your data</p>
              <p className="hero-side-value">Stays in your browser</p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ marginTop: 16 }}>
        <p className="status-strip">
          <span className="status-dot status-dot-off" aria-hidden="true" />
          <span>Nothing you enter is stored on our side — the plan and your checkmarks live in your browser only</span>
        </p>
      </div>

      <div style={{ paddingBottom: 34, marginTop: 20 }}>
        <RoadmapWizard />
      </div>
    </div>
  )
}
