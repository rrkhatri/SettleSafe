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
    <div className="wrap section">
      <h1>Ask the guide</h1>
      <p className="small muted" style={{ maxWidth: 700 }}>
        Ask in your own words — simple English is fine, and you can paste the text of a letter or message you received.
        Answers are assembled from the SettleSafe library, and every factual claim shows the date it was checked and the
        official page it came from.
      </p>
      <p className="tiny muted" style={{ marginBottom: 20 }}>
        Answer engine: {provider.configured ? `${provider.label} (${provider.model}), restricted to our vetted facts` : 'curated library, no external model called'}.
        {provider.configured
          ? ' The model may only restate facts from our library, with their dates and sources; if the library does not cover your question it says so.'
          : ' Set OPENAI_API_KEY, ANTHROPIC_API_KEY, OPENROUTER_API_KEY or GROQ_API_KEY to switch on model-written answers grounded in the same library.'}
      </p>
      <GuideChat initialQuestion={params.q} />
    </div>
  )
}
