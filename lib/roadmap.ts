import type { Source } from './types'
import { stateByCode } from './states'

/**
 * Roadmap engine: turns a short intake into a dated, prioritized plan.
 *
 * Every item says WHY it matters now, what it costs, and where the official
 * rule lives. Nothing here is legal advice; the heavy items route to a human.
 */

export type ImmigrationStatus =
  | 'lpr'
  | 'naturalized'
  | 'work-visa'
  | 'student'
  | 'asylum-pending'
  | 'tps'
  | 'daca'
  | 'parolee'
  | 'refugee'
  | 'undocumented'
  | 'unsure'

export type Profile = {
  arrivalYear?: number
  status: ImmigrationStatus
  state: string
  hasSSN: boolean
  hasITIN: boolean
  hasBankAccount: boolean
  hasCreditCard: boolean
  employed: boolean
  paidOnBooks: boolean
  hasCar: boolean
  hasKids: boolean
  age18to25Male: boolean
  hasForeignAccounts: boolean
  eadExpiry?: string
  needsHealthCoverage: boolean
}

export type RoadmapItem = {
  id: string
  title: string
  why: string
  /** Rough cost, stated as "free" or a range, or "varies". */
  cost: string
  /** Time sensitivity. */
  urgency: 'now' | 'soon' | 'this-year' | 'recurring'
  /** One concrete action. */
  action: string
  links: Source[]
  /** For the "I did this" checkbox. */
  trackId: string
}

export type RoadmapPhase = {
  id: 'first-2-weeks' | 'first-90-days' | 'first-year' | 'every-year'
  label: string
  blurb: string
  items: RoadmapItem[]
}

export type Alert = {
  id: string
  severity: 'high' | 'medium' | 'info'
  title: string
  detail: string
  link?: Source
}

export type Roadmap = {
  phases: RoadmapPhase[]
  alerts: Alert[]
  stateName?: string
  generatedAt: string
}

