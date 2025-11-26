import { PostmanRequest } from '#types.ts';

type IRequest = Exclude<PostmanRequest, string | undefined>

/**
 * Represents a Postman event.
 */
export class Request {
  constructor(props: IRequest) {
    Object.assign(this, props)
  }
}

export interface Request extends IRequest { }
