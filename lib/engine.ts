import type { Answer, AnswerBlock, Fact, ScamVerdict, Citation } from './types'
import {
  classifyQuestion, detectBenign, detectPaymentRisks, detectPressure, detectState,
  matchScamRules, retrieveTopics, type ScoredTopic,
} from './search'
import { scamRuleById } from './scams'
import { topics } from './knowledge'
import { stateByCode, states } from './states'

export const DISCLAIMER =
  'SettleSafe explains how US systems generally work and points you to official sources. It is not a lawyer, tax professional or financial adviser, and it cannot tell you what will happen in your specific case. For decisions about your status, your taxes, or a legal dispute, talk to a licensed attorney, a legal aid office, or a free VITA tax clinic.'

/* ------------------------------------------------------------------ *
 * Scam Radar
 * ------------------------------------------------------------------ */

export function scanText(text: string): ScamVerdict {
  const rules = matchScamRules(text)
  const payments = detectPaymentRisks(text)
  const pressure = detectPressure(text)
  const benign = detectBenign(text)

  const matches = rules
    .map((hit) => {
      const rule = scamRuleById.get(hit.ruleId)!
      return {
        ruleId: rule.id,
        name: rule.name,
        category: rule.category,
        weight: rule.weight,
        what: rule.what,
        whyItWorks: rule.whyItWorks,
        theAsk: rule.theAsk,
        whatToDo: rule.whatToDo,
        never: rule.never,
        reportTo: rule.reportTo,
        relatedTopicId: rule.relatedTopicId,
        evidence: hit.evidence,
      }
    })
    .sort((a, b) => b.weight - a.weight)

  let score = matches.reduce((sum, m) => sum + m.weight, 0)
  score += payments.reduce((sum, p) => sum + p.weight, 0)
  score += pressure.reduce((sum, p) => sum + p.weight, 0)
  // Things that look official reduce the alarm, but never to zero.
  score -= benign.length * 6

  /**
   * Real notices mention USCIS, the IRS and immigration courts — so a naive
   * keyword scan says "fraud" on genuine mail, which would train people to
   * ignore real deadlines. If the text carries several verifiable identifiers
   * AND asks for no money AND uses no threat or secrecy, we cap the score and
   * switch to "verify it in one minute" mode instead of an accusation.
   */
  const hasPayment = payments.length > 0
  const hasThreatOrSecrecy = pressure.some((p) => p.label === 'Threat' || p.label === 'Secrecy')
  const looksOfficial = benign.length >= 2 && !hasPayment && !hasThreatOrSecrecy
  if (looksOfficial) score = Math.min(score, 18)

  score = Math.max(0, Math.min(100, score))

  const severity = score >= 45 ? 'red' : score >= 22 ? 'orange' : 'yellow'

  const summary = (() => {
    if (looksOfficial) {
      return `This carries ${benign.length} details that genuine official mail uses, and asks for no money and makes no threat. It may well be real — and ignoring a real notice is expensive. Verify it yourself in about a minute using the identifiers in it, then act on the deadline.`
    }
    if (matches.length === 0 && payments.length === 0) {
      return 'We did not find the signals of a known scheme in this text. That is not a guarantee that it is legitimate — it means nothing here matches our library of immigrant-targeted fraud patterns.'
    }
    if (severity === 'red') {
      return `This text matches ${matches.length} known scheme${matches.length === 1 ? '' : 's'}${payments.length ? ` and asks you to move money in a way scammers rely on (${payments.map((p) => p.label.toLowerCase()).join(', ')})` : ''}. Treat it as hostile until you have verified it through a channel you chose yourself.`
    }
    if (severity === 'orange') {
      return `This text matches a known pattern (${matches.map((m) => m.name).join('; ')}) and contains pressure tactics. Verify everything independently before responding or paying.`
    }
    return 'There are some warning signs here — pressure, an unusual payment method, or a request for information. Nothing is proven, but slow down and verify.'
  })()

  const nextSteps: string[] = []
  if (looksOfficial) {
    nextSteps.push('Do not click any link in the document. Type the agency\'s address yourself and check the identifiers.')
    nextSteps.push('USCIS receipt number (three letters followed by ten digits): verify at egov.uscis.gov/casestatus.')
    nextSteps.push('IRS notice code (like CP2000): search that code on irs.gov to see exactly what it is.')
    nextSteps.push('Immigration court: confirm the date and time with the EOIR automated case information line using your A-number.')
    nextSteps.push('If the deadline is close and you do not understand the notice, get a free legal aid or pro bono consultation this week — do not ignore it.')
  } else if (severity === 'red') {
    nextSteps.push('Stop all communication. Do not reply, do not click, do not pay.')
    nextSteps.push('If money already moved, call your bank or card issuer today and say the words "fraudulent transfer" — the recovery window is short.')
    nextSteps.push('Verify through a channel you chose yourself: the number on your card, your account app, or the agency\'s official website.')
    nextSteps.push('Keep screenshots and the original messages. Report at ReportFraud.ftc.gov.')
  } else if (severity === 'orange') {
    nextSteps.push('Do not pay or send any information until you have verified it independently.')
    nextSteps.push('Look up the real phone number or website yourself — never the one given to you in the message.')
    nextSteps.push('Ask someone you trust to read it too. Scams are designed to work on one person alone.')
  } else {
    nextSteps.push('Slow down, and verify before acting, even if this turns out to be real.')
    nextSteps.push('Never pay a fee to an individual, and never pay by gift card, crypto or wire.')
  }

  if (matches.length) {
    const top = matches[0]
    nextSteps.push(`If this is genuine, ask them for a reference number and verify it on the organisation's official website: ${top.reportTo[0]?.url ?? 'https://reportfraud.ftc.gov/'}`)
  }

  const limitations: string[] = [
    'We score patterns, not people. A real bill or a real court notice can look alarming and still be genuine.',
    'We cannot see who actually sent the message, only what it says.',
  ]
  if (benign.length) {
    limitations.push('Some details here look like genuine official formatting — which is exactly why it is worth verifying through the agency\'s own website rather than trusting or discarding it.')
  }
  if (matches.length === 0) {
    limitations.push('Text can be fraudulent without matching any pattern we know. If it asks for money or personal information and you did not expect it, treat it as suspicious regardless of what we found.')
  }
  if (looksOfficial) {
    limitations.push('Fake notices copy real formatting, seals and form numbers, which is exactly why verification means using the agency\'s own website — not judging how official it looks.')
  }

  return {
    severity,
    score,
    matches,
    benign,
    paymentRisks: payments.map((p) => `${p.label}: ${p.why}`),
    looksOfficial,
    summary,
    nextSteps,
    limitations,
  }
}

