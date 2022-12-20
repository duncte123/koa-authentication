import { type Context, type Next } from 'koa'
import { BadRequest } from 'http-errors'
import { AuthenticationError } from './errors'
import { sign, verify } from './jwt'
import type { SameSite } from './route'

export function createLocalStrategy(
  verify: (username: string, password: string) => Promise<boolean> | boolean,
) {
  return async(ctx: Context, next: Next) => {
    const body = ctx.request.body
    if (!body || !body.username || !body.password)
      throw new BadRequest('Bad Basic Auth')
    const { username, password } = body
    const verified = await verify(username, password)
    if (!verified)
      throw new AuthenticationError()
    ctx.state.user = { username }
    await next()
  }
}

export function createCookie(secret: () => string, sameSite?: SameSite) {
  return async(ctx: Context, next: Next) => {
    const token = sign(ctx.state.user!.username, secret())
    ctx.cookies.set('token', token, {
      expires: new Date(Date.now() + 100 * 86400 * 1000),
      httpOnly: true,
      sameSite,
      secure: sameSite === 'none',
    })
    await next()
  }
}

export function createAuthentication(secret: () => string) {
  return async(ctx: Context, next: Next) => {
    const token = ctx.cookies.get('token')
    if (!token)
      throw new AuthenticationError()
    const payload = verify(token, secret())
    if (!payload?.username)
      throw new AuthenticationError('Invalid Token')
    ctx.state.user = { username: payload.username }
    return next()
  }
}
