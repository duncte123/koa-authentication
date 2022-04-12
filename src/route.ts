import Router from '@koa/router'
import {
  createAuthentication,
  createCookie,
  createLocalStrategy,
} from './middlewares'

export interface AuthOption {
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

export function createAuth({ verify, secret }: AuthOption) {
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
  const cookie = createCookie(secret)
  /**
   * Middleware to auth
   */
  const auth = createAuthentication(secret)
  router.prefix('/auth')
  router.post('/login', local, cookie, ctx => (ctx.status = 200))
  router.post('/info', auth, (ctx) => {
    ctx.body = { username: ctx.state.user!.username }
    ctx.status = 200
  })
  router.use((ctx, next) => next())
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
