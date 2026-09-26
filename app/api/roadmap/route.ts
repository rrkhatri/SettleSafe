import { NextResponse } from 'next/server'
import { buildRoadmap, type Profile, type ImmigrationStatus } from '@/lib/roadmap'
import { stateByCode } from '@/lib/states'

export const runtime = 'nodejs'

const STATUSES: ImmigrationStatus[] = [
  'lpr', 'naturalized', 'work-visa', 'student', 'asylum-pending',
  'tps', 'daca', 'parolee', 'refugee', 'undocumented', 'unsure',
]

function asBool(v: unknown): boolean {
  return v === true || v === 'true' || v === 'on' || v === 'yes'
}

export async function POST(request: Request) {
  let raw: Record<string, unknown>
  try {
    raw = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const status = STATUSES.includes(raw.status as ImmigrationStatus)
    ? (raw.status as ImmigrationStatus)
    : 'unsure'

  const state = String(raw.state ?? '').toUpperCase()
  if (state && !stateByCode.has(state)) {
    return NextResponse.json({ error: 'Unknown state code' }, { status: 400 })
  }

  const profile: Profile = {
    arrivalYear: typeof raw.arrivalYear === 'number' ? raw.arrivalYear : undefined,
    status,
    state: state || 'CA',
    hasSSN: asBool(raw.hasSSN),
    hasITIN: asBool(raw.hasITIN),
    hasBankAccount: asBool(raw.hasBankAccount),
    hasCreditCard: asBool(raw.hasCreditCard),
    employed: asBool(raw.employed),
    paidOnBooks: asBool(raw.paidOnBooks),
    hasCar: asBool(raw.hasCar),
    hasKids: asBool(raw.hasKids),
    age18to25Male: asBool(raw.age18to25Male),
    hasForeignAccounts: asBool(raw.hasForeignAccounts),
    eadExpiry: typeof raw.eadExpiry === 'string' && raw.eadExpiry ? raw.eadExpiry : undefined,
    needsHealthCoverage: asBool(raw.needsHealthCoverage),
  }

  const roadmap = buildRoadmap(profile)
  return NextResponse.json({ roadmap, profile })
}
