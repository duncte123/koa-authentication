import JWT, { type JwtPayload } from 'jsonwebtoken'
import { AuthenticationError } from './errors'

export function sign(username: string, secret: string) {
  return JWT.sign({ username }, secret, { expiresIn: '100d' })
}

export function verify(token: string, secret: string) {
  try {
    return JWT.verify(token, secret) as JwtPayload & { username?: string }
  }
  catch (err) {
    throw new AuthenticationError('Invalid Token')
  }
}
