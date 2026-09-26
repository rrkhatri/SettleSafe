import { NextResponse } from 'next/server'
import { answerWithLlm, detectProvider } from '@/lib/llm'

export const runtime = 'nodejs'

type Body = { question?: string; stateCode?: string }

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const question = (body.question ?? '').trim()
  if (!question) return NextResponse.json({ error: 'Missing "question"' }, { status: 400 })
  if (question.length > 4000) return NextResponse.json({ error: 'Question is too long (4000 characters max)' }, { status: 413 })

  const provider = detectProvider()
  try {
    const answer = await answerWithLlm(question, { stateCode: body.stateCode })
    return NextResponse.json({ answer, provider: { id: provider.id, label: provider.label, model: provider.model } })
  } catch (error) {
    console.error('[settlesafe] /api/ask failed', error)
    return NextResponse.json({ error: 'Something went wrong answering that. Try again.' }, { status: 500 })
  }
}
