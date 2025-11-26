import type { PostmanItem } from "#types.ts";

/**
 * Represents a entry into a Postman collection.
 */
export class CollectionItem {
  constructor(props: PostmanItem) {
    Object.assign(this, props)
  }
}

export interface CollectionItem extends PostmanItem { }
