import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    // Log the report server-side. If Sentry is configured it will capture.
    try {
      const { captureException } = await import('@/lib/sentry')
      if (body) captureException(new Error('CSP report'), { body })
    } catch {
      // ignore if sentry not configured
      console.warn('CSP report received', body)
    }

    return NextResponse.json({ status: 'ok' })
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}
