import { Command } from "@commander-js/extra-typings";
import { readFile, writeFile } from "node:fs/promises";

import { loadConfig } from "@/config";
import type {
  PostmanCollection,
  PostmanCollectionConfiguration,
  PostmanItem,
} from "@/types";

import { logger } from "@/util/logger";
import path from "node:path";
import { ConvertResult, convert, Options } from "openapi-to-postmanv2";

export const collectionGenerate = new Command("collection:generate")
  .description(
    "Generates a Postman collection from an OpenAPI specification which configurable override"
  )
  .option("-o, --output <path>", "Output file path")
  .option("-s, --spec <path>", "Path to the OpenAPI specification")
  .action(async (options) => {
    const config = await loadConfig();

    logger.log("INFO", "Generating Postman collection...");

    const pathToSpec = options.spec ?? config.collection.spec;

    if (!pathToSpec) {
      logger.error("ERROR", "No OpenAPI specification provided");
      process.exit(1);
    }

    const openapiDataRaw: string = await readFile(
      path.join(process.cwd(), pathToSpec),
      "utf8"
    );

    const openapiData = JSON.parse(openapiDataRaw);

    const postmanConvertOptions: Options = {
      schemaFaker: false,
      includeAuthInfoInExample: true,
    };

    convert(
      { type: "string", data: JSON.stringify(openapiData) },
      postmanConvertOptions,
      async (err: unknown, result: ConvertResult) => {
        if (err) {
          console.error("Could not convert", err);
        } else {
          if (result.result) {
            const postmanCollection = result.output[0]
              .data as PostmanCollection;

            // Process the collection after conversion
            if (postmanCollection.item) {
              postmanCollection.item.forEach((item) =>
                addDefaultHeaders(item, config.collection)
              );
            }

            await writeFile(
              options.output ?? "postman.collection.json",
              JSON.stringify(postmanCollection, null, 2)
            );
          } else {
            logger.error("FAILED", result.reason);
          }
        }
      }
    );

    logger.log("INFO", "Finished generating environment variables JSON files");
  });

// Add default headers to all requests
const addDefaultHeaders = (
  item: PostmanItem,
  collection: PostmanCollectionConfiguration
) => {
  if (item.request && item.request.header) {
    // Check if header exists
    if (collection.headers) {
      const entries = Object.entries(collection.headers);

      for (const [key, value] of entries) {
        const header = item.request.header.find((h) => h.key === key);
        if (header) {
          header.value = value;
        } else {
          item.request.header.push({
            key,
            value,
          });
        }
      }
    }

    if (collection.auth) {
      // Set Bearer Token auth
      item.request.auth = collection.auth;
    }
  }

  // Recursively process nested items
  if (item.item && Array.isArray(item.item)) {
    item.item.forEach((item) => addDefaultHeaders(item, collection));
  }
};
