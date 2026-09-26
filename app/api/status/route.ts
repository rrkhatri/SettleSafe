import { NextResponse } from 'next/server'
import { detectProvider } from '@/lib/llm'
import { libraryStats, oldestFactDate } from '@/lib/knowledge'
import { scamRules } from '@/lib/scams'
import { states, licenseWithoutStatusStates } from '@/lib/states'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const provider = detectProvider()
  return NextResponse.json({
    ok: true,
    engine: {
      mode: provider.configured ? 'llm-grounded' : 'grounded-offline',
      provider: provider.label,
      model: provider.model,
      // Never expose keys — only whether one is present.
      configured: provider.configured,
    },
    library: {
      ...libraryStats(),
      scamRuleCount: scamRules.length,
      stateCount: states.length,
      licenseWithoutStatusCount: licenseWithoutStatusStates.length,
      oldestFactDate: oldestFactDate(),
    },
  })
}