const L = {
  ssa: { name: 'SSA — Social Security number and card', url: 'https://www.ssa.gov/number-card' },
  itin: { name: 'IRS — ITIN', url: 'https://www.irs.gov/individuals/individual-taxpayer-identification-number' },
  bank: { name: 'CFPB — Bank accounts', url: 'https://www.consumerfinance.gov/consumer-tools/bank-accounts/' },
  bankon: { name: 'Bank On — certified low-cost accounts', url: 'https://joinbankon.org/' },
  creditReport: { name: 'AnnualCreditReport.com', url: 'https://www.annualcreditreport.com/' },
  freeze: { name: 'FTC — Free credit freezes', url: 'https://consumer.ftc.gov/articles/place-security-freeze-your-credit-file' },
  securedCard: { name: 'CFPB — Secured credit cards', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-secured-credit-card-en-1371/' },
  ar11: { name: 'USCIS — Change of address (AR-11)', url: 'https://www.uscis.gov/addresschange' },
  i94: { name: 'CBP — I-94 official site', url: 'https://i94.cbp.dhs.gov/' },
  ead: { name: 'USCIS — Form I-765', url: 'https://www.uscis.gov/i-765' },
  eadAuto: { name: 'USCIS — End of automatic EAD extensions (Oct 30, 2025)', url: 'https://www.uscis.gov/save/current-user-agencies/news-alerts/interim-final-rule-published-ending-the-practice-of-automatically-extending-certain-eads' },
  processing: { name: 'USCIS — Case processing times', url: 'https://egov.uscis.gov/processing-times/' },
  fee: { name: 'USCIS — Fee schedule (G-1055)', url: 'https://www.uscis.gov/sites/default/files/document/forms/g-1055.pdf' },
  caseStatus: { name: 'USCIS — Case status online', url: 'https://egov.uscis.gov/casestatus' },
  proBono: { name: 'EOIR — List of pro bono legal service providers', url: 'https://www.justice.gov/eoir/list-pro-bono-legal-service-providers' },
  aclu: { name: 'ACLU — Know your rights', url: 'https://www.aclu.org/know-your-rights/immigrants-rights' },
  scamShield: { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
  idTheft: { name: 'FTC — IdentityTheft.gov', url: 'https://www.identitytheft.gov/' },
  tc: { name: 'DOL — Tipped workers / wages', url: 'https://www.dol.gov/agencies/whd/tipped-workers' },
  whd: { name: 'DOL — File a wage complaint', url: 'https://www.dol.gov/agencies/whd/contact/complaints' },
  minimumWage: { name: 'DOL — Minimum wage (federal and state)', url: 'https://www.dol.gov/agencies/whd/minimum-wage' },
  osha: { name: 'OSHA — Worker rights', url: 'https://www.osha.gov/workers' },
  ui: { name: 'DOL — Unemployment insurance', url: 'https://www.dol.gov/general/topic/unemployment-insurance' },
  healthcare: { name: 'HealthCare.gov — Immigrants and coverage', url: 'https://www.healthcare.gov/immigrants/lawfully-present-immigrants/' },
  sep: { name: 'HealthCare.gov — Special enrollment', url: 'https://www.healthcare.gov/coverage-outside-open-enrollment/special-enrollment-period/' },
  hc: { name: 'HRSA — Find a community health center', url: 'https://findahealthcenter.hrsa.gov/' },
  medicaid: { name: 'Medicaid.gov — Eligibility', url: 'https://www.medicaid.gov/medicaid/eligibility/' },
  noSurprises: { name: 'CMS — No Surprises Act', url: 'https://www.cms.gov/nosurprises/consumers' },
  wic: { name: 'USDA — WIC', url: 'https://www.fns.usda.gov/wic' },
  schoolMeals: { name: 'USDA — School meals', url: 'https://www.fns.usda.gov/cn' },
  snap: { name: 'SNAP — Eligibility and application (USDA)', url: 'https://www.fns.usda.gov/snap/recipient/eligibility' },
  liheap: { name: 'LIHEAP — Energy assistance', url: 'https://www.acf.hhs.gov/ocs/programs/liheap' },
  sss: { name: 'Selective Service — Register', url: 'https://www.sss.gov/register/' },
  irsFree: { name: 'IRS — Free tax preparation (VITA)', url: 'https://www.irs.gov/individuals/free-tax-return-preparation-for-you-by-volunteers' },
  irsAliens: { name: 'IRS — Publication 519, Tax Guide for Aliens', url: 'https://www.irs.gov/publications/p519' },
  fbar: { name: 'IRS — FBAR (foreign accounts)', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/report-of-foreign-bank-and-financial-accounts-fbar' },
  irsProtect: { name: 'IRS — Identity protection', url: 'https://www.irs.gov/individuals/identity-protection' },
  i9: { name: 'USCIS — Form I-9', url: 'https://www.uscis.gov/i-9' },
  dmv: { name: 'USA.gov — Driver licenses and state IDs', url: 'https://www.usa.gov/motor-vehicle-services' },
  realId: { name: 'DHS — REAL ID', url: 'https://www.dhs.gov/real-id' },
  fairHousing: { name: 'HUD — Fair housing complaints', url: 'https://www.hud.gov/program_offices/fair_housing_equal_opp/online-complaint' },
  tenant: { name: 'HUD — Tenant rights', url: 'https://www.hud.gov/topics/rental_assistance/tenantrights' },
  ci: { name: 'USCIS — Citizenship eligibility', url: 'https://www.uscis.gov/citizenship/learn-about-citizenship/citizenship-and-naturalization' },
  publicCharge: { name: 'USCIS — Public charge', url: 'https://www.uscis.gov/green-card/green-card-processes-and-procedures/public-charge' },
  service211: { name: '211 — Local help, many languages', url: 'https://www.211.org/' },
  trafficking: { name: 'National Human Trafficking Hotline', url: 'https://humantraffickinghotline.org/' },
  legalAid: { name: 'USA.gov — Legal aid', url: 'https://www.usa.gov/legal-aid' },
  womensLaw: { name: 'USA.gov — Housing help', url: 'https://www.usa.gov/housing-help' },
  licenseStates: { name: 'NCSL — Driver license rules by state', url: 'https://www.ncsl.org/immigration' },
  selectoRights: { name: 'USCIS — How to avoid immigration scams', url: 'https://www.uscis.gov/avoid-scams' },
}

function item(
  id: string,
  title: string,
  why: string,
  cost: string,
  urgency: RoadmapItem['urgency'],
  action: string,
  links: Source[]
): RoadmapItem {
  return { id, title, why, cost, urgency, action, links, trackId: `done:${id}` }
}

export function buildRoadmap(profile: Profile): Roadmap {
  const now: RoadmapItem[] = []
  const soon: RoadmapItem[] = []
  const year: RoadmapItem[] = []
  const recurring: RoadmapItem[] = []
  const alerts: Alert[] = []
  const st = stateByCode.get(profile.state)

  /* ---------------- always, first two weeks ---------------- */

  now.push(
    item(
      'docs-folder',
      'Build your document folder (paper + cloud copy)',
      'Your passport, visa, I-94, I-797 notices, EAD, SSN/ITIN and birth certificate are your legal identity in the US. A fire, a lost bag or a theft that takes them costs months to undo — a photo copy costs nothing.',
      'Free',
      'now',
      'Photograph everything, store one copy in cloud storage and one with a trusted person in your home country. Note every expiry date in your calendar.',
      [L.i94, L.ar11]
    ),
    item(
      'ar11-habit',
      'Set the habit: report every address change',
      'Most noncitizens must tell USCIS about a change of address within 10 days using Form AR-11, and people in immigration court must notify the court separately. Missing this is how hearings happen without you.',
      'Free',
      'now',
      'Do it online today, then repeat it every single time you move. Add it as a reminder in your calendar for the first week after any move.',
      [L.ar11]
    ),
    item(
      'scam-shield',
      'Learn the seven rules that stop scams, and share them',
      'Roughly $15.9 billion in fraud losses were reported in 2025, with imposter scams the most reported category for a fifth straight year. Newcomers are targeted with schemes that use your real case numbers and your fear of officialdom.',
      'Free',
      'now',
      'Read the scam shield page. Then tell two family members the three non-negotiables: no gift cards, no crypto, no wire to an individual.',
      [L.scamShield, L.selectoRights]
    ),
    item(
      'know-money-rules',
      'Agree your own rules before anyone asks you for money',
      'You will be asked to pay for a "fee", a "fee to release", a "fee to expedite" — usually within your first year. Deciding now, when you are calm, is what protects you later.',
      'Free',
      'now',
      'Write down: I will never pay a government fee to an individual; I will never send money on a deadline I was given by the person asking; I will verify every number myself.',
      [L.scamShield]
    ),
    item(
      'phones',
      'Know who to call: 911, 211, 988',
      '911 for emergencies, 211 for local help with bills, food and housing (multilingual), 988 for mental health crisis. These are free.',
      'Free',
      'now',
      'Save all three in your phone now, before you need them.',
      [L.service211]
    )
  )

  /* ---------------- identity & status ---------------- */

  const workAuthorized =
    profile.status === 'lpr' ||
    profile.status === 'naturalized' ||
    profile.status === 'work-visa' ||
    profile.status === 'asylum-pending' ||
    profile.status === 'refugee' ||
    profile.status === 'parolee' ||
    profile.status === 'tps' ||
    profile.status === 'student'

  if (!profile.hasSSN && workAuthorized) {
    now.push(
      item(
        'get-ssn',
        'Apply for your Social Security number — it is free',
        'An SSN is the key to being paid legally, filing taxes and building credit. SSA never charges you for it. If someone offers to "get you" an SSN for a fee, that is fraud.',
        'Free',
        'now',
        'File Form SS-5 with your identity, status and work authorization documents. If you have a USCIS application pending, ask whether you can request the SSN on that form instead.',
        [L.ssa]
      )
    )
  }

  if (!profile.hasSSN && !profile.hasITIN && !workAuthorized) {
    now.push(
      item(
        'get-itin',
        'Get an ITIN so you can file taxes',
        'An ITIN lets you file a federal tax return and claim refunds even without an SSN. A filed return is often the only official proof of your income.',
        'Free (beyond a preparer or CAA fee)',
        'now',
        'File Form W-7, usually with your tax return. Use a Certifying Acceptance Agent or an IRS Taxpayer Assistance Center so you do not have to mail your passport.',
        [L.itin, L.irsFree]
      )
    )
  }

  if (profile.age18to25Male) {
    now.push(
      item(
        'selective-service',
        'Register with Selective Service (males 18–25)',
        'Almost everyone living in the US who was born male and is between 18 and 25 must register, including many immigrants. Failing to register can affect later immigration applications — and registration itself is free.',
        'Free',
        'now',
        'Check the rules and register online at sss.gov if they apply to you.',
        [L.sss]
      )
    )
  }

  if (profile.status === 'lpr') {
    year.push(
      item(
        'lpr-fifth-year',
        'Diary your five-year mark for benefits eligibility',
        'Most green card holders must wait five years from getting their green card before qualifying for programs like SNAP and full Medicaid, with exceptions (40 qualifying work quarters, military service, children under 18, disability).',
        'Free',
        'this-year',
        'Note the date exactly five years after your green card was issued, and check the exceptions on the official sites before then.',
        [L.snap, L.medicaid]
      )
    )
    year.push(
      item(
        'citizenship-timeline',
        'Look up your naturalization timeline',
        'Most permanent residents can apply after five years; people married to a US citizen for three years may qualify after three. Knowing the date means you can collect evidence as you go rather than scrambling.',
        'Varies by filing fee',
        'this-year',
        'Check the official eligibility rules and requirements, then start keeping evidence of continuous residence and good moral character.',
        [L.ci]
      )
    )
  }

  if (profile.status === 'naturalized') {
    year.push(
      item(
        'citizen-updates',
        'Update your records as a new citizen',
        'Your SSA record, your DMV record and your I-9 all need updating, and you can now vote and sponsor relatives if you choose.',
        'Free to low',
        'this-year',
        'Update Social Security, your DMV record, and apply for a US passport. Register to vote if you want to.',
        [{ name: 'USA.gov — US passports', url: 'https://travel.state.gov/content/travel/en/passports.html' }]
      )
    )
  }

  /* ---------------- EAD and work permit ---------------- */

  if (profile.eadExpiry) {
    const expiry = new Date(profile.eadExpiry)
    if (!Number.isNaN(expiry.getTime())) {
      const days = Math.round((expiry.getTime() - Date.now()) / 86_400_000)
      if (days <= 240) {
        const severity: Alert['severity'] = days <= 120 ? 'high' : 'medium'
        alerts.push({
          id: 'ead-expiry',
          severity,
          title: `Your work permit expires in ${days} day${days === 1 ? '' : 's'}`,
          detail:
            'DHS ended automatic extensions for renewal applications filed on or after October 30, 2025. If your card expires while the renewal is pending, you may no longer be authorized to work. File the renewal as soon as your category allows (commonly 180 days before expiry) and tell your employer in writing now.',
          link: L.eadAuto,
        })
      }
    }
  } else if (workAuthorized && profile.status !== 'lpr' && profile.status !== 'naturalized') {
    soon.push(
      item(
        'ead-date-check',
        'Find and record your work permit expiry date, today',
        'This is the single most expensive date on an immigrant\'s calendar, and the automatic 540-day extension no longer protects late renewals.',
        'Varies (see the official fee schedule)',
        'now',
        'Find your EAD, write down the expiry date, and set two alarms: 200 days before and 180 days before. Renewals filed on or after October 30, 2025 no longer receive the automatic extension.',
        [L.ead, L.eadAuto, L.fee, L.processing]
      )
    )
  }

  if (profile.status === 'tps') {
    alerts.push({
      id: 'tps-watch',
      severity: 'medium',
      title: 'TPS designations are shifting — check your country\'s status directly',
      detail:
        'Courts and the Supreme Court have upheld terminations of some TPS designations, and litigation continues for others. Any change to your designation also changes your work authorization. Verify your country\'s current status and any court-ordered extensions through USCIS, not through a group chat.',
      link: { name: 'USCIS — Temporary Protected Status', url: 'https://www.uscis.gov/humanitarian/temporary-protected-status' },
    })
  }

  if (profile.status === 'asylum-pending') {
    alerts.push({
      id: 'asylum-ead-watch',
      severity: 'medium',
      title: 'Asylum work-permit rules are in flux',
      detail:
        'A proposed rule would bar work permits for people who file asylum more than one year after entry and would expand the reasons USCIS can deny a permit. Also, work permit validity periods were shortened for some categories. Confirm your specific situation with a licensed attorney or accredited representative before relying on a timeline.',
      link: { name: 'American Immigration Council — Employment authorization changes', url: 'https://www.americanimmigrationcouncil.org/fact-sheet/employment-authorization-changes/' },
    })
  }

  /* ---------------- money ---------------- */

  if (!profile.hasBankAccount) {
    now.push(
      item(
        'open-bank',
        'Open a bank account in your own name',
        'It stops the check-cashing tax on every paycheck, creates proof of income for a lease, and gives you a place to receive direct deposit. You do not need an SSN or a credit score — policies vary by bank.',
        'Usually free; watch monthly fees',
        'now',
        'Try a community credit union and a Bank On certified account. Ask what documents they accept for your status, and turn off overdraft coverage on debit purchases.',
        [L.bank, L.bankon]
      )
    )
  }

  if (!profile.hasCreditCard) {
    soon.push(
      item(
        'build-credit',
        'Start building US credit with one small account',
        'Credit decides your apartment applications, your car loan rate, and sometimes your insurance price. An empty file is different from a bad file — and it is fixable in about six months.',
        'Deposit of a few hundred dollars (refundable)',
        'soon',
        'Open a secured credit card or credit-builder account, put one small recurring charge on it, and pay the full balance every month. Keep usage under 30% of the limit.',
        [L.securedCard, L.creditReport]
      )
    )
  }

  soon.push(
    item(
      'check-credit-file',
      'Check your free credit reports, then freeze your file',
      'A fresh credit file with no history is an attractive target for identity theft. Freezing your credit is free, and it stops anyone opening accounts in your name.',
      'Free',
      'soon',
      'Pull all three reports at AnnualCreditReport.com. If you are not applying for credit right now, place a free security freeze with all three bureaus.',
      [L.creditReport, L.freeze]
    )
  )

  if (profile.hasForeignAccounts) {
    soon.push(
      item(
        'foreign-account-reporting',
        'Check whether your home-country accounts need to be reported to the US',
        'US tax residents with foreign financial accounts above certain thresholds generally must file an FBAR (FinCEN 114), and some must file IRS Form 8938 too. Penalties for missing these are far larger than the tax itself, and newcomers almost never hear about them.',
        'Free to file; professional help costs money',
        'soon',
        'Count your foreign accounts and their highest combined balance last year, then check the current thresholds on the IRS pages or ask a VITA/professional preparer this filing season.',
        [L.fbar, { name: 'IRS — Form 8938 (foreign financial assets)', url: 'https://www.irs.gov/forms-pubs/about-form-8938' }]
      )
    )
  }

  if (profile.employed && !profile.paidOnBooks) {
    soon.push(
      item(
        'get-on-the-books',
        'Move your work onto the books, even partially',
        'Cash work with no records means no pay stubs, no W-2, no unemployment insurance, no workers\' compensation if you are injured, and no proof of income when a landlord or a lender asks. It also means paying tax you cannot recover as a refund.',
        'Free to start',
        'soon',
        'Ask your employer for pay stubs and a W-2. If they refuse, start keeping your own dated record of hours and payments — that record becomes your proof if you ever file a wage claim.',
        [L.whd, L.minimumWage]
      )
    )
  }

  /* ---------------- work ---------------- */

  if (profile.employed) {
    soon.push(
      item(
        'know-your-wage-rights',
        'Learn your minimum wage and overtime rate',
        'Federal wage law applies to you regardless of your immigration status. Most workers get 1.5x their rate past 40 hours in a week, and states or cities can set a higher minimum than the federal $7.25.',
        'Free',
        'now',
        'Look up your state and city minimum wage, then compare it with your payslip. Report discrepancies in writing, not verbally.',
        [L.minimumWage, L.tc]
      )
    )
  }

  if (profile.status === 'student' || profile.status === 'work-visa') {
    soon.push(
      item(
        'work-authorization-limits',
        'Understand exactly what your status allows you to do for work',
        'Working outside your authorization can damage future immigration options far more than the money is worth. Students have on-campus and OPT rules; work-visa holders are tied to a specific employer.',
        'Free',
        'soon',
        'Confirm your work rules in writing with your school\'s international office or your employer\'s immigration counsel — not with a friend who has a different status.',
        [L.i9, L.proBono]
      )
    )
  }

  if (profile.employed) {
    year.push(
      item(
        'if-you-lose-the-job',
        'Know what to do before you lose a job',
        'Unemployment insurance is an employer-funded program for people who lose work through no fault of their own, and work-authorized immigrants can qualify. Filing late costs weeks of benefits.',
        'Free',
        'this-year',
        'Save your state unemployment agency link now. If it happens: file the week you lose the job, keep a job-search log, and appeal a denial rather than accepting it.',
        [L.ui]
      )
    )
    year.push(
      item(
        'injury-protection',
        'Know what to do if you are injured at work',
        'Workers\' compensation covers medical care and part of lost wages for work injuries, and states set deadlines for reporting that can permanently bar a claim.',
        'Free to file',
        'this-year',
        'Tell a supervisor the same day, get medical care, and write down the date, time, witnesses and what happened. Report retaliation separately.',
        [L.osha]
      )
    )
  }

  /* ---------------- health ---------------- */

  if (profile.needsHealthCoverage) {
    now.push(
      item(
        'health-coverage',
        'Get covered, or find the clinic you can afford',
        'In the US, the same visit can cost $150 or $4,000 depending on your coverage. Going without care is the most expensive decision available, and there are low-cost options regardless of status.',
        'Free to substantial',
        'now',
        'Check your options on the official eligibility screener. Whatever the answer, find your nearest community health center and save the address — those clinics serve everyone on a sliding scale.',
        [L.healthcare, L.hc, L.medicaid]
      )
    )
    soon.push(
      item(
        'insurance-literacy',
        'Learn your four numbers',
        'Premium, deductible, copay and out-of-pocket maximum decide what you actually pay. Most billing surprises come from not knowing them.',
        'Free',
        'soon',
        'Photograph your insurance card, write the four numbers on one page, and confirm in-network status before any appointment.',
        [L.noSurprises, L.healthcare]
      )
    )
  }

  if (profile.hasKids) {
    soon.push(
      item(
        'kids-programs',
        'Check the programs your children qualify for',
        'School meals, CHIP/Medicaid for children, WIC and Head Start have different (often broader) eligibility rules than adult programs, and using them for a US-citizen child is generally not counted against a parent in a public charge determination.',
        'Free or low cost',
        'soon',
        'Ask your school about meal programs and your state agency about children\'s coverage. WIC has no five-year waiting period for eligible families.',
        [L.wic, L.schoolMeals, L.medicaid]
      )
    )
  }

  if (profile.status === 'lpr' || profile.status === 'asylum-pending' || profile.status === 'refugee' || profile.status === 'parolee' || profile.status === 'tps' || profile.status === 'daca') {
    soon.push(
      item(
        'public-charge-check',
        'Before accepting any benefit, check how it interacts with your immigration case',
        'The public charge rule changed: DHS finalized a rule on July 20, 2026 rescinding the 2022 regulation, effective September 18, 2026, returning officers to a broader discretionary standard. Many groups are exempt, and benefits used by a US-citizen child are treated differently — but the analysis is fact-specific.',
        'Free (legal aid) to legal fees',
        'soon',
        'If you have any application pending, ask a legal aid organization or licensed attorney about your specific case before you apply for or decline a benefit. Do not rely on forums.',
        [L.publicCharge, L.legalAid]
      )
    )
  }

  /* ---------------- housing & daily life ---------------- */

  soon.push(
    item(
      'lease-folder',
      'Treat every lease like evidence',
      'Most deposit disputes are decided by what you documented months earlier. Photographs and a written condition report are the whole case.',
      'Free',
      'now',
      'At move-in: video every room, note existing damage, and email the condition report to the landlord so the date is recorded. Pay rent by transfer or against a written receipt.',
      [L.tenant, L.fairHousing]
    )
  )

  if (!profile.hasCar) {
    year.push(
      item(
        'car-buying-rules',
        'If you buy a car, protect the title first',
        'A used car is usually an immigrant\'s second-largest purchase. The two things that matter are that the seller is the legal owner on the title, and that a mechanic has inspected the car.',
        'Inspection: ~$100–200',
        'this-year',
        'Never buy a car whose title is not in the seller\'s name, and never pay a deposit on a car you have not seen. Meet at a bank or DMV in daylight.',
        [L.dmv, L.fairHousing]
      )
    )
  }

  year.push(
    item(
      'driver-license',
      'Get your state ID or driver license',
      'A state ID is the everyday proof of identity in the US, and several states issue licenses or IDs regardless of immigration status. Requirements are set by each state.',
      'State fee',
      'this-year',
      'Read your state agency\'s document checklist for your exact situation. Never pay anyone for a DMV appointment — they are free on the state site.',
      [L.dmv, L.realId, L.licenseStates]
    )
  )

  if (st) {
    now.push(
      item(
        'state-rules',
        `Look up the rules that ${st.name} sets locally`,
        'Housing, wages, benefits and licensing are all state-level in the US, and the differences between states are large. Knowing which agency owns which rule is how you get a real answer instead of a rumor.',
        'Free',
        'now',
        'Bookmark your state agencies and use these questions to check: deposit cap and return deadline, notice to enter, minimum wage, state marketplace, DMV documents, state-funded immigrant benefit programs.',
        [
          st.links.tenant ? { name: `${st.name} — housing agency`, url: st.links.tenant } : undefined,
          st.links.labor ? { name: `${st.name} — labor agency`, url: st.links.labor } : undefined,
          st.links.benefits ? { name: `${st.name} — benefits agency`, url: st.links.benefits } : undefined,
          st.links.dmv ? { name: `${st.name} — DMV`, url: st.links.dmv } : undefined,
        ].filter((x): x is Source => Boolean(x))
      )
    )
  }

  /* ---------------- recurring ---------------- */

  recurring.push(
    item(
      'tax-season',
      'File your tax return every year (even if you earned little)',
      'Filing is how you claim refundable credits and it creates the income record landlords, lenders and immigration cases rely on. As a resident alien you file Form 1040; as a nonresident alien, Form 1040-NR.',
      'Free through VITA if you qualify',
      'recurring',
      'Book a free VITA appointment in January. If you have foreign accounts, foreign income or a large foreign gift, ask about FBAR, Form 8938 and Form 3520 before the deadline.',
      [L.irsFree, L.irsAliens, L.fbar]
    ),
    item(
      'tax-identity-check',
      'Once a year: check your tax and credit identity',
      'A return rejected because someone else already filed with your number is often the first sign of identity theft.',
      'Free',
      'recurring',
      'Pull your free credit reports, look for accounts you do not recognise, and keep freezes in place when you are not applying for credit.',
      [L.irsProtect, L.idTheft, L.creditReport]
    ),
    item(
      'ead-calendar',
      'Add your EAD, visa, passport and license expiry dates to your calendar',
      'Every one of these documents takes months to renew and can stop your income when it lapses. The date is free to track; the lapse is not.',
      'Free',
      'recurring',
      'Two alarms per document: one 200 days before, one 180 days before. Verify current processing times before you file.',
      [L.ead, L.processing]
    ),
    item(
      'benefits-recertify',
      'Reply to recertification letters within the deadline',
      'Housing assistance, Medicaid and SNAP require periodic recertification, and missing a deadline means automatic termination even if you still qualify.',
      'Free',
      'recurring',
      'Open every letter from an agency on the day it arrives, note the deadline, and ask for help if the form is unclear.',
      [L.medicaid, L.snap, L.service211]
    ),
    item(
      'document-review',
      'Once a year: re-verify the rules that changed',
      'Immigration, benefits and tax rules shifted repeatedly in 2025 and 2026. Anything you learned from a forum, a friend, or a two-year-old article needs re-checking against the official source.',
      'Free',
      'recurring',
      'Re-read the official page for anything you have relied on. Every fact in this library shows the date it was checked and where it came from.',
      [L.caseStatus, L.publicCharge, L.healthcare]
    )
  )

  return {
    phases: [
      { id: 'first-2-weeks', label: 'Do now', blurb: 'These protect you immediately and cost almost nothing.', items: now },
      { id: 'first-90-days', label: 'First 90 days', blurb: 'These build the financial and legal footing.', items: soon },
      { id: 'first-year', label: 'First year', blurb: 'These are the milestones that open options.', items: year },
      { id: 'every-year', label: 'Every year', blurb: 'Recurring — put these in a calendar once and forget them.', items: recurring },
    ],
    alerts,
    stateName: st?.name,
    generatedAt: new Date().toISOString(),
  }
}
