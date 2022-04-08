import { type Context, type Next } from 'koa'
import { BadRequest } from 'http-errors'
import { AuthenticationError } from './errors'
import { sign, verify } from './jwt'

export function createLocalStrategy(
  verify: (username: string, password: string) => Promise<void> | void,
) {
  return async(ctx: Context, next: Next) => {
    // @ts-expect-error body should support by koa-bodyparser
    const body = ctx.request.body
    if (!body || !body.username || !body.password)
      throw new BadRequest('Bad Basic Auth')
    const { username, password } = body
    try {
      await verify(username, password)
    }
    catch (err) {
      throw new AuthenticationError()
    }
    ctx.state.user = { username }
    await next()
  }
}

export function createCookie(secret: () => string) {
  return async(ctx: Context, next: Next) => {
    const token = sign(ctx.state.user!.username, secret())
    ctx.cookies.set('token', token)
    await next()
  }
}

export function createAuthentication(secret: () => string) {
  return async(ctx: Context, next: Next) => {
    const token = ctx.cookies.get('token')
    if (!token)
      throw new AuthenticationError()
    try {
      const payload = verify(token, secret())
      if (!payload?.username)
        throw new AuthenticationError('Invalid Token')
      ctx.state.user = { username: payload.username }
    }
    catch (err) {
      throw new AuthenticationError('Invalid Token')
    }
    return next()
  }
}
