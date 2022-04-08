import { describe, expect, it } from 'vitest'
import { AuthenticationError } from '../src/errors'
import { sign, verify } from '../src/jwt'

describe('jwt', () => {
  const secret = 'secret'
  const username = 'admin'
  it('should sign and verify', () => {
    const token = sign(username, secret)
    const payload = verify(token, secret)
    expect(payload.username).toBe(username)
  })

  it('should throw error', () => {
    expect(() => verify('t', 's')).toThrowError(
      new AuthenticationError('Invalid Token'),
    )
  })
})
