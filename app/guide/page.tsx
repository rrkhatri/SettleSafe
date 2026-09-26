import { GuideChat } from '@/components/GuideChat'
import { detectProvider } from '@/lib/llm'
import { Icon } from '@/components/Icon'

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
      <section className="hero-banner compact" style={{ marginTop: 24 }}>
        <div className="hero-head-row">
          <div style={{ maxWidth: '62ch' }}>
            <span className="hero-pill">
              <Icon name="chat" className="icon-sm" />
              Ask
            </span>
            <h1 style={{ marginTop: 12 }}>Ask the guide</h1>
            <p className="lede">
              Ask in your own words — simple English is fine, and you can paste the text of a letter or message you
              received. Answers are assembled from the SettleSafe library, and every factual claim shows the date it was
              checked and the official page it came from.
            </p>
          </div>
          <div className="hero-side">
            <span className="hero-side-icon">
              <Icon name={provider.configured ? 'sparkle' : 'lock'} className="icon-lg" />
            </span>
            <div>
              <p className="hero-side-label">Answer engine</p>
              <p className="hero-side-value">
                {provider.configured ? `${provider.label} · library-restricted` : 'Curated library · no external model'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ marginTop: 16 }}>
        <p className="status-strip">
          <span className={provider.configured ? 'status-dot' : 'status-dot status-dot-off'} aria-hidden="true" />
          <span>
            {provider.configured ? (
              <>
                The model may only restate facts from our library, with their dates and sources. If the library does not
                cover your question, it says so.
              </>
            ) : (
              <>
                Nothing you type is stored, and no external model is called. Set <code>OPENAI_API_KEY</code>,{' '}
                <code>ANTHROPIC_API_KEY</code>, <code>OPENROUTER_API_KEY</code> or <code>GROQ_API_KEY</code> to switch on
                model-written answers grounded in the same library.
              </>
            )}
          </span>
        </p>
      </div>

      <div style={{ paddingBottom: 34, marginTop: 20 }}>
        <GuideChat initialQuestion={params.q} />
      </div>
    </div>
  )
}
