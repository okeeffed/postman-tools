import type { PostmanAuth } from "#types.ts";

/**
 * Abstraction for auth types.
 */
export class Auth {
  constructor(props: PostmanAuth) {
    Object.assign(this, props)
  }
}

export interface Auth extends PostmanAuth { }
