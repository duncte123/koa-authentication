import request from 'supertest'
import Koa from 'koa'
import bodyparser from 'koa-bodyparser'
import { describe, expect, it } from 'vitest'
import { createAuth } from '../src'

const { router, auth } = createAuth({
  sameSite: 'strict',
  verify: (username, password) => {
    return username === 'admin' && password === 'admin'
  },
  secret() {
    return 'secret'
  },
})

const app = new Koa()
app.use(bodyparser())
app.use(router.routes())
app.use(auth)
app.use(ctx => ctx.body = ({ msg: 'hi' }))

function getToken(cookie: string) {
  return cookie.match(/token=(.*?);/)?.[1]
}

describe('route', () => {
  const agent = request(app.callback())

  it('should work', async() => {
    const res1 = await agent
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' })
    expect(res1.status).toBe(200)
    const token = getToken(res1.headers['set-cookie'][0])
    expect(typeof token).toBe('string')
    expect(res1.headers['set-cookie'][0]).toContain('SameSite=Strict')

    const res2 = await agent
      .post('/auth/info')
      .set('Cookie', res1.headers['set-cookie'][0])
    expect(res2.body).toEqual({
      username: 'admin',
    })

    const res3 = await agent
      .post('/protected')
      .set('Cookie', res1.headers['set-cookie'][0])
    expect(res3.body).toEqual({ msg: 'hi' })
  })

  it('should fail', async() => {
    const res = await agent.post('/protected')
    expect(res.status).toBe(401)
  })
})
