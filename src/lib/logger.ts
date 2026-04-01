import { captureException } from './sentry'

export const logger = {
  info: (...args: unknown[]) => {
    console.log('[INFO]', ...args)
  },
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args)
  },
  error: (err: unknown, ...args: unknown[]) => {
    console.error('[ERROR]', err, ...args)
    try {
      captureException(err)
    } catch {
      // ignore
    }
  },
}

export default logger
