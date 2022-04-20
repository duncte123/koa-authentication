# @winwin/koa-authentication

[![NPM version](https://img.shields.io/npm/v/@winwin/koa-authentication)](https://www.npmjs.com/package/@winwin/koa-authentication)

Dead simple koa authentication middleware.

## Why

For many time when I want to build a tiny site with authentication support, I have to config the whole [passport.js](https://github.com/jaredhanson/passport) thing:

- [koa-passport](https://github.com/rkusa/koa-passport): support authentication
- [passport-local](https://www.passportjs.org/packages/passport-local/): support basic auth
- [passport-cookie](https://www.passportjs.org/packages/passport-cookie/): support auth with cookie

It is a great lib for authentication, but not when the scenario is simple, especially for the tiny site that only need a very basic authentication. So I build my own lib, which can provide authentication in a few lines.

## Install

```bash
pnpm install @winwin/koa-authentication
# use pnpm please.
```

## Usage

```ts
// 1. create
import { createAuth } from '@winwin/koa-authentication'
export const auth = createAuth({
  verify(username, password) {
    // return username === env.USERNAME && password === env.PASSWORD
    // if the authentication is valid return `true`, otherwise `false`
  },
  secret() {
    return env.SECRET
  },
})

// 2. mount login and info routes
app.use(auth.router.routes())

// 3. protect your routes
app.use(auth.auth)
// or
router.post('/some/protect/routes', auth.auth /* then your middleware */)

// 4. read user info
app.use((ctx) => {
  console.log(ctx.state.user.username)
})
```

## Routes

- `/auth/login`: `POST` with `{ username: "username", password: "password" }` in body will set cookie to `token`.
- `/auth/info`: `POST` will get `{ username: "username" }` in body with status code `200` will automatically auth with token in cookie.

## API

```ts
interface AuthOption {
  /**
   * Verify a basic auth
   * @returns is verified or not
   */
  verify(username: string, password: string): Promise<boolean> | boolean
  /**
   * Get jwt secret
   */
  secret(): string
}
```

## More

The `auth` instance also provide three middleware to implement your own router:

- `auth.local`: authenticate and set username to `ctx.state.user.username`.
- `auth.cookie`: generate token with username from `ctx.state.user.username`, then set token to cookie.
- `auth.auth`: verify token and set username to `ctx.state.user.username`.

## Example

<https://github.com/gethexon/hexon/>

## License

[MIT](./LICENSE)
