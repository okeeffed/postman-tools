// src/schemas/postmanSchemas.ts
// Based on some JSON schema definitions
// @see https://schema.postman.com/collection/json/v2.1.0/draft-07/collection.json

import { z } from "zod";

// Helper function to create a description schema
export const descriptionSchema = z.union([
  z.object({
    content: z.string(),
    type: z.string().optional(),
    version: z.any().optional(),
  }),
  z.string(),
  z.null(),
]);

// Auth Attribute Schema
export const authAttributeSchema = z.object({
  key: z.string(),
  value: z.any().optional(),
  type: z.string().optional(),
});

// Auth Schema
export const authSchema = z.object({
  type: z.enum([
    "apikey",
    "awsv4",
    "basic",
    "bearer",
    "digest",
    "edgegrid",
    "hawk",
    "noauth",
    "oauth1",
    "oauth2",
    "ntlm",
  ]),
  noauth: z.any().optional(),
  apikey: z.array(authAttributeSchema).optional(),
  awsv4: z.array(authAttributeSchema).optional(),
  basic: z.array(authAttributeSchema).optional(),
  bearer: z.array(authAttributeSchema).optional(),
  digest: z.array(authAttributeSchema).optional(),
  edgegrid: z.array(authAttributeSchema).optional(),
  hawk: z.array(authAttributeSchema).optional(),
  ntlm: z.array(authAttributeSchema).optional(),
  oauth1: z.array(authAttributeSchema).optional(),
  oauth2: z.array(authAttributeSchema).optional(),
});

// URL Schema
export const urlSchema = z.union([
  z.object({
    raw: z.string().optional(),
    protocol: z.string().optional(),
    host: z.union([z.string(), z.array(z.string())]).optional(),
    path: z
      .union([
        z.string(),
        z.array(
          z.union([
            z.string(),
            z.object({
              type: z.string(),
              value: z.string(),
            }),
          ])
        ),
      ])
      .optional(),
    port: z.string().optional(),
    query: z
      .array(
        z.object({
          key: z.string().nullable(),
          value: z.string().nullable(),
          disabled: z.boolean().optional(),
          description: descriptionSchema.optional(),
        })
      )
      .optional(),
    hash: z.string().optional(),
    variable: z.array(z.lazy(() => variableSchema)).optional(),
  }),
  z.string(),
]);

// Header Schema
export const headerSchema = z.object({
  key: z.string(),
  value: z.string(),
  disabled: z.boolean().optional(),
  description: descriptionSchema.optional(),
});

// Request Body Schema
export const requestBodySchema = z.object({
  mode: z.enum(["raw", "urlencoded", "formdata", "file", "graphql"]).optional(),
  raw: z.string().optional(),
  graphql: z.object({}).optional(),
  urlencoded: z
    .array(
      z.object({
        key: z.string(),
        value: z.string().optional(),
        disabled: z.boolean().optional(),
        description: descriptionSchema.optional(),
      })
    )
    .optional(),
  formdata: z
    .array(
      z.union([
        z.object({
          key: z.string(),
          value: z.string().optional(),
          disabled: z.boolean().optional(),
          type: z.literal("text"),
          contentType: z.string().optional(),
          description: descriptionSchema.optional(),
        }),
        z.object({
          key: z.string(),
          src: z.union([z.array(z.unknown()), z.string(), z.null()]).optional(),
          disabled: z.boolean().optional(),
          type: z.literal("file"),
          contentType: z.string().optional(),
          description: descriptionSchema.optional(),
        }),
      ])
    )
    .optional(),
  file: z
    .object({
      src: z.union([z.string(), z.null()]).optional(),
      content: z.string().optional(),
    })
    .optional(),
  options: z.object({}).optional(),
  disabled: z.boolean().optional(),
});

// Request Schema
export const requestSchema = z.union([
  z.object({
    url: urlSchema.optional(),
    auth: authSchema.nullable().optional(),
    proxy: z.any().optional(),
    certificate: z.any().optional(),
    method: z.string().optional(),
    description: descriptionSchema.optional(),
    header: z.union([z.array(headerSchema), z.string()]).optional(),
    body: requestBodySchema.nullable().optional(),
  }),
  z.string(),
]);

// Response Schema
export const responseSchema = z.object({
  id: z.string().optional(),
  originalRequest: requestSchema.optional(),
  responseTime: z.union([z.null(), z.string(), z.number()]).optional(),
  timings: z.union([z.object({}), z.null()]).optional(),
  header: z
    .union([
      z.array(z.union([headerSchema, z.string()])),
      z.string().nullable(),
    ])
    .optional(),
  cookie: z.array(z.any()).optional(),
  body: z.union([z.null(), z.string()]).optional(),
  status: z.string().optional(),
  code: z.number().optional(),
});

// Event Schema
export const eventSchema = z.object({
  id: z.string().optional(),
  listen: z.string(),
  script: z.any().optional(),
  disabled: z.boolean().optional(),
});

// Variable Schema
export const variableSchema = z
  .object({
    id: z.string().optional(),
    key: z.string().optional(),
    value: z.any().optional(),
    type: z.enum(["string", "boolean", "any", "number"]).optional(),
    name: z.string().optional(),
    description: descriptionSchema.optional(),
    system: z.boolean().optional(),
    disabled: z.boolean().optional(),
  })
  .refine((data) => data.id !== undefined || data.key !== undefined, {
    message: "Either 'id' or 'key' must be defined",
  });

// Item Schema
export const itemSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    description: descriptionSchema.optional(),
    variable: z.array(variableSchema).optional(),
    event: z.array(eventSchema).optional(),
    request: requestSchema,
    response: z.array(responseSchema).optional(),
    protocolProfileBehavior: z.record(z.any()).optional(),
  })
);

// Item Group Schema
export const itemGroupSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    name: z.string().optional(),
    description: descriptionSchema.optional(),
    variable: z.array(variableSchema).optional(),
    item: z.array(z.union([itemSchema, itemGroupSchema])),
    event: z.array(eventSchema).optional(),
    auth: authSchema.nullable().optional(),
    protocolProfileBehavior: z.record(z.any()).optional(),
  })
);

// Info Schema
export const infoSchema = z.object({
  name: z.string(),
  _postman_id: z.string().optional(),
  description: descriptionSchema.optional(),
  version: z
    .union([
      z.object({
        major: z.number(),
        minor: z.number(),
        patch: z.number(),
        identifier: z.string().optional(),
        meta: z.any().optional(),
      }),
      z.string(),
    ])
    .optional(),
  schema: z.string(),
});

// Collection Schema
export const collectionSchema = z.object({
  info: infoSchema,
  item: z.array(z.union([itemSchema, itemGroupSchema])),
  event: z.array(eventSchema).optional(),
  variable: z.array(variableSchema).optional(),
  auth: authSchema.nullable().optional(),
  protocolProfileBehavior: z.record(z.any()).optional(),
});
