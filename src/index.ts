export const one = 1
export const two = 2

declare module 'koa' {
  interface DefaultState {
    user?: { username: string }
  }
}
