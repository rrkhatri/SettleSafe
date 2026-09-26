import { describe, expect, it } from 'vitest'
import { answerOffline, scanText, buildGrounding } from '../lib/engine'
import { topics, topicById } from '../lib/knowledge'
import { scamRules, scamRuleById } from '../lib/scams'
import { buildRoadmap, type Profile } from '../lib/roadmap'
import { states, findState } from '../lib/states'
import { matchScamRules } from '../lib/search'

/* ------------------------------------------------------------------ *
 * The rule this whole codebase is built on
 * ------------------------------------------------------------------ */

describe('library integrity', () => {
  it('has no duplicate topic ids or slugs', () => {
    const ids = topics.map((t) => t.id)
    const slugs = topics.map((t) => t.slug)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('never asserts a fact without a date and an official source', () => {
    for (const topic of topics) {
      for (const fact of topic.facts) {
        expect(fact.asOf, `${topic.id}/${fact.id} is missing asOf`).toMatch(/^\d{4}(-\d{2}(-\d{2})?)?$/)
        expect(fact.source.name.length, `${topic.id}/${fact.id} has no source name`).toBeGreaterThan(3)
        expect(fact.source.url, `${topic.id}/${fact.id} has a non-http source`).toMatch(/^https?:\/\//)
        expect(fact.claim.length, `${topic.id}/${fact.id} claim is too short`).toBeGreaterThan(20)
        expect(['stable', 'annual', 'volatile']).toContain(fact.volatility)
      }
    }
  })

  it('only links to scam rules that exist', () => {
    for (const topic of topics) {
      for (const id of topic.relatedScamIds) {
        expect(scamRuleById.has(id), `${topic.id} references unknown scam rule "${id}"`).toBe(true)
      }
    }
  })

  it('gives every topic real, actionable content', () => {
    for (const topic of topics) {
      expect(topic.facts.length, `${topic.id} has too few facts`).toBeGreaterThanOrEqual(3)
      expect(topic.steps.length, `${topic.id} has too few steps`).toBeGreaterThanOrEqual(3)
      expect(topic.traps.length, `${topic.id} has too few traps`).toBeGreaterThanOrEqual(3)
      expect(topic.jargon.length, `${topic.id} has too little jargon`).toBeGreaterThanOrEqual(3)
      expect(topic.officialLinks.length, `${topic.id} has too few official links`).toBeGreaterThanOrEqual(2)
      expect(topic.explain.join(' ').length, `${topic.id} has too little explanation`).toBeGreaterThan(300)
    }
  })

  it('links every state to at least three official agencies', () => {
    for (const s of states) {
      const links = Object.values(s.links).filter(Boolean) as string[]
      expect(links.length, `${s.code} has too few agency links`).toBeGreaterThanOrEqual(3)
      for (const url of links) expect(url).toMatch(/^https?:\/\//)
      expect(s.lookUp.length).toBeGreaterThan(3)
    }
    expect(findState('CA')?.name).toBe('California')
    expect(findState('california')?.code).toBe('CA')
  })

  it('scam rules are unique, weighted and actionable', () => {
    const ids = scamRules.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const rule of scamRules) {
      expect(rule.patterns.length, `${rule.id} has no patterns`).toBeGreaterThan(0)
      expect(rule.weight).toBeGreaterThan(0)
      expect(rule.never.length, `${rule.id} does not say what never to do`).toBeGreaterThan(0)
      expect(rule.whatToDo.length, `${rule.id} does not say what to do`).toBeGreaterThan(0)
      expect(rule.reportTo.length, `${rule.id} has nowhere to report`).toBeGreaterThan(0)
      for (const p of rule.patterns) expect(() => new RegExp(p)).not.toThrow()
    }
  })
})

/* ------------------------------------------------------------------ *
 * Scam Radar behaviour
 * ------------------------------------------------------------------ */

describe('scam radar', () => {
  it('flags a government-impersonation call as high risk', () => {
    const text =
      'This is Officer Ramirez from the Social Security Administration. Your Social Security Number has been suspended. There is an arrest warrant for your arrest unless you verify your identity. Pay the release fee immediately using gift cards. Do not tell anyone about this call.'
    const verdict = scanText(text)
    expect(verdict.severity).toBe('red')
    expect(verdict.matches.some((m) => m.ruleId === 'gov-impersonation')).toBe(true)
    expect(verdict.paymentRisks.join(' ')).toMatch(/gift card/i)
    expect(verdict.matches[0].evidence.length).toBeGreaterThan(0)
  })

  it('flags money-mule recruitment', () => {
    const text =
      'We are hiring remote payment processing agents. You will receive funds into your US bank account and forward them to our supplier, keeping a 10% commission. Send your bank details and we will start immediately.'
    const verdict = scanText(text)
    expect(['orange', 'red']).toContain(verdict.severity)
    expect(verdict.matches.some((m) => m.ruleId === 'money-mule')).toBe(true)
  })

  it('does not scream at a real-looking USCIS notice, and names what looks official', () => {
    const text =
      'Department of Homeland Security, U.S. Citizenship and Immigration Services. Notice of Action, Form I-797C. Receipt Number: IOE0123456789. Your application was received and is being processed. Visit uscis.gov/casestatus to check your case.'
    const verdict = scanText(text)
    expect(verdict.severity).toBe('yellow')
    expect(verdict.benign.length).toBeGreaterThan(0)
    expect(verdict.limitations.length).toBeGreaterThan(0)
  })

  it('returns generic guidance rather than a false accusation for innocuous text', () => {
    const verdict = scanText('Hi, the plumber can come on Tuesday between 9 and 11 in the morning, does that work for you?')
    expect(verdict.matches.length).toBe(0)
    expect(verdict.severity).toBe('yellow')
    expect(verdict.summary).toMatch(/not a guarantee/i)
  })

  it('treats crypto and gift cards as hard stops', () => {
    const text = 'Send the deposit in bitcoin to reserve the unit, or use a gift card if that is easier. Pay today.'
    const risks = scanText(text).paymentRisks
    expect(risks.length).toBeGreaterThanOrEqual(1)
  })

  it('only matches rules with actual pattern evidence', () => {
    const hits = matchScamRules('Congratulations, you have won a free cruise. Call now to claim.')
    for (const hit of hits) expect(hit.evidence.length).toBeGreaterThan(0)
  })

  it('catches the family-emergency script even when it is worded indirectly', () => {
    const text =
      'Grandma it is me your grandson, I am in jail and need bail money urgently. Please do not tell my parents. Send money by Zelle to my new number right now.'
    const v = scanText(text)
    expect(v.matches.some((m) => m.ruleId === 'family-emergency')).toBe(true)
    expect(v.severity).toBe('red')
  })

  it('catches a utility shut-off threat', () => {
    const v = scanText(
      'Your electric service will be disconnected within 45 minutes. A reconnection fee of $480 must be paid now via prepaid card. Stay on the line.'
    )
    expect(v.matches.some((m) => m.ruleId === 'utility-shutoff')).toBe(true)
  })

  it('treats a genuine-looking IRS notice as "verify", not "fraud"', () => {
    const v = scanText(
      'IRS Notice CP2000. Our records show a discrepancy on your 2024 return. You may respond within 30 days by mail to the address on this notice, or log in to your IRS online account. Do not send cash.'
    )
    expect(v.looksOfficial).toBe(true)
    expect(v.severity).toBe('yellow')
    expect(v.nextSteps.join(' ')).toMatch(/egov\.uscis\.gov|irs\.gov|EOIR/i)
  })

  it('does not accuse an ordinary message, and does not reassure falsely', () => {
    const v = scanText('Hi, the plumber can come on Tuesday between 9 and 11 in the morning, does that work for you?')
    expect(v.severity).toBe('yellow')
    expect(v.score).toBe(0)
    expect(v.limitations.join(' ')).toMatch(/without matching any pattern/i)
  })

  it('does not pretend to answer an off-topic question just because one word matched', () => {
    const answer = answerOffline('How do I register my pet iguana with the city of Boise?')
    expect(answer.confidence).toBe('low')
    expect(answer.blocks[0].heading).toMatch(/closest guide we do have/i)
    expect(answer.blocks.at(-1)?.bullets?.join(' ')).toMatch(/weakly matched/i)
  })

  it('keeps the "we cannot do this" block on every answer, including a good one', () => {
    const answer = answerOffline('How do I build credit from zero?')
    expect(answer.confidence).toBe('high')
    const last = answer.blocks.at(-1)
    expect(last?.heading).toBe('What this answer cannot do')
    expect(last?.bullets?.length).toBeGreaterThanOrEqual(3)
  })

  it('keeps a real deadline notice above a false negative, even at the floor', () => {
    // The floor for a "looks official" document is capped, not zeroed: a real
    // notice still needs the reader's attention.
    const v = scanText('USCIS Form I-797C Receipt Number: MSC1234567890. Visit uscis.gov/casestatus for details.')
    expect(v.looksOfficial).toBe(true)
    expect(v.score).toBeLessThanOrEqual(18)
  })
})

/* ------------------------------------------------------------------ *
 * Grounded answers
 * ------------------------------------------------------------------ */

describe('offline answer engine', () => {
  it('answers a credit question from the credit topic with sourced facts', () => {
    const answer = answerOffline('How do I build credit with no credit history?')
    expect(answer.isFallbackPlan).toBe(false)
    expect(['high', 'medium']).toContain(answer.confidence)
    expect(answer.usedTopicIds).toContain('topic-credit-score')
    const factBlock = answer.blocks.find((b) => b.facts?.length)
    expect(factBlock).toBeTruthy()
    for (const fact of factBlock?.facts ?? []) {
      expect(fact.asOf).toBeTruthy()
      expect(fact.source.url).toMatch(/^https?:\/\//)
    }
  })

  it('answers an EAD question and surfaces the October 2025 change', () => {
    const answer = answerOffline('My work permit expires, when should I renew my EAD?')
    expect(answer.usedTopicIds).toContain('topic-work-permit-ead')
    const text = JSON.stringify(answer)
    expect(text).toMatch(/540-day|automatic extension/i)
    expect(text).toMatch(/2025-10-30/)
  })

  it('says it does not know instead of guessing, and gives a search plan', () => {
    const answer = answerOffline('What is the airspeed velocity of an unladen swallow in Nebraska?')
    expect(answer.confidence).toBe('none')
    expect(answer.isFallbackPlan).toBe(true)
    const text = JSON.stringify(answer)
    expect(text).toMatch(/do not have a vetted answer/i)
    expect(text).toMatch(/gift card/i)
  })

  it('adds verified state facts only where they exist, and an agency list otherwise', () => {
    const ca = answerOffline('Can my landlord keep my security deposit in California?')
    const caText = JSON.stringify(ca)
    expect(caText).toMatch(/one month/i)
    expect(caText).toMatch(/dca\.ca\.gov/)

    const tx = answerOffline('How much notice does my landlord need in Texas before entering?')
    const txText = JSON.stringify(tx)
    expect(txText).toMatch(/texas/i)
    expect(txText).toMatch(/tdhca\.texas\.gov|rules are set locally/i)
  })

  it('always closes with the limits of the answer', () => {
    const answer = answerOffline('How do I open a bank account without an SSN?')
    const headings = answer.blocks.map((b) => b.heading)
    expect(headings.some((h) => /cannot do/i.test(h))).toBe(true)
    expect(answer.disclaimer).toMatch(/not a lawyer/i)
  })

  it('folds a scam scan into the answer when the question is suspicious text', () => {
    const answer = answerOffline(
      'I received this: "Your SSN is suspended, press 1 to speak to a federal officer, pay the fine with gift cards or you will be deported immediately." Is this real or fake?'
    )
    expect(answer.usedScamIds.length).toBeGreaterThan(0)
    expect(answer.blocks.some((b) => b.kind === 'scam')).toBe(true)
  })

  it('grounds the LLM prompt in dated facts and forbids invention', () => {
    const grounding = buildGrounding('What happens if I do not file my taxes?')
    expect(grounding.context).toMatch(/\[\d{4}-\d{2}\]/)
    expect(grounding.context).toMatch(/Source:/)
    expect(grounding.hasGrounding).toBe(true)

    const empty = buildGrounding('qqqq zzzz')
    expect(empty.hasGrounding).toBe(false)
    expect(empty.context).toMatch(/Do not answer from general knowledge/i)
  })
})

/* ------------------------------------------------------------------ *
 * Roadmap
 * ------------------------------------------------------------------ */

describe('roadmap engine', () => {
  const base: Profile = {
    status: 'asylum-pending',
    state: 'NY',
    hasSSN: false,
    hasITIN: false,
    hasBankAccount: false,
    hasCreditCard: false,
    employed: true,
    paidOnBooks: false,
    hasCar: false,
    hasKids: false,
    age18to25Male: false,
    hasForeignAccounts: true,
    needsHealthCoverage: true,
  }

  it('always covers the fundamentals, whatever the answers', () => {
    const rm = buildRoadmap({ ...base, status: 'unsure' })
    const ids = rm.phases.flatMap((p) => p.items.map((i) => i.id))
    expect(ids).toContain('docs-folder')
    expect(ids).toContain('ar11-habit')
    expect(ids).toContain('scam-shield')
    expect(ids).toContain('tax-season')
  })

  it('escalates a work permit that expires soon', () => {
    const soon = new Date(Date.now() + 100 * 86_400_000).toISOString().slice(0, 10)
    const rm = buildRoadmap({ ...base, eadExpiry: soon })
    const alert = rm.alerts.find((a) => a.id === 'ead-expiry')
    expect(alert).toBeTruthy()
    expect(alert?.severity).toBe('high')
    expect(alert?.detail).toMatch(/October 30, 2025/)
  })

  it('does not raise an EAD alert for a distant expiry, but still asks for the date', () => {
    const far = new Date(Date.now() + 400 * 86_400_000).toISOString().slice(0, 10)
    const rm = buildRoadmap({ ...base, eadExpiry: far })
    expect(rm.alerts.some((a) => a.id === 'ead-expiry')).toBe(false)

    const noDate = buildRoadmap({ ...base, eadExpiry: undefined })
    const ids = noDate.phases.flatMap((p) => p.items.map((i) => i.id))
    expect(ids).toContain('ead-date-check')
  })

  it('adds conditional items based on the profile', () => {
    const rm = buildRoadmap({
      ...base,
      hasBankAccount: false,
      hasForeignAccounts: true,
      hasKids: true,
      age18to25Male: true,
    })
    const ids = rm.phases.flatMap((p) => p.items.map((i) => i.id))
    expect(ids).toContain('open-bank')
    expect(ids).toContain('foreign-account-reporting')
    expect(ids).toContain('kids-programs')
    expect(ids).toContain('selective-service')
    // Work-authorized statuses are routed to an SSN, not an ITIN.
    expect(ids).toContain('get-ssn')
    expect(ids).not.toContain('get-itin')
  })

  it('routes people without work authorization to an ITIN instead of an SSN', () => {
    const rm = buildRoadmap({ ...base, status: 'undocumented' })
    const ids = rm.phases.flatMap((p) => p.items.map((i) => i.id))
    expect(ids).toContain('get-itin')
    expect(ids).not.toContain('get-ssn')
  })

  it('tells anyone with a work permit to record the expiry date', () => {
    const rm = buildRoadmap({ ...base, status: 'tps', eadExpiry: undefined })
    const ids = rm.phases.flatMap((p) => p.items.map((i) => i.id))
    expect(ids).toContain('ead-date-check')
    expect(rm.alerts.some((a) => a.id === 'tps-watch')).toBe(true)
  })

  it('warns about the public charge change for statuses it affects', () => {
    const rm = buildRoadmap(base)
    const item = rm.phases.flatMap((p) => p.items).find((i) => i.id === 'public-charge-check')
    expect(item).toBeTruthy()
    expect(item?.why).toMatch(/September 18, 2026/)
  })

  it('gives every roadmap item an official link and a stated cost', () => {
    const rm = buildRoadmap(base)
    for (const item of rm.phases.flatMap((p) => p.items)) {
      expect(item.links.length, `${item.id} has no official link`).toBeGreaterThan(0)
      expect(item.cost.length, `${item.id} has no cost`).toBeGreaterThan(0)
      expect(item.action.length, `${item.id} has no action`).toBeGreaterThan(10)
      expect(item.trackId).toBe(`done:${item.id}`)
    }
  })
})

/* ------------------------------------------------------------------ *
 * Sanity checks on the library's own reach
 * ------------------------------------------------------------------ */

describe('coverage', () => {
  it('covers the four domains from the problem statement', () => {
    const cats = new Set(topics.map((t) => t.category))
    expect(cats.has('home')).toBe(true) // rent
    expect(cats.has('money')).toBe(true) // taxes, credit
    expect(cats.has('health')).toBe(true) // insurance / health
    expect(cats.has('safety')).toBe(true) // scam protection
  })

  it('has at least one vetted answer for common newcomer questions', () => {
    const questions = [
      'How do I get a Social Security number?',
      'Do I need an ITIN to file taxes?',
      'Can a landlord charge two months deposit?',
      'How much is overtime pay?',
      'What do I do if I am injured at work?',
      'How do I stop a utility shut off?',
      'How do I send money home cheaply?',
      'What happens if someone steals my identity?',
    ]
    for (const q of questions) {
      const answer = answerOffline(q)
      expect(answer.isFallbackPlan, `no vetted answer for: ${q}`).toBe(false)
    }
  })

  it('keeps topic lookups working for every related topic id', () => {
    for (const rule of scamRules) {
      if (rule.relatedTopicId) {
        expect(topicById.has(rule.relatedTopicId), `${rule.id} points at missing topic`).toBe(true)
      }
    }
  })
})
