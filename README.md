# SettleSafe

**An AI guide to life in the US — rent, taxes, insurance, credit and scam protection — built so that no claim exists without a date and an official source.**

SettleSafe exists because of a specific, well-documented problem: immigrants spend their first years in the US learning the system by trial and error, and the errors cost money. Not knowing how a deposit works, what a pay stub should show, what "deductible" means, or what a real USCIS letter looks like is expensive in a country where the default answer for a newcomer is whatever the person in front of them decides to say.

Most tools in this space answer confidently. SettleSafe is built to answer **verifiably**.

---

## The core design rule

> Nothing in this codebase may assert a US rule, number, deadline, fee or legal standard without a `source` and an `asOf` date.

This is enforced in three places:

1. **The type system.** `Fact` in `lib/types.ts` requires `asOf`, `source`, and a `volatility` rating (`stable` / `annual` / `volatile`). A fact without a source does not compile.
2. **The UI.** Every fact renders with "Checked 2026-09 · USCIS" and a link. Facts flagged `volatile` are marked *recently changing — re-check*.
3. **The LLM layer.** If a model is configured, it may only restate facts from the retrieval context, must attach the date and source, and is instructed to answer "our library does not cover this" rather than improvise. It is also forbidden from inventing state-specific numbers.

And a fourth rule, which turned out to be the most valuable one:

4. **"We do not know" is a first-class answer.** Housing, wage, benefit and licensing rules are set state by state and change constantly. Rather than guess, the app routes you to your state's official agency and tells you the exact question to ask. `answerOffline()` returns a *search plan* (`isFallbackPlan: true`) when nothing in the library covers the question — with the never-do rules still attached, because those hold regardless.

---

## The three surfaces

### 1. Ask the guide — `/guide`

Plain-language answers in simple English, assembled from 27 vetted guides / 162 dated facts / 119 official sources. Each answer is structured as: short version → what the words mean → what to do in order → where people lose money → timeline → questions to ask out loud → official sources → *what this answer cannot do*.

### 2. Scam Radar — `/radar`

Paste a text message, job offer, rental listing, letter or voice-message transcript. It is matched against **40 named schemes** aimed specifically at immigrants (notario fraud, fake USCIS fees, money-mule recruitment, immigration bond fraud, TSU/utility shut-off threats, fake-check "equipment" jobs, fake sponsorship, marriage-fraud offers, debt-collection threats that mention deportation, and more).

Each verdict gives: a severity, the named scheme, *why that script works on someone new to the country*, what they are trying to get you to do, verbatim evidence snippets from your text, and the never-do list.

It also does the harder thing: **it does not cry wolf on genuine official mail.** Real USCIS, IRS and immigration-court notices mention USCIS, the IRS and the courts — a naive keyword scanner would flag them as fraud and train people to ignore real deadlines. If a message contains several verifiable identifiers (USCIS receipt-number format, form numbers, IRS notice codes, EOIR case identifiers, `.gov` portals) *and* asks for no money *and* makes no threat, the score is capped and the app switches to "this may be genuine — verify it in one minute" with the exact verification steps.

Paste-able demo cases are built into the UI, covering both directions.

### 3. Your roadmap — `/roadmap`

A short intake (status, state, what you already have) generates a phased plan: **Do now / First 90 days / First year / Every year**, plus status-specific alerts. Highlights:

- **EAD renewal alarms.** DHS ended the automatic 540-day extension for renewal applications filed on or after **October 30, 2025**. This is the single most expensive date on an immigrant's calendar and most advice still in circulation is out of date. The wizard raises a high-severity alert inside 120 days of expiry and tells you to file at the 180-day mark.
- **Public charge change.** DHS's final rule rescinding the 2022 public-charge regulation took effect **September 18, 2026**, returning officers to a broader discretionary standard. The roadmap tells affected statuses to get case-specific advice before accepting or refusing a benefit — from legal aid, not a forum.
- **The things nobody mentions:** Selective Service registration for males 18–25 (it can affect later immigration applications), the 10-day AR-11 address-change requirement, FBAR/Form 8938 reporting for home-country accounts, ITIN expiry after three unused years, and the free credit freezes that prevent someone loading debt onto an empty credit file.
- Every item states its cost, one concrete action, and an official link.
- Checkbox progress is stored in the browser only. The intake is never persisted server-side.

---

## Running it

```bash
npm install
npm run dev      # http://0.0.0.0:3000
npm run build && npm start
npm test         # 37 tests, no network access needed
npm run lint     # tsc --noEmit
```

### Model configuration (optional)

The product is fully functional with **no API key** — the grounded offline engine answers from the curated library. To switch on model-written answers grounded in the same library, set any one of:

