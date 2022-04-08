export * from './route'
declare module 'koa' {
  interface DefaultState {
    user?: { username: string }
  }
}
