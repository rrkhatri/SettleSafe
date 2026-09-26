import type { Topic } from './types'
import { topics } from './knowledge'
import { scamRules } from './scams'

/* ------------------------------------------------------------------ *
 * Tokenizing and query expansion
 * ------------------------------------------------------------------ */

const STOPWORDS = new Set(
  `a an the and or but if then than that this these those is are was were be been being do does did doing have has had having
   i me my mine we us our you your he she it they them their to of in on at for with about from by as into over after before
   can could should would will just don't dont not no nor so very too also there here what which who whom when where why how
   will need needto want get got make made say said know know how please help me my problem issue`
    .split(/\s+/)
    .filter(Boolean)
)

/**
 * Immigrants do not search using the official vocabulary. This maps the words
 * people actually use onto the concepts in the library.
 */
const SYNONYMS: Record<string, string[]> = {
  papers: ['documents', 'status', 'green card', 'work permit'],
  notario: ['legal', 'lawyer', 'immigration', 'fraud'],
  notary: ['legal', 'lawyer', 'immigration'],
  green: ['green', 'card', 'immigration', 'permanent'],
  permit: ['work permit', 'ead', 'authorization'],
  card: ['credit', 'green', 'ead'],
  ssn: ['ssn', 'social', 'security', 'number'],
  social: ['ssn', 'social security'],
  itin: ['itin', 'tax', 'id'],
  boss: ['employer', 'wage', 'overtime'],
  paycheck: ['wage', 'pay', 'stub', 'overtime'],
  salary: ['wage', 'pay'],
  rent: ['rent', 'lease', 'landlord', 'deposit', 'apartment'],
  landlord: ['landlord', 'rent', 'lease', 'deposit'],
  flat: ['apartment', 'rent'],
  apartment: ['apartment', 'rent', 'lease', 'deposit'],
  deposit: ['deposit', 'rent', 'lease'],
  bill: ['bill', 'medical', 'utility', 'payment'],
  hospital: ['hospital', 'medical', 'bill', 'emergency'],
  doctor: ['doctor', 'medical', 'health', 'clinic'],
  insurance: ['insurance', 'health', 'auto', 'renters'],
  taxes: ['tax', 'return', 'filing', 'refund'],
  tax: ['tax', 'return', 'filing', 'refund', 'withholding'],
  credit: ['credit', 'score', 'report', 'card', 'loan'],
  loan: ['loan', 'credit', 'interest'],
  scam: ['scam', 'fraud', 'red', 'flag'],
  fraud: ['scam', 'fraud'],
  hack: ['identity', 'theft', 'fraud'],
  police: ['rights', 'legal', 'court'],
  court: ['court', 'legal', 'notice', 'hearing'],
  letter: ['notice', 'mail', 'usc'],
  mail: ['notice', 'mail', 'usc'],
  money: ['money', 'transfer', 'remittance', 'send'],
  remit: ['remittance', 'send', 'money', 'transfer'],
  job: ['job', 'work', 'employer', 'hiring'],
  work: ['work', 'job', 'employer', 'wage', 'permit'],
  unpaid: ['wage', 'unpaid', 'overtime', 'theft'],
  fired: ['unemployment', 'job', 'termination', 'final'],
  fired_: ['unemployment'],
  car: ['car', 'vehicle', 'title', 'insurance'],
  license: ['license', 'dmv', 'id', 'driver'],
  id: ['id', 'license', 'dmv', 'identity'],
  school: ['children', 'school', 'education'],
  kid: ['children', 'school', 'family'],
  kids: ['children', 'school', 'family'],
  child: ['children', 'school', 'family'],
  food: ['food', 'snap', 'hunger', 'benefits'],
  hungry: ['food', 'snap', 'benefits'],
  medicaid: ['medicaid', 'health', 'insurance', 'benefits'],
  benefits: ['benefits', 'snap', 'medicaid', 'assistance'],
  english: ['language', 'interpreter'],
  interpreter: ['language', 'interpreter'],
  '911': ['emergency', 'urgent'],
  emergency: ['emergency', 'hospital', 'urgent'],
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s$%#-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
}

