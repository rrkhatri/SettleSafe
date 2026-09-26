import { RoadmapWizard } from '@/components/RoadmapWizard'

export const metadata = {
  title: 'Your settling roadmap | SettleSafe',
}

export default function RoadmapPage() {
  return (
    <div className="wrap section">
      <h1>Your settling roadmap</h1>
      <p className="small muted" style={{ maxWidth: 720 }}>
        The first years in a new country are a queue of administrative tasks with money attached — and nobody hands you
        the list. Answer a few questions and get the order, the cost, the reason, and the official link for each one.
      </p>
      <p className="tiny muted" style={{ marginBottom: 22 }}>
        Nothing you enter is stored on our side. The plan and your checkmarks live in your browser only.
      </p>
      <RoadmapWizard />
    </div>
  )
}