/* ------------------------------------------------------------------ *
 * Offline grounded answers
 * ------------------------------------------------------------------ */

function uniqueCitations(facts: Fact[]): Citation[] {
  const seen = new Set<string>()
  const out: Citation[] = []
  for (const f of facts) {
    if (seen.has(f.source.url)) continue
    seen.add(f.source.url)
    out.push({ label: f.source.name, url: f.source.url, asOf: f.asOf })
  }
  return out
}

function confidenceFor(top?: ScoredTopic): Answer['confidence'] {
  if (!top || top.score <= 0) return 'none'
  if (top.score >= 14) return 'high'
  if (top.score >= 7) return 'medium'
  return 'low'
}

function fallbackPlan(question: string, stateCode?: string): Answer {
  const terms = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 6)
  const st = stateCode ? stateByCode.get(stateCode) : undefined

  const blocks: AnswerBlock[] = [
    {
      kind: 'unknown',
      heading: 'We do not have a vetted answer for this',
      body:
        'Our library is deliberately limited to things we can cite to an official source, so we would rather say "we do not know" than guess. Here is how to find out fast, and what to avoid.',
      emphasis: 'normal',
    },
    {
      kind: 'steps',
      heading: 'How to get a reliable answer',
      bullets: [
        'Write down the exact question as one sentence, and the deadline, if there is one.',
        `Search the official sources directly, using the agency's own site search rather than a general search engine. Start with USA.gov and the agency for this area (immigration: uscis.gov, taxes: irs.gov, money and credit: consumerfinance.gov, scams: consumer.ftc.gov, housing: hud.gov, work: dol.gov).`,
        terms.length ? `Try these search terms on the official site: ${terms.map((t) => `"${t}"`).join(', ')}.` : '',
        'Ask a free source of help rather than a paid stranger: a legal aid office, a law school clinic, a VITA tax clinic, or 211 (call 2-1-1) which routes to local services in many languages.',
        'Get any answer you receive in writing, with the source, so you can check it again later.',
      ].filter(Boolean),
      emphasis: 'normal',
    },
    {
      kind: 'warning',
      heading: 'While you wait, here is what never changes',
      bullets: [
        'Never pay an individual by gift card, cryptocurrency, wire transfer or payment app for a government fee, a fine, a bond or a "release".',
        'Never share your SSN, ITIN, A-number, bank login or one-time codes with someone who contacted you first.',
        'Never let a cheque you did not expect pass through your account, and never forward money for someone else.',
        'Never let anyone hold your original documents (passport, birth certificate, I-94) as security.',
        'Free help exists: 211, legal aid, VITA clinics, and the agencies themselves. If someone says only they can solve your problem, that is the signal to stop.',
      ],
      emphasis: 'danger',
    },
  ]

  if (st) {
    blocks.push({
      kind: 'unknown',
      heading: `For ${st.name} specifically`,
      body: 'These rules are set at state level, so this is where to look it up. Each link goes to the agency that actually writes the rule.',
      bullets: [
        st.links.tenant ? `Housing and tenants: ${st.links.tenant}` : '',
        st.links.labor ? `Wages and work: ${st.links.labor}` : '',
        st.links.unemployment ? `Unemployment: ${st.links.unemployment}` : '',
        st.links.benefits ? `Benefits / health coverage: ${st.links.benefits}` : '',
        st.links.dmv ? `Driver license and state ID: ${st.links.dmv}` : '',
        st.links.tax ? `State taxes: ${st.links.tax}` : '',
        st.links.insurance ? `Insurance regulator: ${st.links.insurance}` : '',
      ].filter(Boolean),
    })
  }

  return {
    question,
    engine: 'grounded-offline',
    confidence: 'none',
    usedTopicIds: [],
    usedScamIds: [],
    blocks,
    disclaimer: DISCLAIMER,
    isFallbackPlan: true,
  }
}

