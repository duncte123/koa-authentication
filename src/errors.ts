import { Unauthorized } from 'http-errors'

export class AuthenticationError extends Unauthorized {
  constructor(msg = 'Authentication Error') {
    super(msg)
  }
}
