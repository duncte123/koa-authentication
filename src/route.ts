import Router from '@koa/router'
import type { Context, Next } from 'koa'
import {
  createAuthentication,
  createCookie,
  createLocalStrategy,
} from './middlewares'

export type SameSite = 'lax' | 'strict' | 'none'

export interface AuthOption {
  sameSite?: SameSite
  /**
   * Verify a basic auth
   * @param username username
   * @param password password
   * @returns is verified or not
   */
  verify(username: string, password: string): Promise<boolean> | boolean
  /**
   * Get jwt secret
   */
  secret(): string
}

export function createAuth({ verify, secret, sameSite }: AuthOption) {
  /**
   * Router to provide `/login` and `/info` route
   */
  const router = new Router()
  /**
   * Middleware to auth with basic auth
   */
  const local = createLocalStrategy(verify)
  /**
   * Middleware to set cookie from ctx.state.user
   */
  const cookie = createCookie(secret, sameSite)
  /**
   * Middleware to auth
   */
  const auth = createAuthentication(secret)
  router.prefix('/auth')
  router.post('/login', local, cookie, (ctx: Context) => (ctx.status = 200))
  router.post('/info', auth, (ctx: Context) => {
    ctx.body = { username: ctx.state.user!.username }
    ctx.status = 200
  })
  router.use((ctx: Context, next: Next) => next())
  return {
    /**
     * Router to provide `/login` and `/info` route
     */
    router,
    /**
     * Middleware to auth with basic auth
     */
    local,
    /**
     * Middleware to set cookie from ctx.state.user
     */
    cookie,
    /**
     * Middleware to auth
     */
    auth,
  }
}
