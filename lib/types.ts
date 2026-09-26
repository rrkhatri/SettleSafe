/**
 * SettleSafe core types.
 *
 * Design rule #1: nothing in this codebase may assert a US rule, number, deadline
 * or fee without a `Source` and an `asOf` date. This system prompt is enforced in
 * three places: the type system here, the UI (every fact renders its source), and
 * the LLM layer (the model is only allowed to restate provided facts).
 */

/** Where a claim came from, so a user can check it themselves. */
export type Source = {
  /** Human-readable publisher, e.g. "USCIS" or "FTC Consumer Advice". */
  name: string
  /** Official page. Prefer .gov / primary legal sources. */
  url: string
}

export type Volatility =
  /** Statute or structure. Rarely changes; safe for a year or more. */
  | 'stable'
  /** Numbers set annually (wages, fees, dollar thresholds, FPL). */
  | 'annual'
  /** Currently in litigation, phased in, or changed in the last 12 months. */
  | 'volatile'

export type Fact = {
  id: string
  /** The claim itself, in plain English. One sentence. */
  claim: string
  /** Optional second sentence: the "so what" or the exception. */
  detail?: string
  /** ISO date (YYYY-MM-DD) or YYYY-MM of last verification. */
  asOf: string
  source: Source
  volatility: Volatility
  /** Extra official places to confirm. */
  alsoCheck?: Source[]
}

export type JargonTerm = {
  /** The word people will hear on the phone, in a letter, or on a form. */
  term: string
  /** What it actually means, no legal jargon. */
  plain: string
  /** What it is called when someone is trying to take advantage of you. */
  watchOut?: string
}

export type TimelineStep = {
  /** When this happens, e.g. "Arrival day 0-14", "Every April". */
  when: string
  what: string
}

export type TopicCategory =
  | 'money'
  | 'home'
  | 'health'
  | 'work'
  | 'safety'
  | 'paperwork'

export type Topic = {
  id: string
  /** URL slug for /library/<slug>. */
  slug: string
  title: string
  category: TopicCategory
  /** One sentence: what is this thing, really? */
  oneLiner: string
  /** Why an immigrant specifically gets burned by this. */
  whyItMatters: string
  /** Search terms, including the words immigrants actually type. */
  keywords: string[]
  facts: Fact[]
  jargon: JargonTerm[]
  /** Ordered. The first two should be doable today. */
  steps: string[]
  timeline?: TimelineStep[]
  /** The mistakes people make when nobody told them how it is supposed to work. */
  traps: string[]
  /** Questions to ask out loud before signing or paying anything. */
  questionsToAsk: string[]
  officialLinks: Source[]
  relatedScamIds: string[]
  /** Free-text paragraphs for the guide page, plain language. */
  explain: string[]
}

export type ScamSeverity = 'red' | 'orange' | 'yellow'

export type ScamRule = {
  id: string
  name: string
  category:
    | 'government-impersonation'
    | 'immigration-fraud'
    | 'job'
    | 'housing'
    | 'banking'
    | 'investment'
    | 'romance'
    | 'delivery'
    | 'tech-support'
    | 'debt'
    | 'insurance'
  /** Higher = more dangerous in the US immigrant context. */
  weight: number
  /** Signals that fire this rule. Kept permissive on purpose; scored, not binary. */
  patterns: RegExp[]
  /** Signals that make it look legitimate, used to avoid false accusations. */
  benignPatterns?: RegExp[]
  /** What the scheme actually is. */
  what: string
  /** The lever it pulls on someone who is new to the country. */
  whyItWorks: string
  /** The one instruction that separates you from the money. */
  theAsk: string
  whatToDo: string[]
  never: string[]
  reportTo: Source[]
  relatedTopicId?: string
}

export type ScamVerdict = {
  severity: ScamSeverity
  /** 0-100. Not a probability; a "how many independent red flags stacked up" score. */
  score: number
  matches: ScamMatch[]
  /** Things that look alarming but are normal. */
  benign: { name: string; why: string }[]
  /** Money-movement instructions found in the text. Treated as hard stops. */
  paymentRisks: string[]
  /** True when the text carries several genuine official identifiers and asks for nothing. */
  looksOfficial?: boolean
  summary: string
  nextSteps: string[]
  /** If we cannot tell, say so instead of guessing. */
  limitations: string[]
}

export type ScamMatch = {
  ruleId: string
  name: string
  category: ScamRule['category']
  weight: number
  what: string
  whyItWorks: string
  theAsk: string
  whatToDo: string[]
  never: string[]
  reportTo: Source[]
  relatedTopicId?: string
  /** Verbatim snippets from the user's text that triggered this rule. */
  evidence: string[]
}

export type Citation = {
  label: string
  url: string
  asOf?: string
}

/** One unit of answer: a claim plus where it came from. */
export type AnswerBlock = {
  kind:
    | 'answer'
    | 'means'
    | 'steps'
    | 'watch'
    | 'timeline'
    | 'questions'
    | 'unknown'
    | 'warning'
    | 'scam'
  heading: string
  /** Plain paragraphs. Rendered as-is. */
  body?: string
  bullets?: string[]
  facts?: Fact[]
  citations?: Citation[]
  /** Rendered with the "this is the part that costs you money" styling. */
  emphasis?: 'danger' | 'normal' | 'done'
}

export type Answer = {
  question: string
  /** Offline composer or LLM, and which model if any. */
  engine: 'grounded-offline' | 'llm' | 'llm+grounded-fallback'
  model?: string
  confidence: 'high' | 'medium' | 'low' | 'none'
  /** Which library topics were used. Empty array = we had nothing. */
  usedTopicIds: string[]
  usedScamIds: string[]
  blocks: AnswerBlock[]
  /** Shown verbatim in the UI. */
  disclaimer: string
  /** True when we had no grounding and the answer is a search plan, not advice. */
  isFallbackPlan: boolean
  tookMs?: number
}
