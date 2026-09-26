import type { ScamRule } from './types'

/**
 * The scam rule library. `patterns` are scored signals, not proof: the engine
 * combines them with benign patterns and payment-method analysis to produce a
 * verdict. Every rule names the lever it pulls on someone new to the US, because
 * "why this works on me" is what makes the lesson stick.
 *
 * Weights: 30+ = identity/government fraud; 20-29 = money movement; 10-19 = pressure
 * tactics and secondary signals.
 */
export const scamRules: ScamRule[] = [
  {
    id: 'gov-impersonation',
    name: 'Government impersonation (Social Security, USCIS, ICE, "Department of Immigration")',
    category: 'government-impersonation',
    weight: 34,
    patterns: [
      /\b(social security administration|ssa)\b/i,
      /\b(uscis|u\.s\. citizenship|immigration services)\b/i,
      /\b(department of homeland security|dhs)\b/i,
      /\b(ice|immigration and customs enforcement)\b/i,
      /\bdepartment of immigration\b/i,
      /\byour social security number (has been|will be) (suspended|blocked|cancelled)/i,
      /\bwe have (a|an) (arrest warrant|warrant for your arrest|deportation order|order of removal)\b/i,
      /\byour (visa|green card|status|case) (has been|will be) (revoked|terminated|denied|cancelled)\b/i,
      /\bfederal (investigation|case) (has been|was) opened (in your name|against you)\b/i,
      /\bverify your (ssn|social security number|immigration status) (to|in order to) (avoid|prevent)\b/i,
      /\bpress 1 to speak (to|with) (an agent|a federal officer|a case officer)\b/i,
      /\bthis is (officer|agent|special agent|investigator) [a-z]+\b/i,
    ],
    benignPatterns: [
      /\bnotice of action\b/i,
      /\bi-797|\bi-765|\bi-130|\bi-589|\bi-485\b/i,
      /\breceipt number\b/i,
      /\bform (w-2|w-7|ss-5|ar-11)\b/i,
    ],
    what:
      'Someone claims to be from a government agency and says there is an urgent problem with your immigration status, tax record or Social Security number that only an immediate payment or information can fix.',
    whyItWorks:
      'For someone whose entire legal life depends on documents from these agencies, a call from "them" is the most frightening thing imaginable. The scammer adds your real A-number or case number, which is available in breached data, and threatens deportation or arrest.',
    theAsk:
      'Pay a fine, fee or bond right now by gift card, wire, cryptocurrency or payment app — or confirm your SSN and personal details over the phone.',
    whatToDo: [
      'Hang up. Do not press any option, and do not call back the number that called you.',
      'Look up the agency\'s real number yourself and call to verify, or check your case status online with your receipt number.',
      'Remember the fixed rule: government agencies do not call demanding payment under deadline, and never accept gift cards or crypto.',
      'Write down the number that called, the name used, and the exact words, and report it.',
    ],
    never: [
      'Never pay a government "fee" or "fine" by gift card, prepaid card, wire, cryptocurrency or payment app.',
      'Never confirm your SSN, A-number, bank details or one-time codes to an incoming caller.',
      'Never believe a threat of immediate deportation if you do not pay within minutes.',
    ],
    reportTo: [
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
      { name: 'USCIS — Report scams', url: 'https://www.uscis.gov/avoid-scams' },
      { name: 'SSA — Report Social Security scams', url: 'https://oig.ssa.gov/report/' },
    ],
    relatedTopicId: 'topic-scam-shield',
  },
  {
    id: 'notario-fraud',
    name: 'Notario / unlicensed immigration "consultant" fraud',
    category: 'immigration-fraud',
    weight: 32,
    patterns: [
      /\bnotario\b/i,
      /\b(immigration|visa|asylum) (consultant|advisor|specialist|agent|preparer)\b/i,
      /\bwe (fill out|prepare|file) (your )?(immigration|visa|usc)\w* (forms|paperwork|applications)\b/i,
      /\bguaranteed (approval|approval of|visa|green card)\b/i,
      /\b100% (approval|guarantee|aprobado)\b/i,
      /\bwe know (a )?people (inside|at) uscis\b/i,
      /\bi have a (friend|contact|connection) at (uscis|the consulate|immigration)\b/i,
      /\bno (need for )?(lawyer|attorney) needed\b/i,
      /\bwe can (speed up|expedite) your (case|application|visa)\b/i,
    ],
    what:
      'An unlicensed person — often using the title "notario" or "immigration consultant" — charges large fees to give immigration advice and file forms they are not legally permitted to prepare.',
    whyItWorks:
      'In much of Latin America, "notario público" means a senior legal professional. In the US, a notary is a signature witness. The confusion is the business model, and it is one of the most expensive frauds for immigrants because the damage includes missed deadlines that cannot be undone.',
    theAsk:
      'Pay a big upfront fee in cash for immigration advice or form selection, with no written agreement and no receipt.',
    whatToDo: [
      'Check whether the person is a licensed attorney (state bar lookup) or a DOJ-accredited representative (official list).',
      'Walk away from anyone who guarantees an outcome. No honest professional can promise an approval.',
      'If you already paid and forms were filed, get a licensed attorney to review your file immediately — deadlines are the real damage.',
      'Report the person to the FTC, your state bar (unauthorized practice of law), and your state attorney general.',
    ],
    never: [
      'Never let a non-lawyer choose which forms you file.',
      'Never sign blank forms or leave originals with a preparer.',
      'Never accept "we will figure it out later" about which form was filed.',
    ],
    reportTo: [
      { name: 'FTC — Immigration services scams', url: 'https://consumer.ftc.gov/articles/immigration-services-scams' },
      { name: 'DOJ — Recognition and Accreditation Program', url: 'https://www.justice.gov/eoir/recognition-and-accreditation-program' },
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
    ],
    relatedTopicId: 'topic-legal-help',
  },
  {
    id: 'fake-uscis-fee',
    name: 'Fake USCIS / immigration "processing fee"',
    category: 'immigration-fraud',
    weight: 33,
    patterns: [
      /\b(processing|release|clearance|activation) fee\b/i,
      /\bpay (the )?fee to (release|unlock|process|activate) your (case|green card|visa|application|permit)\b/i,
      /\b(additional|required) fee of \$?\d{2,4}\b/i,
      /\b\$?\d{3,5}\s*(usd )?(by|via|through) (gift card|bitcoin|crypto|zelle|western union|moneygram|money order)\b/i,
      /\bpay (now|today) to (avoid|prevent) (deportation|denial|removal)\b/i,
      /\bapps?\.uscis\.gov[.-]/i,
      /\buscis[-.]?(fee|payment|support|status)[a-z]*\.(com|net|org|info)\b/i,
      /\bcase (is|has been) (on hold|frozen|suspended) (pending|until) (payment|a fee)\b/i,
    ],
    benignPatterns: [/\buscis\.gov\/\w+/i, /\bform g-1055\b/i, /\bfee schedule\b/i],
    what:
      'A message or call claims your immigration case is stuck, on hold, or about to be denied unless you pay a processing, release or expedite fee.',
    whyItWorks:
      'USCIS filing fees are real and expensive, so a demand for a fee feels normal. The scammer makes it urgent and adds a false deadline tied to deportation or denial.',
    theAsk: 'Pay a fee immediately through an untraceable method to an individual, not to the agency.',
    whatToDo: [
      'Check your case status yourself at egov.uscis.gov/casestatus using the receipt number on your own notices.',
      'Check the official fee schedule (Form G-1055) to see what a real filing costs and how it is paid.',
      'Know that official USCIS domains end in uscis.gov. Everything else is not USCIS.',
      'Report the message with headers or screenshots to the FTC and to USCIS.',
    ],
    never: [
      'Never pay a government fee to a person rather than through official channels.',
      'Never click a link in the message — type uscis.gov yourself.',
      'Never pay to "avoid deportation" through anyone who phones you.',
    ],
    reportTo: [
      { name: 'USCIS — Avoid Scams', url: 'https://www.uscis.gov/avoid-scams' },
      { name: 'USCIS — Case Status Online', url: 'https://egov.uscis.gov/casestatus' },
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
    ],
    relatedTopicId: 'topic-uscis-notices',
  },
  {
    id: 'ssn-for-sale',
    name: 'Selling an SSN, ITIN, "work papers" or fake documents',
    category: 'immigration-fraud',
    weight: 35,
    patterns: [
      /\b(sell|selling|provide|get you) (a |an |your )?(ssn|social security number|itin|green card|work permit|social card|work papers|papers)\b/i,
      /\b(real|valid|genuine) (ssn|social security card|green card|ead|work permit) for (sale|sell)\b/i,
      /\bssn for sale\b/i,
      /\b(fake|novelty) (documents|id|green card|license)\b/i,
      /\brent (someone'?s)? ?(ssn|social|identity|credit)\b/i,
      /\buse my (ssn|social|number) to work\b/i,
      /\bguaranteed (green card|work permit|visa) for \$\d+/i,
      /\bdocuments? (package|deal|offer) (for|from) \$\d+/i,
    ],
    what:
      'Someone offers to sell you an SSN, work permit, green card or other documents, or offers to let you "rent" someone else\'s identity to work.',
    whyItWorks:
      'People desperate for work authorization meet sellers who promise exactly what they need. The buyer is the one who commits a federal crime, and the seller often extorts them afterwards.',
    theAsk: 'Pay cash for numbers or documents, or use someone else\'s identity to work.',
    whatToDo: [
      'Know the real rules: an SSN is free from the SSA, an ITIN is free from the IRS, and no third party can sell you either.',
      'If you were recruited already, stop and speak with a licensed immigration attorney before anything else happens.',
      'Report the seller, with the messages you have.',
    ],
    never: [
      'Never use a fake or borrowed SSN, even "just to work". It is federal fraud and it permanently damages your immigration options.',
      'Never pay a deposit for documents you have not verified through a government website.',
    ],
    reportTo: [
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
      { name: 'SSA — Report fraud', url: 'https://oig.ssa.gov/report/' },
      { name: 'USCIS — Avoid scams', url: 'https://www.uscis.gov/avoid-scams' },
    ],
    relatedTopicId: 'topic-ssn-vs-itin',
  },
  {
    id: 'fake-sponsor',
    name: 'Fake sponsor / "we will sponsor your visa" for payment',
    category: 'immigration-fraud',
    weight: 33,
    patterns: [
      /\b(sponsor|sponsorship) (your|for your) (visa|green card|work permit|status)\b/i,
      /\bwe (can|will) (sponsor|file for) (you|your family)\b/i,
      /\bemployer (will|can) sponsor (you|your visa) (for|after) (a )?(fee|payment)\b/i,
      /\bvisa sponsorship (available|opportunity)\b/i,
      /\bpay (us|me|the company) .{0,20}(for|to get) (the )?(sponsorship|visa)\b/i,
      /\bjob offer with visa sponsorship\b.{0,80}\b(pay|deposit|fee)\b/i,
      /\bwe will (hold|keep) your passport\b/i,
    ],
    what:
      'A supposed employer, agency or individual offers visa sponsorship in exchange for payment, wages, or control of your documents.',
    whyItWorks:
      'Sponsorship is the thing most people in the US need and cannot buy. The offer appears precisely where the need is greatest — job groups, chat rooms, and unregulated recruiters.',
    theAsk: 'Pay a fee, hand over your passport, or accept confiscated wages "until the visa comes through".',
    whatToDo: [
      'Verify the employer exists: official website, business registration, address, a named person you can reach by phone at the company\'s listed number.',
      'Know the legitimate pathway: an employer files a petition with USCIS in its own name, you receive a receipt number you can verify yourself, and the government fee is paid to the government.',
      'Never hand over your passport. If someone is holding it, contact the National Human Trafficking Hotline.',
    ],
    never: [
      'Never pay an "employer" or "agency" for sponsorship promises with no verifiable company behind it.',
      'Never let anyone hold your original documents as security.',
    ],
    reportTo: [
      { name: 'National Human Trafficking Hotline', url: 'https://humantraffickinghotline.org/' },
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
      { name: 'USCIS — Avoid scams', url: 'https://www.uscis.gov/avoid-scams' },
    ],
    relatedTopicId: 'topic-immigration-services-fraud',
  },
  {
    id: 'marriage-fraud',
    name: 'Paid marriage / "green card marriage" offers',
    category: 'immigration-fraud',
    weight: 34,
    patterns: [
      /\b(marry|marriage) (for|to get) (a )?(green card|papers|visa|citizenship)\b/i,
      /\b(pay|we pay) (you )?\$?\d{2,5}.{0,30}\b(marry|marriage)\b/i,
      /\bsham marriage\b/i,
      /\bsomeone to marry you for the papers\b/i,
    ],
    what:
      'An offer to arrange or pay for a marriage in order to obtain immigration status.',
    whyItWorks: 'It looks like the shortest path through an intimidating system.',
    theAsk: 'Pay for, or accept payment for, a marriage arranged for immigration purposes.',
    whatToDo: [
      'Understand the consequence: marriage fraud is a permanent bar and can lead to criminal prosecution and removal, even years later.',
      'If someone is pressuring you into this, speak to a licensed immigration attorney about your actual options.',
    ],
    never: [
      'Never enter a marriage for immigration purposes.',
      'Never accept money from a stranger proposing this arrangement.',
    ],
    reportTo: [{ name: 'USCIS — Avoid scams', url: 'https://www.uscis.gov/avoid-scams' }],
  },
  {
    id: 'visa-lottery',
    name: 'Fake diversity visa lottery / "you won a visa"',
    category: 'immigration-fraud',
    weight: 31,
    patterns: [
      /\b(dv|diversity visa) (lottery|program) (winner|selected|won)\b/i,
      /\byou (have been|were) (selected|chosen) (in|for) the (dv|diversity|loterry|lottery)\b/i,
      /\bgreen card (lottery|lottery winner|selected)\b/i,
      /\bpay .{0,30}(processing|administration|visa issuance) fee\b.{0,40}\b(win|winner|selected|lottery)\b/i,
      /\byour visa number (is|has been) (available|issued) (pay|send)\b/i,
    ],
    what:
      'A message claims you won the diversity visa lottery and asks for a payment or personal information to claim the visa.',
    whyItWorks:
      'The lottery is real, so the offer feels plausible — and it preys on the exact hope that makes people emigrate.',
    theAsk: 'Pay a "visa issuance" or "processing" fee, or submit personal details, to claim a visa you supposedly won.',
    whatToDo: [
      'Check results only through the official State Department entry-status page using your own confirmation number.',
      'Remember that official selectees never pay a private party to claim a lottery result.',
      'Report the message at ReportFraud.ftc.gov.',
    ],
    never: [
      'Never pay a third party to "release" a lottery result.',
      'Never share your confirmation number with a stranger who contacted you.',
    ],
    reportTo: [
      { name: 'US Department of State — Diversity Visa', url: 'https://travel.state.gov/content/travel/en/us-visas/immigrate/diversity-visa-program-entry.html' },
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
    ],
  },
  {
    id: 'immigration-services-fraud',
    name: 'General immigration services fraud (paid forms, "case managers", blank signature)',
    category: 'immigration-fraud',
    weight: 30,
    patterns: [
      /\bsign (this )?blank (form|application|i-?\d+)\b/i,
      /\bwe (will|can) (hold|keep) your (documents|passport|originals|documents)\b/i,
      /\bcase manager will (call|contact) you (shortly|soon)\b/i,
      /\bpay (the )?(balance|remainder) in cash\b/i,
      /\bno receipt (available|provided|needed)\b/i,
      /\bexpedite your (asylum|interview|court|hearing) date for a fee\b/i,
    ],
    what:
      'Routine immigration paperwork services used as cover for unauthorized legal advice, document retention and unverifiable payments.',
    whyItWorks:
      'Filling in forms is genuinely confusing, so a helpful-sounding stranger fills the gap — and takes control of the case file.',
    theAsk: 'Cash payments with no receipts, originals surrendered, blank forms signed.',
    whatToDo: [
      'Demand receipts and copies of everything filed. If a provider refuses, that is the answer.',
      'Verify the provider\'s credentials before paying.',
      'If your originals are being held, ask in writing for their return, and escalate to legal aid if refused.',
    ],
    never: [
      'Never sign blank forms.',
      'Never accept "no receipt" as normal.',
    ],
    reportTo: [
      { name: 'FTC — Immigration services scams', url: 'https://consumer.ftc.gov/articles/immigration-services-scams' },
      { name: 'USCIS — Avoid scams', url: 'https://www.uscis.gov/avoid-scams' },
    ],
    relatedTopicId: 'topic-legal-help',
  },
  {
    id: 'job-scam-cash',
    name: 'Job offer that requires money upfront from you',
    category: 'job',
    weight: 28,
    patterns: [
      /\b(hiring|we are hiring|job opening|work from home|remote position|new employee)\b/i,
      /\bpay\b[^.!?]{0,25}\b(application|processing|training|equipment|registration|onboarding|background check) fee\b/i,
      /\b(pay|send|wire|transfer)\b[^.!?]{0,25}\b(deposit|fee)\b[^.!?]{0,35}\b(to (start|begin|secure|keep) (work|the job|your position)|before you (start|begin|are hired))\b/i,
      /\bno (experience|interview) (needed|required)\b/i,
      /\bstart (immediately|today|asap) (after|once) (payment|fee|deposit)\b/i,
      /\b(buy|purchase) your own (equipment|laptop|software|tools) (and|then) (we will|you will) be reimbursed\b/i,
      /\bget paid \$?\d{3,4} (per|a) (day|week) (no|without) experience\b/i,
      /\bweekly pay \$\d{3,4}\b.{0,40}\b(no experience|immediately|whatsapp|telegram)\b/i,
      /\bcontact (me|us) on (whatsapp|telegram|signal)\b.{0,60}\b(job|hiring|position)\b/i,
      /\bhiring manager\b.{0,40}\b(text|whatsapp|telegram)\b/i,
    ],
    what:
      'A fake job offer that extracts money from the applicant — for equipment, training, background checks, or "visa processing" — or that recruits the applicant into moving money.',
    whyItWorks:
      'Job instability is the defining financial pressure for immigrants. A promising offer arrives exactly when it is most needed, and interviews are conducted entirely over chat so nothing can be verified.',
    theAsk: 'Pay for equipment or training, deposit a check, or forward money on the company\'s behalf.',
    whatToDo: [
      'Verify the company through its official website: does the recruiter\'s email domain match the company domain exactly? Is the role posted on the company\'s own careers page?',
      'Ask for a phone or video interview with a named person and call the company\'s published main number to confirm the role exists.',
      'Never pay a legitimate employer to start work. Not for equipment, training, uniforms, or background checks.',
      'Report the listing to the platform, and to the FTC.',
    ],
    never: [
      'Never pay an employer to be hired.',
      'Never deposit a check for a new job and forward part of the money.',
      'Never send photos of your ID and SSN to a recruiter who contacted you on a chat app.',
    ],
    reportTo: [
      { name: 'FTC — Job scams', url: 'https://consumer.ftc.gov/articles/job-scams' },
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
    ],
    relatedTopicId: 'topic-money-mule',
  },
  {
    id: 'job-scam-equipment',
    name: 'Fake check for "home office equipment"',
    category: 'job',
    weight: 30,
    patterns: [
      /\b(check will be (mailed|sent|deposited)) .{0,60}\b(buy|purchase|order) (the )?(equipment|laptop|supplies|software)\b/i,
      /\bwe will send you a check (to|for) (buy|purchase|cover)\b/i,
      /\bdeposit the (check|funds) (and|then) (send|forward|wire) (the )?(remaining|balance|rest|difference)\b/i,
      /\bmobile deposit (the|this) check\b/i,
      /\b(overpayment|excess funds) (by|of) mistake.{0,40}\b(return|send back|refund)\b/i,
    ],
    what:
      'The classic fake-check scheme: a "new employer" mails you a check, you deposit it, buy equipment or return the excess, and the check bounces days or weeks later — leaving you owing the bank.',
    whyItWorks:
      'Funds appear in your account within days, which feels like proof the money is real. Bank funds availability rules and check clearing timelines are not the same thing.',
    theAsk: 'Deposit a check and immediately send money, buy gift cards, or forward the remainder.',
    whatToDo: [
      'Tell your bank if an unexpected check arrives, before doing anything with it.',
      'Do not spend or forward money from a check you did not earn, no matter who sent it.',
      'If it has already happened, contact your bank the same day and keep all messages.',
    ],
    never: [
      'Never treat an available balance as proof that a check cleared.',
      'Never buy gift cards or send crypto at a new employer\'s instruction.',
    ],
    reportTo: [
      { name: 'FTC — Fake checks', url: 'https://consumer.ftc.gov/articles/fake-checks' },
      { name: 'FBI — Internet Crime Complaint Center', url: 'https://www.ic3.gov/' },
    ],
    relatedTopicId: 'topic-money-mule',
  },
  {
    id: 'unpaid-training',
    name: '"Paid training" or trial days that you pay for',
    category: 'job',
    weight: 22,
    patterns: [
      /\b(paid|free) training (fee|costs? \$|requires? \$|\$\d+)\b/i,
      /\btraining (fee|deposit) of \$?\d{2,4}\b/i,
      /\bpay for your (training|certification) (and|then) (we|you)\b/i,
      /\btrial (day|shift|period) (unpaid|no pay)\b/i,
      /\bcertification (fee|cost) \$?\d{3,4}\b.{0,40}\b(guaranteed|job|employment)\b/i,
    ],
    what:
      'Charging applicants for "training" or "certification" that is supposedly required to be hired, with no real job at the end.',
    whyItWorks:
      'Certifications are genuinely required in some fields in the US, so paying for training feels legitimate — and the promise of a job creates urgency.',
    theAsk: 'Pay a training or certification fee upfront for a job that has not been verified.',
    whatToDo: [
      'Check whether the certification is real: search for the credential on a government or professional association site.',
      'Ask whether the employer pays for training. Legitimate employers generally do.',
      'Never pay for training where the only evidence of the job is a chat message.',
    ],
    never: ['Never pay for a job you have not seen in writing.', 'Never work multiple free "trial days".'],
    reportTo: [{ name: 'FTC — Job scams', url: 'https://consumer.ftc.gov/articles/job-scams' }],
    relatedTopicId: 'topic-first-job-rights',
  },
  {
    id: 'visa-job-scam',
    name: 'Visa-for-fee job scam (abroad or at home)',
    category: 'job',
    weight: 30,
    patterns: [
      /\b(h-?1b|h-?2b|j-?1|eb-?3|work visa) (sponsorship|filing|petition) (for|at) (a )?(fee|cost|payment)\b/i,
      /\bpay .{0,20}(agency|recruiter|consultant) .{0,30}(visa|sponsor|job abroad)\b/i,
      /\bjob in (the )?(usa|canada|europe) (with|including) (visa|ticket|housing)\b/i,
      /\bprocessing fee for (your )?(work visa|h-?1b|work permit)\b/i,
      /\bwe (arranged|secured|booked) your (job|visa|flight).{0,40}\bpay\b/i,
    ],
    what:
      'A recruiter or "agency" charges workers a fee for a visa or a job abroad, promising documents and travel that do not exist or do not match what was promised.',
    whyItWorks: 'It targets people at the exact moment they are investing everything in a move.',
    theAsk: 'Pay a large upfront fee for a visa, job placement or ticket, usually by wire or cash.',
    whatToDo: [
      'Verify the employer is licensed to sponsor: US employers file petitions with USCIS themselves, and you can verify a receipt number.',
      'Never pay for a promise of a visa. Legitimate filing fees are paid to the government, with receipts.',
      'Check whether the recruiter is registered where required, and search the company name with the word "scam".',
    ],
    never: [
      'Never pay a "visa fee" to an individual.',
      'Never travel on a promise, trusting someone with your passport.',
    ],
    reportTo: [
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
      { name: 'US Department of State — Visa fraud', url: 'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fraud.html' },
    ],
    relatedTopicId: 'topic-immigration-services-fraud',
  },
  {
    id: 'money-mule',
    name: 'Money mule recruitment (receive and forward funds)',
    category: 'banking',
    weight: 36,
    patterns: [
      /\b(receive|accept|deposit|collect)\b[^.!?]{0,70}\b(funds|money|payments?|transfer|checks?)\b[^.!?]{0,70}\b(send|forward|wire|transfer)\b/i,
      /\bkeep(ing)? (a|your|the)?\s?(commission|percentage|cut|10 ?%|5 ?%|10 percent)\b/i,
      /\b(payment processing|financial agent|money transfer agent|local representative|payment agent)\b[^.!?]{0,30}\b(role|position|job|needed|agent|hiring|wanted)\b/i,
      /\buse your (bank )?account (for|to) (process|receive|transfer)\b/i,
      /\bwe need someone (in|with) (a )?(us|american|local) bank account\b/i,
      /\breship|re-?ship (packages|parcels|items)\b/i,
      /\breceive packages at your (home )?address\b/i,
      /\byour task (is|will be) (to )?(receive|collect) (money|funds|payments) and (send|forward|withdraw)\b/i,
    ],
    what:
      'A "job" or online friend asks you to receive money or packages and forward them, keeping a cut. This is money laundering or reshipping stolen goods, and the account holder is the person prosecuted.',
    whyItWorks:
      'It arrives as remote-work income, which is exactly what someone with unstable work and no office access is looking for. The commission structure makes it feel like employment.',
    theAsk: 'Let your bank account or your address be used to receive and forward money or goods.',
    whatToDo: [
      'Rule: money that arrives is never forwarded. Not checks, not transfers, not gift cards, not crypto.',
      'Stop immediately if it has started, contact your bank today, and keep every message.',
      'Talk to a lawyer before making any statement, since the criminal exposure is yours.',
      'Warn the job groups and chats where the offer is circulating.',
    ],
    never: [
      'Never let anyone use your account, card or address to move money or goods.',
      'Never spend funds you are asked to forward — when the original payment is reversed, the loss lands on you.',
      'Never send gift card codes or crypto on anyone\'s instruction to "protect" money.',
    ],
    reportTo: [
      { name: 'FBI — Money mules', url: 'https://www.fbi.gov/how-we-can-help-you/scams-and-safety/common-frauds-and-scams/money-mules' },
      { name: 'FBI — Internet Crime Complaint Center', url: 'https://www.ic3.gov/' },
      { name: 'USPIS — Reshipping scams', url: 'https://www.uspis.gov/report' },
    ],
    relatedTopicId: 'topic-money-mule',
  },
  {
    id: 'fake-check',
    name: 'Fake check / overpayment scam',
    category: 'banking',
    weight: 30,
    patterns: [
      /\bcheck (for|of) \$?\d[\d,]{2,}\b/i,
      /\b(overpaid|overpayment|sent (you )?too much|excess amount)\b/i,
      /\bdeposit (the|this) check (and|then) (wire|send|transfer) (back )?(the )?(difference|remainder|excess|balance)\b/i,
      /\breturn the (unused|remaining|extra) (funds|money)\b/i,
      /\bcash (the )?(check|money order) (and|then)\b/i,
      /\bwe will (refund|reimburse) you (after|once) you\b/i,
    ],
    what:
      'A check for more than the agreed amount, with instructions to send back the difference or buy something with it.',
    whyItWorks: 'The deposit shows up in your account quickly, which looks like proof. Clearing takes much longer, and reversals are your problem.',
    theAsk: 'Deposit a check and send money, gift cards or crypto from it.',
    whatToDo: [
      'Tell your bank immediately if an unexpected check arrives.',
      'Do not spend or forward any part of it. Wait until the bank confirms the funds truly cleared.',
      'If you already sent money, call your bank the same day and file a report.',
    ],
    never: [
      'Never send money against an un-cleared check.',
      'Never accept "keep a portion for your trouble" from a stranger.',
    ],
    reportTo: [
      { name: 'FTC — Fake checks', url: 'https://consumer.ftc.gov/articles/fake-checks' },
      { name: 'FBI — Internet Crime Complaint Center', url: 'https://www.ic3.gov/' },
    ],
  },
  {
    id: 'bank-impersonation',
    name: 'Bank fraud-department impersonation ("move your money to a safe account")',
    category: 'banking',
    weight: 35,
    patterns: [
      /\b(fraud|security) (department|team|alert) (from|at) (your |the )?bank\b/i,
      /\bsuspicious (activity|transaction|charge)s? (on|in) your (account|card)\b/i,
      /\b(press 1|call (us|this number)) to (verify|confirm|authorize|secure) your account\b/i,
      /\b(move|transfer) (your )?(money|funds|balance) to a (safe|secure|holding) account\b/i,
      /\bverify your (account|card|ssn|pin|one time code|otp)\b/i,
      /\bconfirm your (debit|credit) card number and (pin|cvv)\b/i,
      /\bwe detected a (unauthorized|fraudulent) (purchase|transfer)\b/i,
      /\byour (bank )?account (will be|has been) (frozen|locked|blocked|suspended|compromised)\b/i,
      /\bdownload (anydesk|teamviewer|remote (access|support)) (to|so we can)\b/i,
      /\bmove (your |the )?(money|funds|balance) (to|into) (a|your) (safe|secure|holding|protected)\b/i,
    ],
    what:
      'A caller, text or email impersonating your bank or card issuer claims fraud and pushes you to move money to a "safe account", share one-time codes, or install remote-access software.',
    whyItWorks:
      'It inverts trust: they are helping you protect yourself. Bank impersonation is the single largest business-impersonation loss category in FTC data.',
    theAsk: 'Transfer money, read out a one-time code, share card details, or give remote control of your device.',
    whatToDo: [
      'Hang up. Banks never ask you to move money to a "safe account" — that is not a thing.',
      'Call the number on your card or in your banking app, or walk into a branch.',
      'If a code was shared or software installed, change passwords immediately and call the bank from your app.',
      'Report it to the bank and the FTC, and to the FBI\'s IC3 if money was sent.',
    ],
    never: [
      'Never read a one-time code to anyone who called you.',
      'Never install remote-access software at a caller\'s request.',
      'Never transfer money to "protect" it because someone on the phone told you to.',
    ],
    reportTo: [
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
      { name: 'FBI — Internet Crime Complaint Center', url: 'https://www.ic3.gov/' },
      { name: 'CFPB — Submit a complaint', url: 'https://www.consumerfinance.gov/complaint/' },
    ],
    relatedTopicId: 'topic-bank-account',
  },
  {
    id: 'identity-theft',
    name: 'Identity theft indicators',
    category: 'banking',
    weight: 26,
    patterns: [
      /\bsend (a )?(photo|picture|copy) of your (id|passport|ssn|green card|work permit)\b/i,
      /\bshare your (ssn|social|itin|a-?number|date of birth)\b/i,
      /\bverify your (identity|ssn) (by|via) (text|whatsapp|telegram|email)\b/i,
      /\bwe need your (ssn|social security number) to (proceed|verify|process|release)\b/i,
      /\bsend your (documents|passport) (photo|scan) to\b/i,
      /\bfill (out|in) this form with your (ssn|bank details|card number)\b/i,
    ],
    what:
      'A request for the personal information that lets someone impersonate you: SSN or ITIN, passport scans, card numbers, one-time codes.',
    whyItWorks:
      'Onboarding in the US legitimately involves documents, so a request for a passport photo does not look strange — but the destination is an unknown recipient.',
    theAsk: 'Send identity documents or numbers by text, chat, or email to a person you cannot verify.',
    whatToDo: [
      'Verify the recipient through an official channel before sharing anything.',
      'Share documents only through a secure portal you navigated to yourself, never as chat attachments.',
      'If you already shared, freeze your credit and monitor your reports.',
    ],
    never: [
      'Never send a photo of your SSN card, passport, or green card by text or social media.',
      'Never share one-time codes. Nobody legitimate needs them.',
    ],
    reportTo: [
      { name: 'FTC — IdentityTheft.gov', url: 'https://www.identitytheft.gov/' },
      { name: 'AnnualCreditReport.com', url: 'https://www.annualcreditreport.com/' },
    ],
    relatedTopicId: 'topic-documents-vault',
  },
  {
    id: 'irs-impersonation',
    name: 'IRS impersonation',
    category: 'government-impersonation',
    weight: 33,
    patterns: [
      /\b(irs|internal revenue service)\b/i,
      /\btax (debt|liability|lien|levy) (payment|notice) (due|required)\b/i,
      /\byou (owe|must pay) .{0,20}(back taxes|tax debt)\b/i,
      /\bavoid (arrest|legal action|garnishment) (by paying|pay)\b/i,
      /\bpay your taxes (with|using) (gift card|itunes|google play|bitcoin|steam)/i,
      /\bfederal tax (lien|levy) (has been|will be) (filed|issued)\b/i,
      /\bcall .{0,10}to (settle|resolve) your tax (debt|matter) (immediately|today)\b/i,
    ],
    benignPatterns: [
      /\bcp-?\d{2,3}\b/i,
      /\bnotice (cp|lt)\b/i,
      /\birs\.gov\b/i,
      /\bform (w-2|1099|1040|w-4|9465)\b/i,
    ],
    what:
      'A call or message claims you owe back taxes and must pay immediately by gift card, crypto or prepaid card to avoid arrest or deportation.',
    whyItWorks:
      'Tax fear is universal and the IRS is genuinely intimidating. The IRS may contact you about an account — including by phone — but it never demands immediate payment, never threatens arrest, and never asks for gift cards or cryptocurrency. Real IRS employees can also set up payment plans, which is the opposite of the scam\'s demand.',
    theAsk: 'Pay immediately by an untraceable method, or "confirm" your SSN and bank details.',
    whatToDo: [
      'Hang up. Real IRS first contact is by letter, not by threatening phone call.',
      'Log into your IRS online account or call the number on irs.gov to check your actual balance.',
      'If you do owe, ask about payment plans and the Taxpayer Advocate Service.',
      'Report IRS impersonation to the Treasury Inspector General for Tax Administration and the FTC.',
    ],
    never: [
      'Never pay the IRS with gift cards, crypto or a prepaid card.',
      'Never give your SSN or banking details to an incoming caller.',
    ],
    reportTo: [
      { name: 'Treasury Inspector General — IRS scams', url: 'https://www.tigta.gov/' },
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
      { name: 'IRS — Report phishing', url: 'https://www.irs.gov/help/report-fraud/report-fake-irs-treasury-or-tax-related-emails-and-messages' },
    ],
    relatedTopicId: 'topic-taxes-basics',
  },
  {
    id: 'tax-prep-fraud',
    name: 'Unscrupulous tax preparer',
    category: 'banking',
    weight: 24,
    patterns: [
      /\b(guaranteed|maximum|biggest) (refund|tax refund)\b/i,
      /\bwe (can )?(get|claim) you .{0,20}(refund) (even|without) (if|without) (you have no|no) (income|ssn)\b/i,
      /\bclaim (dependents|credits) you (do not|don'?t) have\b/i,
      /\b(we will|i will) sign (your|the) return (for you|on your behalf)\b/i,
      /\bfee (is|will be) \d{1,2}% of your refund\b/i,
      /\byour refund (will be) (deposited|sent) (to|into) (my|our) (account|temporary account)\b/i,
      /\bno (it|ssn) necessary.{0,30}(refund|tax)\b/i,
    ],
    what:
      'A tax preparer promises inflated refunds, invents credits or dependents, charges a percentage of the refund, or routes your refund into their own account.',
    whyItWorks:
      'The preparer looks like a helper, and the refund arrives — until an audit or a repayment demand lands on the person who signed the return: you.',
    theAsk: 'Sign a return you do not understand, with claims you cannot verify, and pay a percentage fee.',
    whatToDo: [
      'Use a free VITA site or a credentialed preparer. Ask for their PTIN or credential.',
      'Insist that the refund go into your own account or your own check — never the preparer\'s.',
      'Read the return before signing. If you cannot understand a line, ask; if they cannot explain it, leave.',
      'Keep a copy of the whole return and file an amended return if a preparer took improper claims.',
    ],
    never: [
      'Never sign a return that claims credits or dependents you do not qualify for.',
      'Never let a preparer receive your refund in their account.',
    ],
    reportTo: [
      { name: 'IRS — Report tax preparer misconduct', url: 'https://www.irs.gov/tax-professionals' },
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
    ],
    relatedTopicId: 'topic-taxes-basics',
  },
  {
    id: 'credit-repair-scam',
    name: 'Credit repair and "fix your credit" offers',
    category: 'debt',
    weight: 22,
    patterns: [
      /\b(fix|repair|erase|delete|clean) (your )?(bad )?(credit|credit history|collections)\b/i,
      /\bwe can (remove|erase|delete) (negative|bad|criminal|bankruptc\w+|collections)\b/i,
      /\bnew (credit )?(identity|cpn|profile)\b/i,
      /\bcpn number\b/i,
      /\bpay (us|me) (a )?(upfront|first|initial) (fee|payment) (to|and we)\b/i,
      /\bguaranteed (score increase|credit approval)\b/i,
    ],
    what:
      'Companies promise to erase accurate negative history or build a "new identity" (a CPN), charging upfront fees for something they cannot legally do.',
    whyItWorks:
      'An empty or damaged credit file is a real barrier to housing and cars, and the jargon ("CPN", "tradeline") sounds technical enough to trust.',
    theAsk: 'Pay an upfront fee. Using a CPN is identity fraud and can be prosecuted.',
    whatToDo: [
      'Know the law: credit repair companies cannot charge before performing services.',
      'Dispute genuine errors yourself for free — that is the only legitimate "repair".',
      'Build credit with a secured card instead of paying for a shortcut.',
    ],
    never: [
      'Never pay upfront for "deletion" of accurate information.',
      'Never buy or use a CPN or a "new identity".',
    ],
    reportTo: [
      { name: 'FTC — Credit repair scams', url: 'https://consumer.ftc.gov/articles/credit-repair-how-help-yourself' },
      { name: 'CFPB — Submit a complaint', url: 'https://www.consumerfinance.gov/complaint/' },
    ],
    relatedTopicId: 'topic-credit-score',
  },
  {
    id: 'advance-fee-loan',
    name: 'Advance-fee loan, "guaranteed approval", or immigration bond',
    category: 'debt',
    weight: 29,
    patterns: [
      /\bguaranteed (loan|approval|credit card) (regardless|no matter|no credit)\b/i,
      /\b(no credit check|bad credit ok) .{0,40}\b(pay|fee|deposit) (a )?\$?\d+/i,
      /\bloan (fee|insurance|processing) (of )?\$\d+ (upfront|in advance|before)\b/i,
      /\bpay (a )?(processing|application|insurance|advance) fee (to|before) (receive|get) (your )?(loan|money|funds)\b/i,
      /\bimmigration bond\b.{0,60}\b(pay|payment|bail)\b/i,
      /\bbail (bond)?.{0,40}\b(gift card|zelle|wire|crypto)\b/i,
      /\bsend .{0,20}(deposit|fee) .{0,20}(and|then) (we|the funds|your loan)\b/i,
    ],
    what:
      'A loan, credit card or immigration bond "approved" in exchange for an upfront fee, or a demand for payment to a private individual to release someone from detention.',
    whyItWorks:
      'A sudden need for cash — or a family member in detention — creates exactly the urgency these schemes require.',
    theAsk: 'Pay an upfront fee or deposit to receive money or to free a detained relative.',
    whatToDo: [
      'Verify a lender is registered and licensed in your state before paying anything.',
      'For immigration bonds, deal only with a licensed bonding agent or the official payment channels — verify the detainee\'s location and case through official tools.',
      'Never pay a "fee" to receive a loan or a prize. Real lenders deduct from the proceeds.',
    ],
    never: [
      'Never pay an upfront fee to receive a loan.',
      'Never pay a bail or immigration bond to an individual with no license, no receipt and no office.',
    ],
    reportTo: [
      { name: 'CFPB — Submit a complaint', url: 'https://www.consumerfinance.gov/complaint/' },
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
    ],
  },
  {
    id: 'family-emergency',
    name: 'Family emergency impersonation (grandparent / relative in trouble)',
    category: 'romance',
    weight: 27,
    patterns: [
      /\b(your|the) (son|daughter|grandson|granddaughter|nephew|niece|brother|sister|cousin|mother|father) (is|has been) (arrested|in (a )?(accident|jail|prison|hospital)|detained|hurt|kidnapped)\b/i,
      /\b(need|needs|send)\b[^.!?]{0,20}\bmoney\b[^.!?]{0,25}\b(urgently|right now|immediately|asap|for (bail|hospital|lawyer|fine|ticket|release))\b/i,
      /\b(do ?n'?t|do not|dont) (tell|call|inform|contact) (my|our|your|the) (parents|family|mom|dad|mother|father|husband|wife)\b/i,
      /\b(this is|it'?s|it is)\b[^.!?]{0,20}\b(your|me,? your) (grandson|granddaughter|nephew|niece|son|daughter|relative|cousin)\b/i,
      /\b(i (am|'m) (in|at) (jail|prison|the hospital)|i (got|was) (arrested|detained))\b/i,
      /\bnew (phone )?number,? (save|this is) (it|my new)\b[^.!?]{0,80}\b(money|help|urgent|bail)\b/i,
      /\b(save|use) (this|my) new number\b[^.!?]{0,90}\b(money|help|urgent|bail|send)\b/i,
    ],
    what:
      'A message pretends to be from a relative (or about a relative) in an emergency, with a new phone number and a demand for money that must be sent immediately and in secret.',
    whyItWorks:
      'It bypasses judgment with love and panic at once. The "new number, do not tell anyone" detail explains why you cannot verify by calling the old number.',
    theAsk: 'Send money right now, usually by wire, payment app or gift card, and keep it secret.',
    whatToDo: [
      'Call the relative on a number you already have. Find a way — through another family member if necessary.',
      'Ask a question only the real person could answer.',
      'Never send money to a "new number" without verification, no matter how upsetting the story is.',
      'Report it, and warn family members who might receive the same message.',
    ],
    never: [
      'Never send money in response to an unverified emergency message.',
      'Never accept "do not tell anyone" as a condition.',
    ],
    reportTo: [
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
      { name: 'FBI — Internet Crime Complaint Center', url: 'https://www.ic3.gov/' },
    ],
    relatedTopicId: 'topic-remittances',
  },
  {
    id: 'romance',
    name: 'Romance and long-term "relationship" scams',
    category: 'romance',
    weight: 27,
    patterns: [
      /\b(met|matched|connected) (you )?on (facebook|instagram|whatsapp|telegram|tinder|hinge|bumble|a dating)/i,
      /\bi (feel like i) (love|trust) you\b.{0,80}\b(money|send|help|invest)\b/i,
      /\bmy (only|dear|love)\b.{0,60}\b(help|money|transfer|crypto)\b/i,
      /\b(help me) (pay|cover) (my|the) (visa|hospital|tax|customs|plane ticket|release)\b/i,
      /\b(customs|airport) (is holding|has) (my|the) (package|gift|money)\b/i,
      /\blet us (invest|trade) (together|crypto)\b/i,
      /\bmy (uncle|father|broker|account manager) (trade|invest)s? (crypto|forex|gold)\b/i,
    ],
    what:
      'A long, patient online relationship that eventually requires money — for a visa, a hospital bill, customs, or an "investment" the person says will fund your future together.',
    whyItWorks:
      'Loneliness and the desire for stability are human; the scam spends weeks building genuine emotional investment before asking for anything. Romance fraud generated about $1.49 billion in reported losses in 2025.',
    theAsk: 'Send money, receive and forward money, or invest in a platform they introduce.',
    whatToDo: [
      'Ask for a live video call early. Consistent refusal to appear on camera is a strong signal.',
      'Reverse-image search the person\'s photos — stolen photos are the standard tool.',
      'Never send money, and never act as an intermediary for someone you have not met.',
      'Tell someone. These schemes depend on isolation.',
    ],
    never: [
      'Never send crypto to a trading platform introduced by an online romantic interest.',
      'Never accept money into your account for an online partner.',
    ],
    reportTo: [
      { name: 'FTC — Romance scams', url: 'https://consumer.ftc.gov/articles/what-know-about-romance-scams' },
      { name: 'FBI — Internet Crime Complaint Center', url: 'https://www.ic3.gov/' },
    ],
    relatedTopicId: 'topic-remittances',
  },
  {
    id: 'crypto-investment',
    name: 'Crypto / "trading mentor" investment scheme',
    category: 'investment',
    weight: 30,
    patterns: [
      /\b(bitcoin|crypto|usdt|ethereum|forex|gold trading) (investment|platform|robot|trading signals)\b/i,
      /\bguaranteed (returns?|profits?|daily returns?|%\s?(daily|weekly|monthly))\b/i,
      /\b\d{1,3}(\.\d+)?% (profit|return)s? (per|a) (day|week|month)\b/i,
      /\b(withdraw|unlock) (your )?(profits|funds|earnings)\b.{0,40}\b(tax|fee|deposit)\b/i,
      /\bcrypto ?atm\b/i,
      /\bmentor .{0,30}\b(invest|trading|crypto|signals)\b/i,
      /\b(i|we) (will )?teach you to (trade|earn) (crypto|forex|on)\b/i,
      /\bdeposit .{0,20}\b(withdraw)\b.{0,30}\b(need|must|pay)\b/i,
    ],
    what:
      'A "mentor", Telegram/WhatsApp group or dating-app contact guides you into a fake trading platform showing eye-watering profits; withdrawals suddenly require a "tax" or "fee" you must pay first.',
    whyItWorks:
      'The platform shows you fake balances that grow, which converts disbelief into greed and then into sunk-cost desperation.',
    theAsk: 'Deposit money, then pay a "withdrawal fee" or "tax" to release profits that do not exist.',
    whatToDo: [
      'Check whether the platform is registered with regulators (state securities regulators, the SEC, or the CFTC). Most are not.',
      'Remember the rule: legitimate investments never require you to pay a fee to withdraw your own money.',
      'Never send crypto or cash to an individual introduced online.',
      'Report to IC3 and the FTC, and to your state securities regulator.',
    ],
    never: [
      'Never put money into a platform a stranger introduced you to.',
      'Never use a crypto ATM for anything. Money sent is effectively unrecoverable.',
    ],
    reportTo: [
      { name: 'FBI — Internet Crime Complaint Center', url: 'https://www.ic3.gov/' },
      { name: 'SEC — How to avoid fraud', url: 'https://www.sec.gov/oiea/investor-alerts-and-bulletins' },
      { name: 'CFTC — Check before you invest', url: 'https://www.cftc.gov/LearnAndProtect' },
    ],
  },
  {
    id: 'tech-support',
    name: 'Tech support / virus pop-up scam',
    category: 'tech-support',
    weight: 24,
    patterns: [
      /\b(your )?(computer|pc|device|phone) (is|has been) (infected|hacked|compromised|locked)\b/i,
      /\b(microsoft|apple|google|windows|mcafee|norton) (support|security|technician|defender) (alert|team)\b/i,
      /\bcall (this number|us) (immediately|now) .{0,30}\b(virus|infected|support)\b/i,
      /\byour (licence|license|subscription) (has )?(expired|renewed) .{0,30}(call|pay)\b/i,
      /\bgive (me|us) (remote )?(access|control) (to|of) your (computer|device)\b/i,
      /\banydesk|teamviewer\b/i,
    ],
    what:
      'A pop-up or call claims your device is infected and directs you to a fake support line that charges for useless "repairs" or installs remote access to your banking.',
    whyItWorks: 'Technical authority is intimidating, especially for someone whose English and US systems knowledge are still developing.',
    theAsk: 'Pay for "support", install remote-access software, or buy gift cards to "fix" the problem.',
    whatToDo: [
      'Close the browser tab or force-quit the app. Do not call numbers from pop-ups.',
      'Never install remote-access software at a stranger\'s request.',
      'If you already paid, contact your bank and card issuer immediately and report it.',
    ],
    never: [
      'Never let a stranger control your device.',
      'Never pay a support "fee" by gift card or crypto.',
    ],
    reportTo: [
      { name: 'FTC — Tech support scams', url: 'https://consumer.ftc.gov/articles/how-spot-avoid-and-report-tech-support-scams' },
      { name: 'FBI — Internet Crime Complaint Center', url: 'https://www.ic3.gov/' },
    ],
  },
  {
    id: 'delivery-package',
    name: 'Fake delivery / missed package text',
    category: 'delivery',
    weight: 20,
    patterns: [
      /\b(usps|ups|fedex|dhl|amazon)\b.{0,60}\b(package|parcel|delivery)\b.{0,60}\b(failed|held|pending|awaiting|reschedule|redeliver)\b/i,
      /\bpackage (is|has been) (held|on hold|awaiting) (at|in) (our|the) (facility|warehouse|depot)\b/i,
      /\bsmall (shipping|redelivery|handling|rescheduling) fee\b/i,
      /\bconfirm your (address|delivery) (within|in the next) \d+ (hours|minutes)\b/i,
      /\btrack.{0,20}(your )?(parcel|package).{0,30}\bclick\b/i,
    ],
    what:
      'A text about a held package with a link to pay a small redelivery fee, which harvests your card details or installs malware.',
    whyItWorks:
      'Small amounts feel safe, and most people have ordered something recently.',
    theAsk: 'Click a link and pay a small "shipping fee" with your card.',
    whatToDo: [
      'Track packages only on the carrier\'s official site by typing the address yourself.',
      'Never pay a fee through a link in a text.',
      'Report and delete the message.',
    ],
    never: ['Never enter card details after clicking a link from a text.', 'Never reply to these texts.'],
    reportTo: [
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
      { name: 'USPIS — Report mail fraud', url: 'https://www.uspis.gov/report' },
    ],
  },
  {
    id: 'toll-text',
    name: 'Fake unpaid toll / traffic camera text',
    category: 'delivery',
    weight: 20,
    patterns: [
      /\b(unpaid|outstanding) (toll|tolls|balance) (on|for) your (vehicle|car|plate)\b/i,
      /\b(e-?zpass|fastrak|sunpass|toll) (balance|payment) (due|is due|overdue)\b/i,
      /\bavoid (a )?late fee.{0,40}\b(pay|click)\b/i,
      /\bpay your toll.{0,30}\b(within|in) \d+ hours\b/i,
      /\btraffic (camera|violation) (notice|photo).{0,40}\b(pay|click|link)\b/i,
    ],
    what:
      'A text claims you owe tolls and threatens escalating fines, with a link to a lookalike payment page.',
    whyItWorks: 'Many states really do send toll notices, and a small plausible amount plus a deadline makes people pay without checking.',
    theAsk: 'Click a link and pay with your card.',
    whatToDo: [
      'Check your state toll authority\'s official website by typing the address yourself.',
      'Never pay a toll or violation from a link in a text.',
      'Report it to the FTC.',
    ],
    never: ['Never pay a "toll" from a text link.', 'Never call the number in the message.'],
    reportTo: [{ name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' }],
  },
  {
    id: 'utility-shutoff',
    name: 'Utility shut-off threat',
    category: 'government-impersonation',
    weight: 26,
    patterns: [
      /\b(electric|power|gas|water|energy) (will be|is being|has been) (shut off|disconnected|cut off)\b/i,
      /\b(disconnection|shut-?off) (notice|fee|in \d+) (today|within|requires|for)\b/i,
      /\breconnection (fee|payment) (of )?\$\d+/i,
      /\bpay (immediately|now|today) to (avoid|prevent|stop) (disconnection|shut ?off)\b/i,
      /\bmeter (reading|technician|inspector) needs (payment|your card details)\b/i,
      /\bpay (via|with|using) (gift card|prepaid|itunes|money pak|bitcoin|crypto)\b/i,
    ],
    what:
      'A caller claims your electricity, gas or water will be cut off within hours unless you pay immediately by prepaid card, gift card or app.',
    whyItWorks:
      'Losing power or water is a genuine emergency, especially with children in the home, and a "reconnection fee" sounds like a real thing.',
    theAsk: 'Pay an immediate "reconnection" or "deposit" by an untraceable method.',
    whatToDo: [
      'Hang up and call the number printed on your own utility bill or in your online account.',
      'Ask about payment plans and your state\'s disconnection moratoriums or protections.',
      'Apply for LIHEAP or local hardship funds through official channels.',
      'Report the call to the utility and to the FTC.',
    ],
    never: [
      'Never pay any bill with a prepaid or gift card.',
      'Never let a caller rush you past the number on your own bill.',
    ],
    reportTo: [
      { name: 'FTC — Utility scams', url: 'https://consumer.ftc.gov/articles/utility-scams' },
      { name: 'LIHEAP — Energy assistance', url: 'https://www.acf.hhs.gov/ocs/programs/liheap' },
    ],
    relatedTopicId: 'topic-utilities-setup',
  },
  {
    id: 'rental-listing',
    name: 'Rental listing scam (unseen apartment, deposit by wire)',
    category: 'housing',
    weight: 32,
    patterns: [
      /\b(apartment|room|house|studio) (for rent|available) .{0,60}\b(\$?\d{3,4})\b/i,
      /\bdeposit (by|via|through) (wire|zelle|venmo|cash ?app|bitcoin|western union|moneygram|crypto)\b/i,
      /\b(landlord|owner) (is|will be) (out of (town|state|country)|away|unavailable|missionary)\b/i,
      /\b(cannot|could not|unable to) (show|meet|show you|do (a )?showing) (the )?(unit|apartment|house)\b/i,
      /\bsend (the )?(deposit|first month|money) (to|via) (hold|secure|reserve) (the|your)\b/i,
      /\bkey(s)? will be (mailed|shipped|sent) (after|once) (payment|deposit)\b/i,
      /\bmonth ?to ?month.{0,20}no (credit check|lease|contract)\b/i,
      /\bwhatsapp me.{0,30}\b(apartment|room|rent)\b/i,
      /\bapply (fee|deposit) of \$?\d{2,4}.{0,30}(before|to) (see|view|visit)\b/i,
    ],
    what:
      'A desirable unit is advertised at below-market rent; the "landlord" cannot meet you, and asks for a deposit or "application fee" by wire or app to hand over keys that never arrive.',
    whyItWorks:
      'Housing pressure is the sharpest pain point, and a below-market unit triggers fear of losing it — which is exactly the pressure the scheme manufactures.',
    theAsk: 'Send money before you have seen the inside of the unit or verified the owner.',
    whatToDo: [
      'Never send money for a unit you have not walked through yourself, or that a live video call has not shown.',
      'Verify ownership: ask for the county property records (public online in most counties) and check the name against the person you are talking to.',
      'Ask for a written application, an address, and a walkthrough appointment. Refusal is the answer.',
      'Report the listing to the platform, and to the FTC.',
    ],
    never: [
      'Never pay a deposit by wire, payment app or crypto to someone you have not met in person.',
      'Never accept "no lease, just send the deposit" arrangements.',
    ],
    reportTo: [
      { name: 'FTC — Rental listing scams', url: 'https://consumer.ftc.gov/articles/rental-listing-scams' },
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
    ],
    relatedTopicId: 'topic-renting-first-apartment',
  },
  {
    id: 'deposit-scam',
    name: 'Deposit theft and unauthorized deductions',
    category: 'housing',
    weight: 18,
    patterns: [
      /\bnon[- ]?refundable (security )?deposit\b/i,
      /\bcleaning fee (of )?\$\d{3,} (non[- ]?refundable|deducted)\b/i,
      /\bdeposit (will not|won'?t) be returned\b/i,
      /\bwe keep (the )?deposit (if|for) (normal|any)\b/i,
      /\bfee (is|will be) deducted from your deposit (regardless|no matter what)\b/i,
    ],
    what:
      'A lease or listing includes a "non-refundable deposit" or an automatic deduction that contradicts state deposit law.',
    whyItWorks:
      'People assume whatever the contract says is legal. Many lease clauses are unenforceable — but only if you know to object.',
    theAsk: 'Sign a lease with deductions the law may not permit.',
    whatToDo: [
      'Check your state\'s deposit cap and return deadline before signing.',
      'Get the deposit amount, its purpose, and the move-out process in writing.',
      'Document conditions at move-in with photos and a written condition report.',
      'Escalate to your state consumer or housing agency if deductions are made improperly.',
    ],
    never: ['Never pay cash rent or deposit with no receipt.', 'Never sign knowing the deduction is unavoidable.'],
    reportTo: [
      { name: 'HUD — Tenant rights', url: 'https://www.hud.gov/topics/rental_assistance/tenantrights' },
      { name: 'USA.gov — Small claims court', url: 'https://www.usa.gov/small-claims-court' },
    ],
    relatedTopicId: 'topic-moving-out-deposit',
  },
  {
    id: 'landlord-cash',
    name: 'Cash-only rent with no receipts',
    category: 'housing',
    weight: 20,
    patterns: [
      /\bcash (only|payment)\b.{0,30}\b(rent|deposit)\b/i,
      /\brent .{0,20}paid (in cash|under the table)\b/i,
      /\bno (receipts?|lease|contract) (allowed|provided|given)\b/i,
      /\bdo ?n'?t (need|require) (receipts|a lease|paperwork)\b/i,
      /\bpay (the|my) (relative|man|brother|cousin) (in )?cash\b/i,
    ],
    what:
      'A rental arrangement where money changes hands in cash, with no lease and no receipts — leaving you unable to prove payment or tenancy.',
    whyItWorks: 'It can feel like a favor, especially for someone without credit history or documentation.',
    theAsk: 'Hand over cash with no written record.',
    whatToDo: [
      'Ask for a written receipt for every payment, or pay by bank transfer instead.',
      'Insist on a signed lease, even a simple one, with names, amounts and dates.',
      'Keep your own log of payments with dates, amounts and who received them.',
    ],
    never: ['Never pay a full month\'s rent in cash with no receipt.', 'Never accept a verbal tenancy agreement.'],
    reportTo: [{ name: 'HUD — Tenant rights', url: 'https://www.hud.gov/topics/rental_assistance/tenantrights' }],
    relatedTopicId: 'topic-renting-first-apartment',
  },
  {
    id: 'insurance-scam',
    name: 'Fake or useless insurance policy',
    category: 'debt',
    weight: 26,
    patterns: [
      /\b(cheap|cheapest|low ?cost) (car|auto|health|life) insurance\b.{0,60}\b(call|text|whatsapp|telegram|pay)\b/i,
      /\bpolicy (number|documents?) (will be|sent) (later|after payment)\b/i,
      /\binsurance (card|proof) (immediately|same day) \$\d+/i,
      /\bno questions asked (insurance|coverage)\b/i,
      /\bpay (via|with) (zelle|cash ?app|gift card|bitcoin|crypto) for (insurance|coverage)\b/i,
      /\bcertificate of insurance\b.{0,40}\b(online|instant|click)\b/i,
    ],
    what:
      'Unlicensed sellers offer suspiciously cheap insurance, take payment, and provide a certificate for a policy that does not exist — discovered only after an accident.',
    whyItWorks:
      'Insurance is legally required, so any price feels like a relief — and the documents look plausible.',
    theAsk: 'Pay upfront through a peer-to-peer method for coverage without verifying the seller.',
    whatToDo: [
      'Verify the agent\'s or company\'s license with your state insurance department before paying.',
      'Pay only through official channels (direct debit, the insurer\'s website) and keep the policy documents.',
      'Confirm coverage directly with the insurer\'s customer service number from its own website.',
    ],
    never: [
      'Never buy insurance paid by gift card, crypto, or a peer-to-peer app to an individual.',
      'Never drive believing you have coverage you have not confirmed with the insurer.',
    ],
    reportTo: [
      { name: 'NAIC — Consumer insurance resources', url: 'https://content.naic.org/consumer' },
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
    ],
    relatedTopicId: 'topic-insurance-basics',
  },
  {
    id: 'accident-scam',
    name: 'Staged accident / "you hit my car" demand',
    category: 'insurance',
    weight: 22,
    patterns: [
      /\byou (hit|damaged|scratched) my (car|vehicle|mirror|bumper)\b/i,
      /\bsettle (this|it) (in|with) cash (now|today|right here)\b/i,
      /\bpay (me )?\$\d{2,4} (now|today|in cash) (and|so) (we (can|will) )?(forget|not (call|report))\b/i,
      /\bno (police|insurance) (need|necessary|involved)\b/i,
      /\bwitness (says|saw) you (did it|hit)\b/i,
    ],
    what:
      'A staged collision or a fabricated claim that you damaged someone\'s vehicle, with pressure to settle in cash and keep police and insurers out of it.',
    whyItWorks:
      'Fear of police, insurance and documentation makes immigrants especially likely to pay quietly.',
    theAsk: 'Pay cash on the spot without a police report or insurer involvement.',
    whatToDo: [
      'Call the police and document the scene, whatever the other person says.',
      'Photograph everything: vehicles, plates, positions, damage, and the other person.',
      'Give your insurer the facts. Do not pay cash to end a scene.',
      'If you are being pressured, get to a public place and call for help.',
    ],
    never: [
      'Never pay cash at the roadside to avoid a report.',
      'Never accept blame you are not certain of.',
    ],
    reportTo: [
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
      { name: 'NAIC — Consumer insurance resources', url: 'https://content.naic.org/consumer' },
    ],
  },
  {
    id: 'vehicle-shipping',
    name: 'Fake vehicle purchase / shipping scam',
    category: 'delivery',
    weight: 28,
    patterns: [
      /\b(car|vehicle|truck|motorcycle) (will be|to be) (shipped|delivered|transported) (to you|after payment)\b/i,
      /\bshipping (company|agent|cost|fee) (will|to) (handle|cover|arrange)\b/i,
      /\bpayment (via|by) (wire|gift card|itunes|bitcoin|crypto|western union) for (the )?(car|vehicle|deposit)\b/i,
      /\b(ebay|amazon|paypal) (buyer|purchase) protection (guarantee|covers this)\b/i,
      /\bwe (hold|will hold) the (funds|payment) in escrow (until|after) (delivery|shipping)\b/i,
      /\bthe (seller|owner) is (overseas|abroad|out of the country|military)\b/i,
    ],
    what:
      'A vehicle (or pet, or equipment) that cannot be seen is offered at a good price, with "escrow" or "buyer protection" that does not exist, and payment by wire or gift card.',
    whyItWorks:
      'Fake escrow pages look official, and the promise of protecting you makes the transfer feel safe.',
    theAsk: 'Wire money for something you have not inspected, based on a fake escrow guarantee.',
    whatToDo: [
      'Never buy a vehicle you have not inspected in person and whose title you have not seen.',
      'Verify any "escrow" service independently — call the real company through its own website.',
      'Pay only by traceable methods at a real bank or DMV, in daylight, with a witness.',
      'Report the listing to the platform and the FTC.',
    ],
    never: [
      'Never send money for shipping before seeing the vehicle.',
      'Never trust "buyer protection" claims without verifying them directly with that company.',
    ],
    reportTo: [
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
      { name: 'FBI — Internet Crime Complaint Center', url: 'https://www.ic3.gov/' },
    ],
    relatedTopicId: 'topic-buying-a-car',
  },
  {
    id: 'curbstone',
    name: 'Curbstoner / illegal used-car dealer',
    category: 'debt',
    weight: 18,
    patterns: [
      /\b(title is (in|under) (my|a) (friend|cousin|brother|relative|partner)'?s? name)\b/i,
      /\bwe (just )?(never|didn'?t) (transferred|registered) the title\b/i,
      /\bsalvage (title )?but (it|the car) (is|runs) (fine|great|perfect)\b/i,
      /\bcash only,? (meet|meeting) (me|you) (in|at) (a )?(parking lot|gas station)\b/i,
      /\bno (test drive|inspection|mechanic) (allowed|possible|needed)\b/i,
      /\bi am selling (this )?(for|on behalf of) (my|a) (friend|cousin|relative|brother)\b/i,
    ],
    what:
      'An unlicensed dealer posing as a private owner sells a car with a mismatched title, hidden salvage history, or a rolled-back odometer.',
    whyItWorks: 'A cheap car with a friendly story is exactly what someone with no US credit history wants.',
    theAsk: 'Buy without verifying the title and the seller\'s identity.',
    whatToDo: [
      'Demand that the name on the title match the seller\'s ID exactly. If not, walk away.',
      'Run the VIN through a title-history check and pay for an independent mechanic inspection.',
      'Meet at a bank or DMV in daylight with a witness. Pay traceably and get a signed bill of sale.',
    ],
    never: [
      'Never buy a car whose title is not in the seller\'s name.',
      'Never skip the pre-purchase inspection because the seller is in a hurry.',
    ],
    reportTo: [
      { name: 'NHTSA — Odometer fraud', url: 'https://www.nhtsa.gov/equipment/odometer-fraud' },
      { name: 'NMVTIS — Title history', url: 'https://vehiclehistory.bja.ojp.gov/' },
    ],
    relatedTopicId: 'topic-buying-a-car',
  },
  {
    id: 'health-insurance-scam',
    name: 'Fake health insurance / "Obamacare" enrollment scam',
    category: 'government-impersonation',
    weight: 27,
    patterns: [
      /\b(obamacare|affordable care act|aca) (enrollment|sign ?up|agent|specialist|subsidy)\b.{0,60}\b(call|fee|pay|now)\b/i,
      /\b(health|medical) (discount|benefit) (plan|card) (for|starting at) \$?\d+\b/i,
      /\bguaranteed (health )?(coverage|approval) (no|without) (questions|medical|ssn)\b/i,
      /\bpay (a )?(registration|enrollment|processing) fee (to|for) (get|activate) (coverage|insurance)\b/i,
      /\byour (medicaid|marketplace) (plan|coverage) (will be|is being) (cancelled|terminated) (unless|if) you (do not )?(call|pay|act)\b/i,
      /\bmedicare (card|benefits) (reactivation|update) fee\b/i,
    ],
    what:
      'A caller sells a "health plan" that is actually a discount card, or poses as a Marketplace/Medicaid agent demanding payment to keep coverage.',
    whyItWorks:
      'The 2026 subsidy changes created real confusion, and scammers use that confusion as their sales script.',
    theAsk: 'Pay a fee to enroll, "activate" or keep coverage, or hand over your SSN and bank details.',
    whatToDo: [
      'Enroll only through healthcare.gov, your state exchange, or your state Medicaid office. Help is free.',
      'Check whether a plan is real insurance by confirming it with your state insurance department.',
      'Never pay a fee to a "navigator" or "agent" to keep Medicaid or Marketplace coverage.',
      'Report the call to the FTC and your state insurance department.',
    ],
    never: [
      'Never buy a "discount plan" believing it is insurance. It will not pay hospital bills.',
      'Never pay a stranger to enroll you in a free government program.',
    ],
    reportTo: [
      { name: 'HealthCare.gov — Official marketplace', url: 'https://www.healthcare.gov/' },
      { name: 'FTC — Health insurance scams', url: 'https://consumer.ftc.gov/articles/health-insurance-scams' },
      { name: 'NAIC — Consumer resources', url: 'https://content.naic.org/consumer' },
    ],
    relatedTopicId: 'topic-health-insurance',
  },
  {
    id: 'medical-bill-scam',
    name: 'Fake medical bill / hospital collections scam',
    category: 'debt',
    weight: 24,
    patterns: [
      /\b(unpaid|outstanding) (medical|hospital) (bill|balance|charges?)\b.{0,60}\b(pay|click|call)\b/i,
      /\b(your|the) (hospital|medical) (account|bill) (has been|was) (sent to|referred to) collections\b/i,
      /\bpay (now|today) (to|and) (avoid|prevent) (collections|legal action|credit damage)\b/i,
      /\bclick (here|this link) to (pay|view) your (medical|hospital) (bill|statement)\b/i,
      /\b(medicaid|medicare) (billing|refund) (department) (needs|requires) your (card|bank|ssn)\b/i,
    ],
    what:
      'An email, text or call demands payment for a medical bill you may not owe, or threatens collections to harvest your card or bank details.',
    whyItWorks:
      'Real medical bills are confusing and people are conditioned to pay them; the threat of credit damage finishes the job.',
    theAsk: 'Pay through a link or read card details to a caller.',
    whatToDo: [
      'Call the hospital or provider using the number on their official website — never the one in the message.',
      'Ask for an itemized bill and check it against your insurance explanation of benefits.',
      'Ask about financial assistance and payment plans before paying anything.',
      'Report the message to the FTC, and check your credit reports for fraudulent collections.',
    ],
    never: [
      'Never pay a medical bill from a link in a text or email.',
      'Never give card or bank details to an incoming "billing department" call.',
    ],
    reportTo: [
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
      { name: 'CMS — No Surprises Act', url: 'https://www.cms.gov/nosurprises/consumers' },
      { name: 'CFPB — Medical debt', url: 'https://www.consumerfinance.gov/consumer-tools/medical-debt/' },
    ],
    relatedTopicId: 'topic-medical-bills',
  },
  {
    id: 'debt-collection',
    name: 'Debt collection abuse / zombie debt',
    category: 'debt',
    weight: 22,
    patterns: [
      /\b(you|we) (owe|are owed|must pay) .{0,30}\b(collect|collector|agency|recovery)\b/i,
      /\bpay (today|now) (or|and) (we will|we'?ll) (sue|report|garnish|deport|call immigration)\b/i,
      /\b(arrest|jail|deportation|police) (if|unless) you do not pay\b/i,
      /\bverify your (bank|card|ssn) (to|before) (resolve|settle|discuss) (this|your) (debt|account)\b/i,
      /\bwe (bought|purchased) your (old )?debt\b/i,
      /\bpay (via|by) (zelle|gift card|crypto|wire) to (settle|close) (this|the) (debt|account)\b/i,
    ],
    what:
      'A collector demands payment on a debt — sometimes old, already paid, or not yours — using threats of arrest, deportation or immigration consequences.',
    whyItWorks:
      'Fear of immigration consequences silences people, and the Fair Debt Collection Practices Act protections that exist are rarely known.',
    theAsk: 'Pay immediately, by an untraceable method, without ever receiving written verification of the debt.',
    whatToDo: [
      'Demand written verification of the debt within 30 days. That is your legal right.',
      'Know that debt collectors cannot threaten arrest, deportation, or immigration consequences.',
      'Never give bank or card details to a caller who contacted you first.',
      'Report violations to the CFPB and your state attorney general, and dispute inaccurate items on your credit reports.',
    ],
    never: [
      'Never pay a debt by gift card, crypto or payment app on a caller\'s instruction.',
      'Never acknowledge a debt in writing before receiving verification.',
    ],
    reportTo: [
      { name: 'CFPB — Submit a complaint', url: 'https://www.consumerfinance.gov/complaint/' },
      { name: 'FTC — Debt collection FAQs', url: 'https://consumer.ftc.gov/articles/debt-collection-faqs' },
    ],
    relatedTopicId: 'topic-medical-bills',
  },
  {
    id: 'license-fraud',
    name: 'Driver license / DMV "service" fraud',
    category: 'government-impersonation',
    weight: 24,
    patterns: [
      /\b(dmv|license|permit) (appointment|slot|test) (guaranteed|available) (for|at) \$?\d+/i,
      /\b(we|i) (can|will) (take|pass) (your )?(written|road) test for you\b/i,
      /\bguaranteed pass (driver|license) (test)?\b/i,
      /\b(buy|get) a (driver'?s? )?license (without|no) (test|exam|waiting)\b/i,
      /\bpay (for|to get) a (dmv )?appointment\b/i,
      /\breal id (upgrade|service) (for|at) a fee\b/i,
    ],
    what:
      'Paid "appointment" services, "guaranteed pass" offers, or sellers of licenses that do not exist.',
    whyItWorks:
      'Long DMV waits make a shortcut feel valuable, and language barriers make the process feel impossible alone.',
    theAsk: 'Pay for an appointment, a test result, or a license itself.',
    whatToDo: [
      'Book appointments free on your state\'s official DMV website.',
      'Study the official handbook — the test comes from it, and many states offer it in multiple languages.',
      'Report anyone selling appointments, tests or licenses.',
    ],
    never: [
      'Never let someone take a test as you.',
      'Never buy a license — using a fake one is a crime with immigration consequences.',
    ],
    reportTo: [
      { name: 'USA.gov — Driver licenses and state IDs', url: 'https://www.usa.gov/motor-vehicle-services' },
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
    ],
    relatedTopicId: 'topic-driver-license',
  },
  {
    id: 'benefit-overpayment',
    name: 'Fake benefit overpayment notice (unemployment, SNAP, Medicaid)',
    category: 'government-impersonation',
    weight: 28,
    patterns: [
      /\b(unemployment|benefit|snap|medicaid|food stamp|stimulus)\b[^.!?]{0,40}\boverpayment\b/i,
      /\byou (were )?(overpaid|received too much)\b[^.!?]{0,50}\b(repay|pay back|refund)\b/i,
      /\brepay (the )?(overpayment|benefits)\b[^.!?]{0,50}\b(immediately|today|within \d+)\b/i,
      /\baccount (will be|has been) (suspended|frozen|garnished)\b[^.!?]{0,60}\b(repay|owe|payment)\b/i,
      /\b(repay|pay back)\b[^.!?]{0,40}\b(gift card|prepaid card|zelle|crypto|bitcoin|money order|wire)\b/i,
      /\bunemployment (insurance|benefits) (department|office|agency)\b[^.!?]{0,40}\b(call|pay|verify)\b/i,
    ],
    benignPatterns: [
      /\bnotice of (overpayment|determination)\b/i,
      /\bappeal (rights|deadline)\b/i,
      /\bstate\b[^.!?]{0,30}\bdepartment of labor\b/i,
    ],
    what:
      'A message claims you were overpaid benefits and must repay immediately — by gift card, prepaid card or payment app — or have your account frozen or your wages garnished.',
    whyItWorks:
      'Overpayments are real and genuinely scary, especially for immigrants worried that a government debt will reach their immigration case. The threat is designed to make you pay before you check whether the claim is even yours.',
    theAsk: 'Pay the claimed overpayment instantly through an untraceable method, or hand over bank details to "verify" it.',
    whatToDo: [
      'Contact your state agency using the number on its official website — not the number in the message — and ask whether an overpayment exists.',
      'Ask for the notice in writing, with the period and calculation, and ask about a waiver or an appeal.',
      'If you are on unemployment, appeal in writing within the deadline. Many overpayments are reduced or waived on appeal.',
      'Report the message to the FTC, and to your state agency if it impersonates them.',
    ],
    never: [
      'Never repay a government agency with gift cards, prepaid cards, crypto or a payment app.',
      'Never give bank or card details to an incoming caller claiming a benefit overpayment.',
      'Never skip the appeal because you are afraid — a decision you do not appeal is usually final.',
    ],
    reportTo: [
      { name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' },
      { name: 'DOL — State unemployment agencies', url: 'https://www.dol.gov/general/topic/unemployment-insurance' },
    ],
    relatedTopicId: 'topic-unemployment-benefits',
  },
  {
    id: 'consultant-fee',
    name: 'Fee-for-help that the government gives free',
    category: 'government-impersonation',
    weight: 18,
    patterns: [
      /\bpay (a )?(fee|us) (to|and) (enroll|apply|file|register).{0,40}\b(free|benefit|program|assistance)\b/i,
      /\bwe (will|can) (get|enroll) you in (liheap|snap|medicaid|wic|lifeline|section 8|housing)\b.{0,40}\b(fee|pay)\b/i,
      /\bapplication (assistance|service) fee\b/i,
      /\bwe (charge|take) (a )?(percentage|cut) of your (benefit|refund|voucher)\b/i,
    ],
    what:
      'Charging a fee to apply for benefits or programs that are free to apply for, or taking a cut of a benefit.',
    whyItWorks:
      'Bureaucracy is intimidating and someone offering to handle it feels like relief.',
    theAsk: 'Pay a fee or give up a portion of a benefit you are entitled to.',
    whatToDo: [
      'Apply through the official agency or a free community organization.',
      'Never share your benefit card, PIN or login with anyone.',
      'Report fees charged for free programs to the FTC and your state agency.',
    ],
    never: ['Never pay a fee to claim a benefit you qualify for.', 'Never let anyone keep your benefit card or PIN.'],
    reportTo: [{ name: 'FTC — Report fraud', url: 'https://reportfraud.ftc.gov/' }],
  },
]

export const scamRuleById = new Map(scamRules.map((rule) => [rule.id, rule]))