export function expandQuery(question: string): string[] {
  const base = tokenize(question)
  const out = new Set<string>(base)
  for (const token of base) {
    const extra = SYNONYMS[token]
    if (extra) extra.forEach((e) => out.add(e))
  }
  // bigrams help a lot for phrases like "credit score" or "security deposit"
  const words = tokenize(question)
  for (let i = 0; i < words.length - 1; i++) out.add(`${words[i]} ${words[i + 1]}`)
  return [...out]
}

/* ------------------------------------------------------------------ *
 * Topic retrieval
 * ------------------------------------------------------------------ */

function haystackText(topic: Topic): string {
  return [
    topic.title,
    topic.oneLiner,
    topic.whyItMatters,
    topic.keywords.join(' '),
    topic.jargon.map((j) => `${j.term} ${j.plain}`).join(' '),
    topic.facts.map((f) => `${f.claim} ${f.detail ?? ''}`).join(' '),
    topic.traps.join(' '),
    topic.steps.join(' '),
    topic.explain.join(' '),
  ]
    .join(' ')
    .toLowerCase()
}

const HAYSTACKS = new Map(topics.map((t) => [t.id, haystackText(t)]))

export type ScoredTopic = { topic: Topic; score: number; matched: string[] }

export function retrieveTopics(question: string, limit = 3): ScoredTopic[] {
  const terms = expandQuery(question)
  const lower = question.toLowerCase()
  const scored: ScoredTopic[] = topics.map((topic) => {
    let score = 0
    const matched: string[] = []
    const hay = HAYSTACKS.get(topic.id) ?? ''

    for (const term of terms) {
      if (term.includes(' ')) {
        if (hay.includes(term)) {
          score += 3
          matched.push(term)
        }
        continue
      }
      // exact keyword hits are the strongest signal
      if (topic.keywords.some((k) => k === term)) {
        score += 6
        matched.push(term)
        continue
      }
      if (topic.keywords.some((k) => k.includes(term))) {
        score += 3
        matched.push(term)
        continue
      }
      if (topic.title.toLowerCase().includes(term)) {
        score += 2
        matched.push(term)
        continue
      }
      if (hay.includes(term)) {
        score += 1
        matched.push(term)
      }
    }

    // direct phrase match on the title or one-liner is a strong signal
    const titleLower = topic.title.toLowerCase()
    if (lower.includes(titleLower)) score += 10
    if (topic.oneLiner.length > 30 && lower.includes(topic.oneLiner.slice(0, 25).toLowerCase())) score += 8

    return { topic, score, matched: [...new Set(matched)] }
  })

  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/* ------------------------------------------------------------------ *
 * Scam scanning
 * ------------------------------------------------------------------ */

export type RuleHit = {
  ruleId: string
  evidence: string[]
  hits: number
}

function snippets(text: string, re: RegExp, max = 2): string[] {
  const out: string[] = []
  const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`
  const global = new RegExp(re.source, flags)
  let m: RegExpExecArray | null
  while ((m = global.exec(text)) !== null && out.length < max) {
    const start = Math.max(0, m.index - 45)
    const end = Math.min(text.length, m.index + m[0].length + 45)
    out.push(`${start > 0 ? '…' : ''}${text.slice(start, end).replace(/\s+/g, ' ').trim()}${end < text.length ? '…' : ''}`)
    if (m.index === global.lastIndex) global.lastIndex++
  }
  return out
}

export function matchScamRules(text: string): RuleHit[] {
  const hits: RuleHit[] = []
  for (const rule of scamRules) {
    const evidence: string[] = []
    let count = 0
    for (const pattern of rule.patterns) {
      const found = snippets(text, pattern)
      if (found.length) {
        count += found.length
        evidence.push(...found)
      }
    }
    if (count > 0) {
      hits.push({ ruleId: rule.id, evidence: [...new Set(evidence)].slice(0, 3), hits: count })
    }
  }
  return hits
}

/** Money-movement instructions. Each one is a hard stop on its own. */
const PAYMENT_PATTERNS: { label: string; re: RegExp; weight: number; why: string }[] = [
  { label: 'Gift cards', re: /\b(gift ?cards?|itunes card|google play card|steam card|apple card|amazon card|prepaid card|money ?pak)\b/i, weight: 20, why: 'Gift card codes are cash. Once read out, the money is gone and cannot be recovered.' },
  { label: 'Cryptocurrency', re: /\b(bitcoin|crypto(currency)?|usdt|ethereum|btc|crypto ?atm|bitcoin ?atm)\b/i, weight: 20, why: 'Crypto transfers are irreversible. No agency or company legitimate asks for payment this way.' },
  { label: 'Wire transfer / money transfer service', re: /\b(wire transfer|western union|moneygram|money gram|cashier'?s check|bank draft)\b/i, weight: 16, why: 'Wires are fast and hard to reverse, and a wire to an individual is the end of the money.' },
  { label: 'Payment app to an individual', re: /\b(zelle|venmo|cash ?app|cashapp|paypal friends and family|revolut)\b/i, weight: 12, why: 'Peer-to-peer payments have far weaker fraud protections than cards — treat them as handing over cash.' },
  { label: 'Mobile deposit / check deposit', re: /\b(mobile deposit|deposit the check|deposit this check|deposit the funds)\b/i, weight: 14, why: 'Deposited checks can be reversed weeks later, after you have already sent money out.' },
  { label: 'Cash by mail or courier', re: /\b(cash in (an )?envelope|mail (the )?cash|courier (the )?cash|send cash by mail)\b/i, weight: 18, why: 'Mailed cash cannot be traced or recovered.' },
]

export function detectPaymentRisks(text: string) {
  const found: { label: string; why: string; weight: number; evidence: string[] }[] = []
  for (const p of PAYMENT_PATTERNS) {
    const ev = snippets(text, p.re, 1)
    if (ev.length) found.push({ label: p.label, why: p.why, weight: p.weight, evidence: ev })
  }
  return found
}

/** Pressure tactics that are not proof of fraud on their own, but always worth naming. */
const PRESSURE_PATTERNS: { label: string; re: RegExp; weight: number; note: string }[] = [
  { label: 'Manufactured urgency', re: /\b(immediately|right now|within \d+ (minutes|hours)|today only|final notice|last chance|urgent(ly)?|act now|expires (today|soon|in))\b/i, weight: 6, note: 'Real organizations do not need you to decide in minutes. Urgency exists to stop you checking.' },
  { label: 'Secrecy', re: /\b(do not (tell|discuss|inform)|don'?t tell anyone|keep this (confidential|between us)|do not contact (your|the) bank|stay on the (line|phone))\b/i, weight: 10, note: 'Every legitimate institution expects you to talk to your family and your bank. Secrecy is a scam requirement.' },
  { label: 'Threat', re: /\b(arrest(ed)?|deport(ation|ed)?|jail|prison|lawsuit|legal action|criminal charges|warrant|freeze your account|seize)\b/i, weight: 8, note: 'Threats are used to stop you asking questions. Agencies and banks do not negotiate this way by text or cold call.' },
  { label: 'Remote access or code request', re: /\b(anydesk|teamviewer|remote (access|control|support)|screen ?shar\w+|one[- ]time (code|password)|\botp\b|verification code)\b/i, weight: 12, note: 'No legitimate caller needs remote control of your device or a one-time code read to them.' },
  { label: 'Too-good-to-be-true offer', re: /\b(guaranteed|no experience (needed|required)|100% (approval|profit|free)|\$\d{3,4} (per|a) day|earn \$\d+ (daily|weekly|a day)|risk[- ]free)\b/i, weight: 8, note: 'Guarantees are the standard hook. Real processes have conditions and outcomes you cannot control.' },
]

export function detectPressure(text: string) {
  const out: { label: string; note: string; weight: number }[] = []
  for (const p of PRESSURE_PATTERNS) {
    if (p.re.test(text)) out.push({ label: p.label, note: p.note, weight: p.weight })
  }
  return out
}

/** Things that make a document look real. Absence is not proof of fraud; presence is not proof of legitimacy. */
const BENIGN_PATTERNS: { label: string; re: RegExp; why: string }[] = [
  {
    label: 'USCIS-style receipt number',
    re: /\b(EAC|WAC|LIN|MSC|NBC|IOE|YSC|SRC|VSC|CSC)\d{10}\b/,
    why: 'That format is what USCIS uses. You can verify it yourself at egov.uscis.gov/casestatus — by typing the address, not by clicking a link.',
  },
  {
    label: 'Form number',
    re: /\bform (i|n|g|w)-?\d{2,4}[a-z]?\b|\b(i|n|g|w)-?\d{3}[a-z]?\b/i,
    why: 'Real immigration and tax documents are identified by form number. Look the form up on the agency site and compare.',
  },
  {
    label: 'IRS notice code',
    re: /\b(CP|LT)\s?-?\d{2,3}\b|\bnotice (cp|lt)\s?\d{2,3}\b/i,
    why: 'The IRS notice number identifies exactly what the letter is about. Search that number on irs.gov.',
  },
  {
    label: 'Immigration court identifiers',
    re: /\b(notice to appear|hearing notice|immigration court|eoir|master calendar|individual hearing|a-?number)\b/i,
    why: 'You can confirm court dates with the EOIR automated case information line using your A-number.',
  },
  {
    label: 'Official domain',
    re: /\bhttps?:\/\/[a-z0-9.-]*\.gov\b/i,
    why: 'A .gov address is a meaningful signal — but check that it is the whole domain (something.gov.example.com is not government).',
  },
  {
    label: 'Normal payment channel',
    re: /\b(payable to|make (the )?check payable to|mail (your )?payment to|pay(able)? online at [a-z]+\.gov)\b/i,
    why: 'Written payment instructions to an organization through mail or an official portal are how real bills work.',
  },
  {
    label: 'Written response deadline',
    re: /\b(respond|reply|appeal|request a review|contact us)\b[^.!?]{0,30}\bwithin \d{1,3} days\b/i,
    why: 'A stated number of days to respond in writing is how real notices work. Scams prefer "right now" to "within 30 days".',
  },
  {
    label: 'Official agency portal',
    re: /\b(log ?in|sign ?in|visit|go to)\b[^.!?]{0,35}\b(your )?(irs|uscis|ssa|eoir|dmv|state) (online )?(account|portal|website)\b|\b[a-z]+\.gov\b/i,
    why: 'Real agencies send you to their own portal, which you open yourself, rather than to a link they provide.',
  },
  {
    label: 'Explicit no-payment language',
    re: /\b(do not send cash|no payment is required|you do not (need to|have to) pay|this is not a bill)\b/i,
    why: 'Agency mail often states plainly whether money is owed. Fraudulent notices rarely tell you that nothing is due.',
  },
]

export function detectBenign(text: string) {
  const out: { name: string; why: string }[] = []
  for (const b of BENIGN_PATTERNS) {
    if (b.re.test(text)) out.push({ name: b.label, why: b.why })
  }
  return out
}

/* ------------------------------------------------------------------ *
 * Light intent classification, used to pick the answer shape
 * ------------------------------------------------------------------ */

export type QuestionKind =
  | 'is-this-scam'
  | 'how-do-i'
  | 'what-is'
  | 'how-much'
  | 'what-are-my-rights'
  | 'deadline'
  | 'general'

export function classifyQuestion(question: string): QuestionKind {
  const q = question.toLowerCase()
  if (/\b(scam|fraud|legit|real or fake|is this real|should i trust|sketchy|suspicious)\b/.test(q)) return 'is-this-scam'
  if (/\b(cost|how much|price|fee|expensive|afford)\b/.test(q)) return 'how-much'
  if (/\b(deadline|when|how long|due date|expire|by what date)\b/.test(q)) return 'deadline'
  if (/\b(rights|can they|are they allowed|is it legal|illegal|law says)\b/.test(q)) return 'what-are-my-rights'
  if (/\b(how do i|how to|how can i|steps|apply|file|get|open|start)\b/.test(q)) return 'how-do-i'
  if (/\b(what is|what does|meaning|explain|difference between|jargon)\b/.test(q)) return 'what-is'
  return 'general'
}

/** Pull a state code/name out of a question, if one is mentioned. */
export function detectState(question: string, stateList: { code: string; name: string }[]) {
  const q = question.toLowerCase()
  for (const s of stateList) {
    if (new RegExp(`\\b${s.name.toLowerCase()}\\b`).test(q)) return s.code
  }
  for (const s of stateList) {
    if (new RegExp(`\\b${s.code.toLowerCase()}\\b`).test(q)) return s.code
  }
  return undefined
}
