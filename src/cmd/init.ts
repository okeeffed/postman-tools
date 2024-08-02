import { Command } from "@commander-js/extra-typings";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import process from "node:process";
import { logger } from "@/util/logger";
import { pathFromCwd } from "@/util/fs";
import { CONFIG_FILENAME, SIMPLE_INIT } from "@/util/constants";

export const init = new Command("init")
  .description("Initialise the Postman configuration file")
  // .option("-p, --project <name>", "Project name")
  .option("-e, --env <name>", "Name of the environment")
  .option("-f, --force", "Force initialisation")
  .option(
    "-c, --config <path>",
    "Path to the configuration file (defaults to .postmanrc.ts)",
    CONFIG_FILENAME
  )
  .action(async (options) => {
    logger.log("INFO", "Attempting to initialise");
    const configFilePath = pathFromCwd(options.config);

    if (existsSync(configFilePath) && !options.force) {
      logger.error("ERROR", "Already initialised");
      process.exit(1);
    }

    // Create initial configuration file
    if (!existsSync(configFilePath)) {
      await writeFile(configFilePath, SIMPLE_INIT);
    }

    logger.log("CREATED", configFilePath);
  });
