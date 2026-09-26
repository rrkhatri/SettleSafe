import type { Fact } from './types'

/**
 * State-level layer.
 *
 * Honesty rule: housing, wage, benefits and licensing rules are set state by
 * state and change constantly. Rather than guess, this file routes you to the
 * official agency for your state and tells you exactly what to look up there.
 * A small number of states carry resolved facts, each with its own dated source.
 */

export type StateRecord = {
  code: string
  name: string
  /** Official links. Kept short and agency-level so they stay valid. */
  links: {
    tenant?: string
    labor?: string
    unemployment?: string
    benefits?: string
    dmv?: string
    tax?: string
    insurance?: string
  }
  /** What to look up in this state, phrased as questions. */
  lookUp: string[]
  /** Only facts we can cite to an official or primary source. */
  facts?: Fact[]
  /** States that issue licenses/IDs without proof of lawful presence, as of the state's own rules. */
  licenseWithoutStatus?: boolean
}

const GENERIC_LOOKUP = [
  'Your state\'s security deposit cap and the deadline to return it with an itemized statement.',
  'How many days\' written notice a landlord must give before entering, and how many you must give before moving out.',
  'Your state minimum wage and overtime rules — local city minimums can be higher than the state rate.',
  'Whether your state runs its own health insurance marketplace or uses healthcare.gov.',
  'Which documents your DMV accepts as proof of identity and residency from someone with your status.',
  'Whether your state has a state-funded food or cash program for immigrants in the five-year waiting period.',
]

function s(
  code: string,
  name: string,
  links: StateRecord['links'],
  extraLookup: string[] = [],
  facts?: Fact[],
  licenseWithoutStatus?: boolean
): StateRecord {
  return {
    code,
    name,
    links,
    lookUp: [...extraLookup, ...GENERIC_LOOKUP],
    facts,
    licenseWithoutStatus,
  }
}