| Variable | Provider |
| --- | --- |
| `OPENAI_API_KEY` (+ `OPENAI_MODEL`, `OPENAI_BASE_URL`) | OpenAI |
| `ANTHROPIC_API_KEY` (+ `ANTHROPIC_MODEL`) | Anthropic |
| `OPENROUTER_API_KEY` (+ `OPENROUTER_MODEL`) | OpenRouter |
| `GROQ_API_KEY` (+ `GROQ_MODEL`) | Groq |
| `OLLAMA_BASE_URL` (+ `OLLAMA_MODEL`) | Ollama (local) |
| `SETTLESAFE_LLM=off` | Force the offline engine |

If a model call fails, is rate-limited, or returns unparseable output, the API silently falls back to the grounded offline answer (`engine: "llm+grounded-fallback"`) so the user never sees an empty screen. `GET /api/status` reports which engine is live and the library inventory (never keys).

---

## API

| Endpoint | Purpose |
| --- | --- |
| `POST /api/ask` | `{ question, stateCode? }` → grounded `Answer` |
| `POST /api/scan` | `{ text }` → `ScamVerdict` |
| `POST /api/roadmap` | intake profile → phased `Roadmap` + alerts |
| `GET /api/status` | engine mode + library inventory |

---

## Repository map

```
app/
  page.tsx                  landing: what changed recently, coverage, honesty section
  guide/                    chat surface
  radar/                    scam radar + "if money already left" runbook
  roadmap/                  intake wizard + plan
  library/, library/[slug]/ 27 guides, statically generated
  api/{ask,scan,roadmap,status}/
components/                 SiteNav, AnswerView, ScamRadar, GuideChat, RoadmapWizard
lib/
  types.ts                  the schema that enforces sourced, dated facts
  knowledge/                the content: paperwork, money, home, health, work, safety
  scams.ts                  40 scam rules: patterns, psychology, the ask, never-do, report-to
  search.ts                 tokenizing, immigrant-phrasing synonyms, rule matching,
                            payment-risk / pressure / benign-official detectors
  engine.ts                 scam verdicts + the grounded offline answer composer
  llm.ts                    pluggable provider, JSON block parsing, grounded fallback
  roadmap.ts                rule engine producing the phased plan and alerts
  states.ts                 20 states of official agency links + "what to look up" questions
tests/engine.test.ts        37 tests, including library-integrity enforcement
```

---

## Testing philosophy

The test suite checks the product's promises, not just its functions:

- **Library integrity:** no duplicate ids/slugs; *every* fact has a parseable `asOf`, a source name, an `http(s)` URL and a validity rating; every `relatedScamIds` reference resolves; every topic has a minimum number of facts, steps, traps, jargon terms and official links; every state has at least three official agencies.
- **Scam precision (both directions):** the SSN impersonation call and the money-mule job are red; a genuine USCIS notice and a genuine IRS CP2000 are capped as "verify, may be genuine"; an ordinary message produces no accusation and an explicit statement that no guarantee of legitimacy is being made.
- **Answer honesty:** questions with no coverage return `confidence: "none"` and `isFallbackPlan: true` with a search plan; every answer ends with a "what this cannot do" block; state facts are only asserted where a dated source exists.
- **Roadmap correctness:** the EAD alert fires inside the window and cites the October 2025 rule change; work-authorized statuses route to SSN and others to ITIN; the public-charge item cites the September 18, 2026 effective date.

---

## What this deliberately does not do

- **It is not a lawyer, accountant or financial adviser.** It states general rules and pushes you to a licensed attorney, a legal aid office, or a free VITA tax clinic for anything case-specific.
- **It does not store your identity.** No accounts, no server-side profile storage. The roadmap lives in your browser.
- **It does not quote state legal numbers it cannot cite.** Those slots are explicit: here is the agency, here is the question to ask.
- **It does not give immigration advice about your particular case,** and it says so in every answer.

---

## Volatility: the content is the maintenance burden

Seven facts in the library are currently flagged `volatile`, and they are the reason the app shows check dates rather than just answers. Examples as of this writing: the public charge rule (effective 2026-09-18), the end of EAD automatic extensions (2025-10-30), Marketplace premium tax credit restrictions for lawfully present immigrants (2026 and 2027 phases), the vacated CFPB medical-debt credit-reporting rule, and the shifting litigation around H-1B fees and TPS designations.

The intended workflow is: when you re-verify a fact against the official source, bump its `asOf` — nothing else needs to change, and the UI, tests and LLM grounding all pick up the new date.

## Sources

Every fact cites a primary or official source — SSA, IRS, USCIS, CBP, DOL, OSHA, CMS, HHS, HUD, FTC, CFPB, FCC, FDIC, FinCEN, DOJ/EOIR, NHTSA, USPIS, NAIC, USDA, state agencies, and the Federal Register. Where a claim concerns a moving legal situation, the fact includes an `alsoCheck` link.

SettleSafe is not affiliated with any government agency. If a page on this site is wrong, the official source is right — and the link is one click away on every fact, on purpose.
