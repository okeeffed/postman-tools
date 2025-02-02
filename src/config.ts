// configLoader.ts
import { cosmiconfig } from "cosmiconfig";

import { PostmanConfigurationSchema } from "@/schema";
import type { PostmanConfiguration } from "@/types";
import { TypeScriptLoader } from "cosmiconfig-typescript-loader";
import { logger } from "@/util/logger";

export async function loadConfig<T extends readonly string[]>(): Promise<
  PostmanConfiguration<T>
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
    const environments = result.config.stages;
    if (!Array.isArray(environments) || environments.length === 0) {
      throw new Error("No environments defined in configuration.");
    }

    // Infer environments as a tuple type
    const environmentsTyped = environments as unknown as T;

    // Create schema with inferred environment types
    const schemaParser = PostmanConfigurationSchema(environmentsTyped);
    const config = schemaParser.safeParse(result.config);

    if (!config.success) {
      for (const issue of config.error.issues) {
        logger.error("ISSUE", issue.message);
      }

      logger.error("FATAL", "Invalid configuration file.");
      process.exit(1);
    }

    return config.data as unknown as PostmanConfiguration<T>;
  } catch (error) {
    console.error("Error loading configuration:", error);
    throw error;
  }
}
