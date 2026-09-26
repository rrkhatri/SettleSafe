import { RoadmapWizard } from '@/components/RoadmapWizard'

export const metadata = {
  title: 'Your settling roadmap | SettleSafe',
}

export default function RoadmapPage() {
  return (
    <div className="wrap">
      <header className="page-head page-head-rule">
        <p className="eyebrow">Plan</p>
        <h1>Your settling roadmap</h1>
        <p className="lede">
          The first years in a new country are a queue of administrative tasks with money attached — and nobody hands you
          the list. Answer a few questions and get the order, the cost, the reason, and the official link for each one.
        </p>
        <p className="status-strip">
          <span className="status-dot status-dot-off" aria-hidden="true" />
          <span>Nothing you enter is stored on our side — the plan and your checkmarks live in your browser only</span>
        </p>
      </header>
      <div style={{ paddingBottom: 46 }}>
        <RoadmapWizard />
      </div>
    </div>
  )
}
