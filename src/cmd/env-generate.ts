import { Command } from "@commander-js/extra-typings";
import { writeFile } from "node:fs/promises";

import { loadConfig } from "@/config";
import type {
  EnvironmentValue,
  PostmanEnvironmentFile,
  PostmanEnvironmentVariable,
} from "@/types";

import { camelCase } from "es-toolkit";
import { v4 } from "uuid";
import { logger } from "@/util/logger";
import path from "node:path";

export const envGenerate = new Command("env:generate")
  .description(
    "Generates a collection of Postman environments based on your configuration file"
  )
  // TODO: Support project overrides
  // .option("-p, --project <name>", "Project name")
  // TODO: Support custom configuration paths
  // .option("-c, --config <path>", "Path to the configuration file")
  // TODO: Support custom output path
  // .option("-c, --config <path>", "Path to the configuration file")
  .action(async (_options) => {
    const config = await loadConfig();

    logger.log("INFO", "Generating environment variables...");

    for (const environment of config.environments) {
      const environmentValues = config.values.map((envValues) =>
        generateVariableSetForEnvironment(environment, envValues)
      );

      const output: PostmanEnvironmentFile = {
        id: v4(),
        name: `${config.name} (${environment})`,
        values: environmentValues,
      };

      const filename = path.join(
        process.cwd(),
        `${camelCase(config.name)}.${environment}.env.json`
      );
      await writeFile(filename, JSON.stringify(output, null, 2));
      logger.log("GENERATED", filename);
    }

    logger.log("INFO", "Finished generating environment variables JSON files");
  });

/**
 * For arg types, we use "string" here to be more generic
 * than the actual type. We'll leave the type safety for the
 * configuration file.
 */
function generateVariableSetForEnvironment(
  env: string,
  envValues: PostmanEnvironmentVariable<string[]>
): EnvironmentValue {
  const defaultEnvValue = envValues.default;
  const envValue = envValues[env];

  if (envValue) {
    return {
      key: envValues.key,
      value: envValue,
      type: envValues.type,
      enabled: true,
    };
  }

  return {
    key: envValues.key,
    value: defaultEnvValue,
    type: envValues.type,
    enabled: true,
  };
}
