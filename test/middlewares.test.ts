import { type Context } from 'koa'
import { describe, expect, it, vi } from 'vitest'
import { AuthenticationError } from '../src/errors'
import { createLocalStrategy } from '../src/middlewares'

function createMock(username: string, password: string) {
  const ctx = {
    request: {
      body: {
        username,
        password,
      },
    },
    state: {},
  } as any as Context
  const next = async() => {}
  return { ctx, next }
}

function verify(username: string, password: string) {
  if (username !== 'admin' || password !== 'admin')
    throw new Error('info mismatch')
}

describe('local strategy', () => {
  it('should work', async() => {
    const fn = vi.fn(verify)
    const m = createLocalStrategy(fn)
    const { ctx, next } = createMock('admin', 'admin')
    await m(ctx, next)
    expect(fn).toBeCalledWith('admin', 'admin')
    expect(ctx.state.user).toEqual({ username: 'admin' })
  })

  it('should throw error', async() => {
    const { ctx, next } = createMock('admin', 'admin2')
    const m = createLocalStrategy(verify)
    expect(() => m(ctx, next)).rejects.toEqual(new AuthenticationError())
  })
})
