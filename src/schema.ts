import { z } from "zod";

// Define a Zod schema for EnvironmentValue
const EnvironmentValueSchema = z.object({
  key: z.string(),
  value: z.string(),
  type: z.enum(["default", "secret"]),
  enabled: z.literal(true), // Ensure enabled is always true
});

// Define a Zod schema for PostmanEnvironmentVariable
function PostmanEnvironmentVariableSchema<T extends readonly string[]>(
  environments: T
) {
  return z
    .object({
      key: z.string(),
      type: z.enum(["default", "secret"]),
      default: z.string(),
    })
    .extend(
      environments.reduce((acc, env) => {
        acc[env] = z.string().optional();
        return acc;
      }, {} as Record<string, z.ZodOptional<z.ZodString>>)
    );
}

// Define a Zod schema for PostmanEnvironmentFile
export const PostmanEnvironmentFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  values: z.array(EnvironmentValueSchema),
});

export function PostmanEnvironmentConfigurationSchema<
  T extends readonly string[]
>(environments: T) {
  // Map environments to an array of ZodLiteral<string>
  const environmentLiterals = environments.map((env) => z.literal(env));
  return z.object({
    name: z.string(),
    environments: z.tuple(
      environmentLiterals as [z.ZodLiteral<any>, ...z.ZodLiteral<any>[]]
    ), // Ensure environments match the provided array
    values: z.array(PostmanEnvironmentVariableSchema(environments)),
  });
}
