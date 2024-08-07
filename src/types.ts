// src/types/index.ts
import { z } from "zod";
import { authSchema } from "./postman-collection-schema";

export interface EnvironmentValue {
  key: string;
  value: string;
  type: "default" | "secret";
  enabled: true;
}

export type PostmanEnvironmentVariable<T extends readonly string[]> = {
  key: EnvironmentValue["key"];
  type: EnvironmentValue["type"];
  default: string;
} & {
  [K in T[number]]?: string;
};

export interface PostmanEnvironmentFile {
  id: string;
  name: string;
  values: Array<EnvironmentValue>;
}

export interface PostmanEnvironmentConfiguration<T extends readonly string[]> {
  name: string;
  /**
   * Variables to be generated for the environment
   */
  values: Array<PostmanEnvironmentVariable<T>>;
}

export interface PostmanCollectionConfiguration {
  /**
   * Path to the OpenAPI JSON specification
   */
  in: string;

  /**
   * Path out to the Postman collection
   */
  out: string;

  /**
   * Overrides for the collection headers
   */
  headers?: {
    [key: string]: string;
  };

  /**
   * Set a default auth option for the collection
   * TODO: This might have to support more alternatives in future
   */
  auth?: z.infer<typeof authSchema>;
}

export interface PostmanConfiguration<T extends readonly string[]> {
  /**
   * A collection of project environments
   */
  stages: T;
  environment: PostmanEnvironmentConfiguration<T>;
  collection:
    | PostmanCollectionConfiguration
    | Array<PostmanCollectionConfiguration>;
}

export interface PostmanItem {
  request?: {
    url?: {
      query?: Array<{
        key: string;
        value: string;
      }>;
    };
    header?: Array<{
      key: string;
      value: string;
    }>;
    auth?: z.infer<typeof authSchema>;
  };
  item?: PostmanItem[];
}

export interface PostmanCollection {
  item?: PostmanItem[];
}
