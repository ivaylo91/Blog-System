import * as Sentry from '@sentry/node'

let initialized = false

export function initSentry() {
  if (initialized) return
  const dsn = process.env.SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0),
  })

  initialized = true
}

export function captureException(err: unknown, _ctx?: unknown) {
  if (!initialized) initSentry()
  if (initialized) {
    Sentry.captureException(err)
  } else {
    // fallback to console
    console.error(err)
  }
}

export default Sentry
