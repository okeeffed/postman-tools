// configLoader.ts
import { cosmiconfig } from "cosmiconfig";

import { PostmanEnvironmentConfigurationSchema } from "@/schema";
import type { PostmanEnvironmentConfiguration } from "@/types";
import { TypeScriptLoader } from "cosmiconfig-typescript-loader";

export async function loadConfig<T extends readonly string[]>(): Promise<
  PostmanEnvironmentConfiguration<T>
> {
  const explorer = cosmiconfig("postman", {
    loaders: {
      ".ts": TypeScriptLoader(),
    },
  });

  try {
    const result = await explorer.search();

    if (!result) {
      throw new Error("No configuration file found.");
    }

    // Ensure environments is an array
    const environments = result.config.environments;
    if (!Array.isArray(environments) || environments.length === 0) {
      throw new Error("No environments defined in configuration.");
    }

    // Infer environments as a tuple type
    const environmentsTyped = environments as unknown as T;

    // Create schema with inferred environment types
    const schemaParser =
      PostmanEnvironmentConfigurationSchema(environmentsTyped);
    const config = schemaParser.parse(result.config);

    return config as unknown as PostmanEnvironmentConfiguration<T>;
  } catch (error) {
    console.error("Error loading configuration:", error);
    throw error;
  }
}
