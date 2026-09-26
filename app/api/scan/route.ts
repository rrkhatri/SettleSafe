import { NextResponse } from 'next/server'
import { scanText } from '@/lib/engine'

export const runtime = 'nodejs'

type Body = { text?: string }

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const text = (body.text ?? '').trim()
  if (text.length < 15) {
    return NextResponse.json({ error: 'Paste a bit more text — at least a sentence or two.' }, { status: 400 })
  }
  if (text.length > 12000) {
    return NextResponse.json({ error: 'That is too long to scan (12,000 characters max). Paste the most important part.' }, { status: 413 })
  }

  const verdict = scanText(text)
  return NextResponse.json({ verdict })
}
