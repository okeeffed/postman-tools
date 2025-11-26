import { PostmanEvent } from '#types.ts';


/**
 * Represents a Postman event.
 */
export class Event {
  constructor(props: PostmanEvent) {
    Object.assign(this, props)
  }
}

export interface Event extends PostmanEvent { }
