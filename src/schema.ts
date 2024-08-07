import { z } from "zod";
import { PostmanItem } from "@/types";
import { authSchema } from "./postman-collection-schema";

// Define and export the EnvironmentValue schema
export const EnvironmentValueSchema = z.object({
  key: z.string(),
  value: z.string(),
  type: z.enum(["default", "secret"]),
  enabled: z.literal(true),
});

// Define and export the PostmanEnvironmentVariable schema
export function PostmanEnvironmentVariableSchema<T extends readonly string[]>(
  stages: T
) {
  return z.object({
    key: EnvironmentValueSchema.shape.key,
    type: EnvironmentValueSchema.shape.type,
    default: z.string(),
    ...Object.fromEntries(
      stages.map((stage) => [stage, z.string().optional()])
    ),
  });
}

// Define and export the PostmanEnvironmentFile schema
export const PostmanEnvironmentFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  values: z.array(EnvironmentValueSchema),
});

// Define and export the PostmanEnvironmentConfiguration schema
export function PostmanEnvironmentConfigurationSchema<
  T extends readonly string[]
>(stages: T) {
  return z.object({
    name: z.string(),
    values: z.array(PostmanEnvironmentVariableSchema(stages)),
  });
}

// Define and export the PostmanCollectionConfiguration schema
export const PostmanCollectionConfigurationSchema = z.object({
  in: z.string(),
  out: z.string(),
  headers: z.record(z.string()).optional(),
  auth: authSchema.optional(),
});

// Define and export the PostmanConfiguration schema
export function PostmanConfigurationSchema<T extends readonly string[]>(
  stages: T
) {
  return z.object({
    stages: z.array(z.string()).refine(
      (array) => {
        return array.every((stage) => stages.includes(stage));
      },
      {
        message: "Stage must be one of the predefined stages",
      }
    ),
    environment: PostmanEnvironmentConfigurationSchema(stages),
    collection: PostmanCollectionConfigurationSchema.or(
      z.array(PostmanCollectionConfigurationSchema)
    ),
  });
}

// Define and export the PostmanItem schema
export const PostmanItemSchema: z.ZodType<PostmanItem> = z.lazy(() =>
  z.object({
    request: z
      .object({
        url: z
          .object({
            query: z
              .array(
                z.object({
                  key: z.string(),
                  value: z.string(),
                })
              )
              .optional(),
          })
          .optional(),
        header: z
          .array(
            z.object({
              key: z.string(),
              value: z.string(),
            })
          )
          .optional(),
        auth: authSchema.optional(),
      })
      .optional(),
    item: z.array(PostmanItemSchema).optional(),
  })
);

// Define and export the PostmanCollection schema
export const PostmanCollectionSchema = z.object({
  item: z.array(PostmanItemSchema).optional(),
});
