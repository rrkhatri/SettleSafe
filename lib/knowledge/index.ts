import type { Topic, TopicCategory } from '../types'
import { paperworkTopics } from './paperwork'
import { moneyTopics } from './money'
import { homeTopics } from './home'
import { healthTopics } from './health'
import { workTopics } from './work'
import { safetyTopics } from './safety'

export const topics: Topic[] = [
  ...paperworkTopics,
  ...moneyTopics,
  ...homeTopics,
  ...healthTopics,
  ...workTopics,
  ...safetyTopics,
]

export const topicById = new Map(topics.map((t) => [t.id, t]))
export const topicBySlug = new Map(topics.map((t) => [t.slug, t]))

export const categoryMeta: Record<TopicCategory, { label: string; blurb: string }> = {
  paperwork: {
    label: 'Paperwork & status',
    blurb: 'The documents everything else depends on — and how to protect them.',
  },
  money: { label: 'Money & credit', blurb: 'Banks, credit, taxes, and sending money home.' },
  home: { label: 'Renting & housing', blurb: 'Getting in, getting out, and keeping your money.' },
  health: { label: 'Health & medical bills', blurb: 'Coverage, clinics, and what to do about bills.' },
  work: { label: 'Work & getting paid', blurb: 'Your rights on the job, and what to do if you are cheated.' },
  safety: { label: 'Scams & safety', blurb: 'The schemes aimed at immigrants, and how they work.' },
}

export function topicsByCategory(category: TopicCategory): Topic[] {
  return topics.filter((t) => t.category === category)
}

/** All fact dates across the library — used to show the freshness of the content. */
export function oldestFactDate(): string {
  const dates = topics.flatMap((t) => t.facts.map((f) => f.asOf)).sort()
  return dates[0] ?? '2026-01'
}

export function libraryStats() {
  const facts = topics.flatMap((t) => t.facts)
  const sources = new Set(facts.map((f) => f.source.url))
  const volatile = facts.filter((f) => f.volatility === 'volatile')
  return {
    topicCount: topics.length,
    factCount: facts.length,
    sourceCount: sources.size,
    volatileCount: volatile.length,
    scamTopicCount: topics.filter((t) => t.category === 'safety').length,
  }
}

export { paperworkTopics, moneyTopics, homeTopics, healthTopics, workTopics, safetyTopics }
