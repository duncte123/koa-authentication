import { type Context } from 'koa'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthenticationError } from '../src/errors'
import { sign } from '../src/jwt'
import { createAuthentication, createCookie, createLocalStrategy } from '../src/middlewares'

describe('local strategy', () => {
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
    const next = vi.fn(async() => {})
    return { ctx, next }
  }

  function verify(username: string, password: string) {
    return username === 'admin' && password === 'admin'
  }

  it('should work', async() => {
    const fn = vi.fn(verify)
    const m = createLocalStrategy(fn)
    const { ctx, next } = createMock('admin', 'admin')
    await m(ctx, next)
    expect(next).toBeCalled()
    expect(fn).toBeCalledWith('admin', 'admin')
    expect(ctx.state.user).toEqual({ username: 'admin' })
  })

  it('should throw error', async() => {
    const { ctx, next } = createMock('admin', 'admin2')
    const m = createLocalStrategy(verify)
    await expect(() => m(ctx, next)).rejects.toEqual(new AuthenticationError())
  })
})

describe('cookie', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })
  const set = vi.fn()
  function createMock() {
    const ctx = {
      state: {
        user: {
          username: 'admin',
        },
      },
      cookies: {
        set,
      },
    } as any as Context
    const next = vi.fn(async() => {})
    return { ctx, next }
  }
  it('should set cookie', async() => {
    const date = new Date(2000, 1, 1, 13)
    vi.setSystemTime(date)
    const token = sign('admin', 'secret')
    const m = createCookie(() => 'secret')
    const { ctx, next } = createMock()
    await m(ctx, next)
    expect(next).toBeCalled()
    expect(set).toBeCalledWith('token', token, {
      expires: new Date(Date.now() + 100 * 86400 * 1000),
      httpOnly: false,
    })
  })
})

describe('auth', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })
  function createMock(token: string) {
    const get = vi.fn(() => token)
    const ctx = {
      state: {
        user: {
          username: 'admin',
        },
      },
      cookies: {
        get,
      },
    } as any as Context
    const next = vi.fn(async() => {})
    return { ctx, next, get }
  }

  it('should work', async() => {
    const date = new Date(2000, 1, 1, 13)
    vi.setSystemTime(date)
    const m = createAuthentication(() => 'secret')
    const token = sign('admin', 'secret')
    const { ctx, next, get } = createMock(token)
    await m(ctx, next)
    expect(next).toBeCalled()
    expect(get).toBeCalledWith('token')
    expect(ctx.state.user).toEqual({ username: 'admin' })
  })

  it('should throw error', async() => {
    const date = new Date(2000, 1, 1, 13)
    vi.setSystemTime(date)
    const m = createAuthentication(() => 'secret')
    const { ctx, next, get } = createMock('token')
    await expect(() => m(ctx, next)).rejects.toEqual(
      new AuthenticationError('Invalid Token'),
    )
    expect(get).toBeCalledWith('token')
  })
})
