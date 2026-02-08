import crypto from 'crypto'

const signingSecret = process.env.WEBHOOK_SIGNING_SECRET || ''

export function signPayload(payload: string): string {
  if (!signingSecret) return ''
  return crypto
    .createHmac('sha256', signingSecret)
    .update(payload)
    .digest('hex')
}
