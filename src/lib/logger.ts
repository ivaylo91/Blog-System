import { captureException } from './sentry'

export const logger = {
  info: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.log('[INFO]', ...args)
  },
  warn: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn('[WARN]', ...args)
  },
  error: (err: unknown, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error('[ERROR]', err, ...args)
    try {
      captureException(err)
    } catch (e) {
      // ignore
    }
  },
}

export default logger