export function answerOffline(
  question: string,
  opts: { stateCode?: string; limit?: number } = {}
): Answer {
  const started = Date.now()
  const kind = classifyQuestion(question)
  const ranked = retrieveTopics(question, opts.limit ?? 2)
  const top = ranked[0]
  const stateCode = opts.stateCode ?? detectState(question, states)

  // If the question itself looks like scam text, scan it and fold the verdict in.
  const looksLikeScamText =
    question.length > 120 &&
    (kind === 'is-this-scam' || /(received|got|sent me|texted me|called me|email)/i.test(question))
  const verdict = looksLikeScamText || kind === 'is-this-scam' ? scanText(question) : undefined

  if (!top && !verdict) return { ...fallbackPlan(question, stateCode), tookMs: Date.now() - started }

  const confidence = confidenceFor(top)
  const blocks: AnswerBlock[] = []
  const usedTopicIds: string[] = []
  const usedScamIds: string[] = []

  // A weak match is not an answer. Say so before showing anything else.
  if (confidence === 'low' && !verdict) {
    blocks.push({
      kind: 'unknown',
      heading: 'We do not have this one — here is the closest guide we do have',
      body: 'Nothing in our library covers this question directly, so the guide below may not be what you asked. Treat it as background, and confirm anything that matters with the official source listed at the end — or rephrase using the words the agency would use.',
      emphasis: 'normal',
    })
  }

  if (verdict) {
    blocks.push({
      kind: 'scam',
      heading:
        verdict.severity === 'red'
          ? 'Red flag: this matches a known scheme'
          : verdict.severity === 'orange'
            ? 'Careful — this matches a known pattern'
            : 'Warning signs, nothing proven',
      body: verdict.summary,
      bullets: [
        ...verdict.matches.slice(0, 3).map((m) => `${m.name} — what they want: ${m.theAsk}`),
        ...verdict.paymentRisks.slice(0, 3),
      ],
      emphasis: verdict.severity === 'red' ? 'danger' : 'normal',
    })
    blocks.push({
      kind: 'steps',
      heading: 'Do this next',
      bullets: verdict.nextSteps,
      emphasis: 'danger',
    })
    if (verdict.matches.length) {
      const m = verdict.matches[0]
      blocks.push({
        kind: 'warning',
        heading: 'Never, in this situation',
        bullets: m.never,
        emphasis: 'danger',
      })
      usedScamIds.push(m.ruleId)
      blocks.push({
        kind: 'unknown',
        heading: 'Where to report it',
        bullets: m.reportTo.map((r) => `${r.name}: ${r.url}`),
      })
    }
    if (verdict.benign.length) {
      blocks.push({
        kind: 'answer',
        heading: 'Details that look genuinely official',
        bullets: verdict.benign.map((b) => `${b.name} — ${b.why}`),
      })
    }
  }

  if (top) {
    const topic = top.topic
    usedTopicIds.push(topic.id)

    const answerBody =
      kind === 'how-much' || kind === 'deadline'
        ? `${topic.oneLiner}`
        : kind === 'what-are-my-rights'
          ? `${topic.oneLiner} ${topic.whyItMatters}`
          : topic.oneLiner

    blocks.push({
      kind: 'answer',
      heading: 'The short version',
      body: answerBody,
      facts: topic.facts.slice(0, 4),
      citations: uniqueCitations(topic.facts.slice(0, 4)),
    })

    // Jargon that actually appears in the question gets priority.
    const q = question.toLowerCase()
    const relevantJargon = topic.jargon.filter((j) => q.includes(j.term.toLowerCase()))
    const jargon = (relevantJargon.length ? relevantJargon : topic.jargon).slice(0, 5)
    blocks.push({
      kind: 'means',
      heading: 'What the words mean',
      bullets: jargon.map((j) => `${j.term}: ${j.plain}${j.watchOut ? ` — watch out: ${j.watchOut}` : ''}`),
    })

    blocks.push({
      kind: 'steps',
      heading: 'What to do, in order',
      bullets: topic.steps.slice(0, 6),
    })

    blocks.push({
      kind: 'watch',
      heading: 'Where people lose money here',
      bullets: topic.traps.slice(0, 5),
      emphasis: 'danger',
    })

    if (topic.timeline?.length) {
      blocks.push({
        kind: 'timeline',
        heading: 'Timeline',
        bullets: topic.timeline.slice(0, 5).map((t) => `${t.when}: ${t.what}`),
      })
    }

    if (topic.questionsToAsk.length) {
      blocks.push({
        kind: 'questions',
        heading: 'Ask these out loud before you pay or sign',
        bullets: topic.questionsToAsk.slice(0, 5),
      })
    }

    // Related scam rules from this topic
    const relatedScams = topic.relatedScamIds
      .map((id) => scamRuleById.get(id))
      .filter((r): r is NonNullable<typeof r> => Boolean(r))
      .slice(0, 3)
    if (relatedScams.length && !verdict) {
      blocks.push({
        kind: 'warning',
        heading: 'The schemes attached to this topic',
        bullets: relatedScams.map((r) => `${r.name}: ${r.what}`),
        emphasis: 'normal',
      })
      usedScamIds.push(...relatedScams.map((r) => r.id))
    }

    // Second-ranked topic as a "see also"
    const second = ranked[1]
    if (second && second.score >= 6) {
      usedTopicIds.push(second.topic.id)
      blocks.push({
        kind: 'answer',
        heading: 'Also relevant',
        bullets: [`${second.topic.title} — /library/${second.topic.slug}: ${second.topic.oneLiner}`],
      })
    }

    if (topic.officialLinks.length) {
      blocks.push({
        kind: 'unknown',
        heading: 'Official sources',
        bullets: topic.officialLinks.map((l) => `${l.name}: ${l.url}`),
      })
    }
  }

  // State-specific caveat: only when we have verified state facts do we assert anything.
  if (stateCode) {
    const st = stateByCode.get(stateCode)
    if (st) {
      const stateFacts = st.facts ?? []
      blocks.push({
        kind: 'unknown',
        heading:
          stateFacts.length > 0
            ? `Verified facts for ${st.name}`
            : `${st.name}: rules are set locally — here is where to check`,
        body:
          stateFacts.length > 0
            ? 'These carry a source and a date. Everything else about your state you should confirm at the agency link.'
            : 'We deliberately do not quote state legal numbers unless we can cite the state agency. Look these up directly:',
        facts: stateFacts,
        bullets: st.lookUp.slice(0, 5),
        citations: stateFacts.length ? uniqueCitations(stateFacts) : undefined,
      })
      if (!stateFacts.length) {
        blocks.push({
          kind: 'unknown',
          heading: `Official ${st.name} agencies`,
          bullets: [
            st.links.tenant ? `Housing / tenants: ${st.links.tenant}` : '',
            st.links.labor ? `Wages / labor: ${st.links.labor}` : '',
            st.links.benefits ? `Benefits: ${st.links.benefits}` : '',
            st.links.dmv ? `DMV: ${st.links.dmv}` : '',
            st.links.tax ? `Taxes: ${st.links.tax}` : '',
          ].filter(Boolean),
        })
      }
    }
  }

  // Always close with the honesty note.
  blocks.push({
    kind: 'unknown',
    heading: 'What this answer cannot do',
    bullets: [
      ...(confidence === 'low'
        ? ['This question only weakly matched our library, so the guide above may be about something else. Use the official link, not this answer, to decide.']
        : []),
      'It cannot review your specific documents or predict an outcome.',
      'Rules change. Every fact above carries the date it was checked and the official page it came from — re-check the source before you rely on it for something expensive.',
      'For anything involving your immigration status, your taxes, or a dispute with money at stake, get a human professional. Free options exist: legal aid, law school clinics, VITA tax clinics, 211.',
    ],
  })

  return {
    question,
    engine: 'grounded-offline',
    confidence,
    usedTopicIds: [...new Set(usedTopicIds)],
    usedScamIds: [...new Set(usedScamIds)],
    blocks,
    disclaimer: DISCLAIMER,
    isFallbackPlan: false,
    tookMs: Date.now() - started,
  }
}

