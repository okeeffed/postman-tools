import { PostmanResponse } from '#types.ts';

/**
 * Represents a Postman event.
 */
export class Response {
  constructor(props: PostmanResponse) {
    Object.assign(this, props)
  }
}

export interface Response extends PostmanResponse { }
