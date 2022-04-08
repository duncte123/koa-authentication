import Router from '@koa/router'
import {
  createAuthentication,
  createCookie,
  createLocalStrategy,
} from './middlewares'

export interface AuthOption{
  verify(username: string, password: string): void
  secret(): string
}
export function createAuth({ verify, secret }: AuthOption) {
  const router = new Router()
  const local = createLocalStrategy(verify)
  const cookie = createCookie(secret)
  const auth = createAuthentication(secret)
  router.prefix('/auth')
  router.post('/login', local, cookie, ctx => (ctx.status = 200))
  router.post('/info', auth, (ctx) => {
    ctx.body = { username: ctx.state.user!.username }
    ctx.status = 200
  })
  router.use((ctx, next) => next())
  return { router, local, cookie, auth }
}