export const states: StateRecord[] = [
  s('AZ', 'Arizona', {
    tenant: 'https://housing.az.gov/',
    labor: 'https://labor.az.gov/',
    unemployment: 'https://des.az.gov/services/employment/unemployment-individual',
    benefits: 'https://des.az.gov/services/basic-needs',
    dmv: 'https://azdot.gov/mvd',
    tax: 'https://azdor.gov/',
    insurance: 'https://difi.az.gov/',
  }),
  s('CA', 'California', {
    tenant: 'https://www.dca.ca.gov/publications/landlordbook/',
    labor: 'https://www.dir.ca.gov/dlse/',
    unemployment: 'https://edd.ca.gov/en/unemployment/',
    benefits: 'https://www.dhcs.ca.gov/services/medi-cal/',
    dmv: 'https://www.dmv.ca.gov/',
    tax: 'https://www.ftb.ca.gov/',
    insurance: 'https://www.insurance.ca.gov/',
  }, [
    'Whether your city has rent control or a just-cause eviction ordinance (many California cities do).',
    'California has a state-funded food program for immigrants in the five-year bar — check whether you qualify.',
  ], [
    {
      id: 'f-ca-deposit-cap',
      claim: 'California generally caps residential security deposits at one month\'s rent, with a narrow exception allowing up to two months for qualifying small landlords.',
      asOf: '2026-08',
      source: { name: 'California DCA — Landlord-Tenant guide / Civil Code 1950.5 (AB 12)', url: 'https://www.dca.ca.gov/publications/landlordbook/' },
      volatility: 'annual',
    },
    {
      id: 'f-ca-deposit-return',
      claim: 'California landlords must return a deposit with an itemized statement within 21 days of the tenant vacating.',
      asOf: '2026-08',
      source: { name: 'California DCA — Landlord-Tenant guide', url: 'https://www.dca.ca.gov/publications/landlordbook/' },
      volatility: 'annual',
    },
  ]),
  s('CO', 'Colorado', {
    tenant: 'https://dora.colorado.gov/divisions/division-of-housing',
    labor: 'https://cdle.colorado.gov/dlss',
    unemployment: 'https://cdle.colorado.gov/unemployment',
    benefits: 'https://cdhs.colorado.gov/apply-for-benefits',
    dmv: 'https://dmv.colorado.gov/',
    tax: 'https://tax.colorado.gov/',
    insurance: 'https://doi.colorado.gov/',
  }),
  s('CT', 'Connecticut', {
    tenant: 'https://portal.ct.gov/doh',
    labor: 'https://portal.ct.gov/dol',
    unemployment: 'https://portal.ct.gov/dol/unemployment',
    benefits: 'https://portal.ct.gov/dss',
    dmv: 'https://portal.ct.gov/dmv',
    tax: 'https://portal.ct.gov/drs',
    insurance: 'https://portal.ct.gov/cid',
  }),
  s('FL', 'Florida', {
    tenant: 'https://www.floridahousing.org/',
    labor: 'https://www.floridajobs.org/',
    unemployment: 'https://www.floridajobs.org/Reemployment-Assistance-Service-Center',
    benefits: 'https://www.myflfamilies.com/services/public-assistance',
    dmv: 'https://www.flhsmv.gov/',
    tax: 'https://floridarevenue.com/',
    insurance: 'https://www.myfloridacfo.com/division/consumers',
  }, ['Florida has no state income tax, so there is no state return for most wage earners.']),
  s('GA', 'Georgia', {
    tenant: 'https://dca.georgia.gov/',
    labor: 'https://dol.georgia.gov/',
    unemployment: 'https://dol.georgia.gov/unemployment-benefits',
    benefits: 'https://dfcs.georgia.gov/services',
    dmv: 'https://dds.georgia.gov/',
    tax: 'https://dor.georgia.gov/',
    insurance: 'https://oci.georgia.gov/',
  }),
  s('IL', 'Illinois', {
    tenant: 'https://www2.illinois.gov/ihda/Pages/default.aspx',
    labor: 'https://labor.illinois.gov/',
    unemployment: 'https://ides.illinois.gov/',
    benefits: 'https://hfs.illinois.gov/medicalclients.html',
    dmv: 'https://www.ilsos.gov/',
    tax: 'https://tax.illinois.gov/',
    insurance: 'https://insurance.illinois.gov/',
  }),
  s('MA', 'Massachusetts', {
    tenant: 'https://www.mass.gov/orgs/executive-office-of-housing-and-livable-communities',
    labor: 'https://www.mass.gov/orgs/department-of-labor-standards',
    unemployment: 'https://www.mass.gov/unemployment-benefits',
    benefits: 'https://www.mass.gov/orgs/masshealth',
    dmv: 'https://www.mass.gov/orgs/registry-of-motor-vehicles',
    tax: 'https://www.mass.gov/orgs/massachusetts-department-of-revenue',
    insurance: 'https://www.mass.gov/orgs/division-of-insurance',
  }),
  s('MD', 'Maryland', {
    tenant: 'https://dhcd.maryland.gov/',
    labor: 'https://www.labor.maryland.gov/labor/',
    unemployment: 'https://www.dllr.state.md.us/employment/unemployment.shtml',
    benefits: 'https://mmcp.health.maryland.gov/',
    dmv: 'https://mva.maryland.gov/',
    tax: 'https://www.marylandtaxes.gov/',
    insurance: 'https://insurance.maryland.gov/',
  }),
  s('MI', 'Michigan', {
    tenant: 'https://www.michigan.gov/mshda',
    labor: 'https://www.michigan.gov/leo/bureaus-agencies/wd',
    unemployment: 'https://www.michigan.gov/uia',
    benefits: 'https://www.michigan.gov/mdhhs',
    dmv: 'https://www.michigan.gov/sos',
    tax: 'https://www.michigan.gov/treasury',
    insurance: 'https://www.michigan.gov/difs',
  }),
  s('MN', 'Minnesota', {
    tenant: 'https://www.mnhousing.gov/',
    labor: 'https://dli.mn.gov/',
    unemployment: 'https://www.uimn.org/',
    benefits: 'https://mn.gov/dhs/people-we-serve/',
    dmv: 'https://dps.mn.gov/divisions/dvs',
    tax: 'https://www.revenue.state.mn.us/',
    insurance: 'https://www.mn.gov/commerce/',
  }),
  s('NC', 'North Carolina', {
    tenant: 'https://www.nchfa.com/',
    labor: 'https://www.labor.nc.gov/',
    unemployment: 'https://www.des.nc.gov/individuals-families/apply-benefits',
    benefits: 'https://www.ncdhhs.gov/divisions/health-benefits',
    dmv: 'https://www.ncdot.gov/dmv/',
    tax: 'https://www.ncdor.gov/',
    insurance: 'https://www.ncdoi.gov/',
  }),
  s('NJ', 'New Jersey', {
    tenant: 'https://www.nj.gov/dca/dhcr/',
    labor: 'https://www.nj.gov/labor/',
    unemployment: 'https://www.nj.gov/labor/myunemployment/',
    benefits: 'https://www.nj.gov/humanservices/njfamilycare/',
    dmv: 'https://www.nj.gov/mvc/',
    tax: 'https://www.nj.gov/treasury/taxation/',
    insurance: 'https://www.nj.gov/dobi/',
  }),
  s('NV', 'Nevada', {
    tenant: 'https://housing.nv.gov/',
    labor: 'https://labor.nv.gov/',
    unemployment: 'https://ui.nv.gov/',
    benefits: 'https://dwss.nv.gov/',
    dmv: 'https://dmvnv.com/',
    tax: 'https://tax.nv.gov/',
    insurance: 'https://doi.nv.gov/',
  }, ['Nevada has no state income tax, so there is no state wage return for most workers.']),
  s('NY', 'New York', {
    tenant: 'https://hcr.ny.gov/',
    labor: 'https://dol.ny.gov/',
    unemployment: 'https://dol.ny.gov/unemployment',
    benefits: 'https://www.health.ny.gov/health_care/medicaid/',
    dmv: 'https://dmv.ny.gov/',
    tax: 'https://www.tax.ny.gov/',
    insurance: 'https://www.dfs.ny.gov/',
  }, [
    'New York City and some other localities have their own tenant protections that go beyond state law.',
    'New York has a state-funded program for immigrants who cannot get federal coverage — check eligibility.',
  ]),
  s('OR', 'Oregon', {
    tenant: 'https://www.oregon.gov/ohcs/',
    labor: 'https://www.oregon.gov/boli/',
    unemployment: 'https://unemployment.oregon.gov/',
    benefits: 'https://www.oregon.gov/oha/hsd/ohp/',
    dmv: 'https://www.oregon.gov/odot/dmv/',
    tax: 'https://www.oregon.gov/dor/',
    insurance: 'https://dfr.oregon.gov/',
  }, ['Oregon has a state-funded food program for some immigrants who cannot get federal SNAP.']),
  s('PA', 'Pennsylvania', {
    tenant: 'https://www.phfa.org/',
    labor: 'https://www.dli.pa.gov/',
    unemployment: 'https://www.uc.pa.gov/',
    benefits: 'https://www.dhs.pa.gov/Services/Assistance/',
    dmv: 'https://www.dmv.pa.gov/',
    tax: 'https://www.revenue.pa.gov/',
    insurance: 'https://www.insurance.pa.gov/',
  }),
  s('TX', 'Texas', {
    tenant: 'https://www.tdhca.texas.gov/',
    labor: 'https://www.twc.texas.gov/',
    unemployment: 'https://www.twc.texas.gov/programs/unemployment-benefits',
    benefits: 'https://www.hhs.texas.gov/services/health/medicaid-chip',
    dmv: 'https://www.txdmv.gov/',
    tax: 'https://comptroller.texas.gov/taxes/',
    insurance: 'https://www.tdi.texas.gov/',
  }, ['Texas has no state income tax, so there is no state return for most wage earners.']),
  s('VA', 'Virginia', {
    tenant: 'https://www.dhcd.virginia.gov/',
    labor: 'https://www.doli.virginia.gov/',
    unemployment: 'https://www.vec.virginia.gov/',
    benefits: 'https://www.dmas.virginia.gov/',
    dmv: 'https://www.dmv.virginia.gov/',
    tax: 'https://www.tax.virginia.gov/',
    insurance: 'https://www.scc.virginia.gov/pages/Insurance',
  }),
  s('WA', 'Washington', {
    tenant: 'https://www.wshfc.org/',
    labor: 'https://www.lni.wa.gov/',
    unemployment: 'https://esd.wa.gov/',
    benefits: 'https://www.hca.wa.gov/',
    dmv: 'https://dol.wa.gov/',
    tax: 'https://dor.wa.gov/',
    insurance: 'https://www.insurance.wa.gov/',
  }, ['Washington issues driver licenses and state IDs to residents regardless of immigration status.']),
]

/** States that issue licenses/IDs regardless of immigration status (as of their own published rules). */
export const licenseWithoutStatusStates = ['CA', 'CO', 'CT', 'DE', 'DC', 'HI', 'IL', 'MD', 'MA', 'MN', 'NV', 'NJ', 'NM', 'NY', 'OR', 'RI', 'UT', 'VT', 'VA', 'WA']

export const stateByCode = new Map(states.map((x) => [x.code, x]))

export function findState(input: string): StateRecord | undefined {
  const raw = input.trim().toLowerCase()
  if (raw.length === 2) return stateByCode.get(raw.toUpperCase())
  return states.find((x) => x.name.toLowerCase() === raw || x.name.toLowerCase().startsWith(raw))
}

export const stateCodes = states.map((x) => x.code)
