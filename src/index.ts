export * from './route'
export * from './errors'
declare module 'koa' {
  interface DefaultState {
    user?: { username: string }
  }
}
