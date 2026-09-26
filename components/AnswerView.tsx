import type { Answer, AnswerBlock, Fact } from '@/lib/types'

function FactList({ facts }: { facts: Fact[] }) {
  if (!facts.length) return null
  return (
    <ul className="facts">
      {facts.map((f) => (
        <li key={f.id}>
          <span className="fact-claim">{f.claim}</span>
          {f.detail ? <span className="fact-claim"> {f.detail}</span> : null}
          <span className="fact-meta">
            Checked {f.asOf} ·{' '}
            <a href={f.source.url} target="_blank" rel="noreferrer noopener">
              {f.source.name}
            </a>
            {f.volatility === 'volatile' ? <span className="volatile"> · recently changing, re-check</span> : null}
            {f.volatility === 'annual' ? ' · set annually' : ''}
          </span>
        </li>
      ))}
    </ul>
  )
}

function Block({ block }: { block: AnswerBlock }) {
  const danger = block.emphasis === 'danger'
  const ok = block.emphasis === 'done'
  return (
    <section className={`block${danger ? ' block-danger' : ''}${ok ? ' block-ok' : ''}`}>
      <div className="block-head">
        <h3>{block.heading}</h3>
      </div>
      <div className="block-body">
        {block.body ? <p>{block.body}</p> : null}
        {block.bullets?.length ? (
          <ul>
            {block.bullets.map((b, i) => (
              <li key={i}>{renderLinks(b)}</li>
            ))}
          </ul>
        ) : null}
        {block.facts?.length ? <FactList facts={block.facts} /> : null}
        {block.citations?.length ? (
          <p className="tiny muted" style={{ marginTop: 8, marginBottom: 0 }}>
            Sources:{' '}
            {block.citations.map((c, i) => (
              <span key={c.url}>
                {i > 0 ? ' · ' : ''}
                <a href={c.url} target="_blank" rel="noreferrer noopener">
                  {c.label}
                </a>
                {c.asOf ? ` (${c.asOf})` : ''}
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </section>
  )
}

/** Turns bare https:// links in bullet text into clickable links. */
function renderLinks(text: string) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g)
  if (parts.length === 1) return text
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noreferrer noopener" style={{ wordBreak: 'break-all' }}>
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

export function AnswerView({ answer }: { answer: Answer }) {
  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <span className={`badge ${answer.confidence === 'high' ? 'badge-ok' : answer.confidence === 'medium' ? 'badge-brand' : 'badge-warn'}`}>
          {answer.confidence === 'none' ? 'No vetted answer' : `${answer.confidence} confidence`}
        </span>
        <span className="badge badge-neutral">
          {answer.engine === 'llm' ? (answer.model ?? 'LLM') : answer.engine === 'llm+grounded-fallback' ? 'curated fallback' : 'curated library'}
        </span>
        {answer.usedTopicIds.length > 0 ? (
          <span className="badge badge-neutral">
            {answer.usedTopicIds.length} library {answer.usedTopicIds.length === 1 ? 'topic' : 'topics'}
          </span>
        ) : null}
        {answer.isFallbackPlan ? <span className="badge badge-warn">search plan, not advice</span> : null}
      </div>

      {answer.blocks.map((b, i) => (
        <Block key={`${b.kind}-${i}`} block={b} />
      ))}

      <p className="tiny muted" style={{ marginTop: 12 }}>
        {answer.disclaimer}
      </p>
    </div>
  )
}
