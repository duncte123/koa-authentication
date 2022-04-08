import { type Context, type Next } from 'koa'
import { BadRequest } from 'http-errors'
import { AuthenticationError } from './errors'
import { sign } from './jwt'

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