/** Compact grounding text handed to the LLM. Only these facts may be asserted. */
export function buildGrounding(question: string, limit = 3) {
  const ranked = retrieveTopics(question, limit)
  const parts: string[] = []
  const usedTopicIds: string[] = []
  const usedScamIds: string[] = []

  for (const { topic } of ranked) {
    usedTopicIds.push(topic.id)
    parts.push(`### TOPIC: ${topic.title} (${topic.slug})`)
    parts.push(`Short answer: ${topic.oneLiner}`)
    parts.push(`Why it matters: ${topic.whyItMatters}`)
    parts.push('FACTS (each with its date and source — cite the source name and the asOf date when you use one):')
    for (const f of topic.facts) {
      parts.push(`- [${f.asOf}] ${f.claim}${f.detail ? ` ${f.detail}` : ''} (Source: ${f.source.name}, ${f.source.url}; volatility: ${f.volatility})`)
    }
    parts.push('STEPS: ' + topic.steps.join(' | '))
    parts.push('TRAPS: ' + topic.traps.join(' | '))
    if (topic.timeline?.length) parts.push('TIMELINE: ' + topic.timeline.map((t) => `${t.when} -> ${t.what}`).join(' | '))
    parts.push('QUESTIONS TO ASK: ' + topic.questionsToAsk.join(' | '))
    parts.push('JARGON: ' + topic.jargon.map((j) => `${j.term} = ${j.plain}`).join(' | '))
    parts.push('OFFICIAL LINKS: ' + topic.officialLinks.map((l) => `${l.name} (${l.url})`).join(' | '))
    const scams = topic.relatedScamIds.map((id) => scamRuleById.get(id)).filter(Boolean)
    for (const sc of scams) {
      if (!sc) continue
      usedScamIds.push(sc.id)
      parts.push(`RELATED SCAM — ${sc.name}: ${sc.what} | Lever: ${sc.whyItWorks} | The ask: ${sc.theAsk} | Do: ${sc.whatToDo.join(' | ')} | Never: ${sc.never.join(' | ')}`)
    }
  }

  if (!ranked.length) {
    parts.push('NO MATCHING TOPIC. Do not answer from general knowledge. Instead produce a short "how to find out safely" plan: which official source to check, the exact search terms to use, and the never-do rules (no gift cards, crypto, wires or payment apps to individuals; never share SSN or one-time codes; free help exists via legal aid, VITA, 211).')
  }

  return { context: parts.join('\n'), usedTopicIds, usedScamIds, hasGrounding: ranked.length > 0, topScore: ranked[0]?.score ?? 0 }
}

export function libraryTopicList() {
  return topics.map((t) => ({ id: t.id, slug: t.slug, title: t.title, category: t.category }))
}
