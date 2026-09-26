import { GuideChat } from '@/components/GuideChat'
import { detectProvider } from '@/lib/llm'

export const dynamic = 'force-dynamic'

export default async function GuidePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const provider = detectProvider()

  return (
    <div className="wrap">
      <header className="page-head page-head-rule">
        <p className="eyebrow">Ask</p>
        <h1>Ask the guide</h1>
        <p className="lede">
          Ask in your own words — simple English is fine, and you can paste the text of a letter or message you received.
          Answers are assembled from the SettleSafe library, and every factual claim shows the date it was checked and
          the official page it came from.
        </p>
        <p className="status-strip">
          <span className={provider.configured ? 'status-dot' : 'status-dot status-dot-off'} aria-hidden="true" />
          <span>
            {provider.configured ? (
              <>
                Answer engine: <strong>{provider.label}</strong> ({provider.model}), restricted to our vetted facts —
                it may only restate what is in the library, with dates and sources.
              </>
            ) : (
              <>
                Answer engine: <strong>curated library</strong> — no external model is called, and nothing you type is
                stored. Set <code>OPENAI_API_KEY</code>, <code>ANTHROPIC_API_KEY</code>, <code>OPENROUTER_API_KEY</code>{' '}
                or <code>GROQ_API_KEY</code> to switch on model-written answers grounded in the same library.
              </>
            )}
          </span>
        </p>
      </header>
      <div style={{ paddingBottom: 46 }}>
        <GuideChat initialQuestion={params.q} />
      </div>
    </div>
  )
}
