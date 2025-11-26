import type { PostmanCollectionConfiguration } from "#types.ts";

/**
 * Represents a PostmanCollection entity.
 */
export class Collection {
  constructor(props: PostmanCollectionConfiguration) {
    Object.assign(this, props)
  }
}

export interface Collection extends PostmanCollectionConfiguration { }
