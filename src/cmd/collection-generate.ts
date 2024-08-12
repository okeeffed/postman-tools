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
    "Generates a Postman collection from an OpenAPI specification with configurable overrides"
  )
  .option("-o, --output <path>", "Output file path")
  .option("-s, --spec <path>", "Path to the OpenAPI specification")
  .action(async (options) => {
    const config = await loadConfig();

    logger.log("INFO", "Generating Postman collection...");

    const collections = Array.isArray(config.collection)
      ? config.collection
      : [config.collection];

    for (const collection of collections) {
      const pathToSpec = options.spec ?? collection.in;

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
                  addDefaultHeaders(item, collection)
                );

                // Apply overrides
                const { unmatchedOverrides, appliedOverrides } = applyOverrides(
                  postmanCollection.item,
                  collection.overrides
                );

                // Log applied overrides
                if (appliedOverrides.size > 0) {
                  logger.log(
                    "INFO",
                    `Applied the following overrides: ${Array.from(
                      appliedOverrides
                    ).join(", ")}`
                  );
                }

                // Log warning for unmatched overrides
                if (unmatchedOverrides.length > 0) {
                  logger.warn(
                    "WARNING",
                    `The following overrides did not match any existing items: ${unmatchedOverrides.join(
                      ", "
                    )}`
                  );
                }

                // Add additions
                if (collection.additions) {
                  logger.log(
                    "INFO",
                    `Adding additions: ${collection.additions
                      .map((a) => a.name)
                      .join(", ")}`
                  );
                  addAdditions(postmanCollection, collection.additions);
                }
              }

              const outfile = options.output ?? collection.out;
              await writeFile(
                outfile,
                JSON.stringify(postmanCollection, null, 2)
              );
              logger.log("GENERATED", outfile);
            } else {
              logger.error("FAILED", result.reason);
            }
          }
        }
      );
    }
  });

// Add default headers to all requests
const addDefaultHeaders = (
  item: PostmanItem,
  collection: PostmanCollectionConfiguration
) => {
  if (item.request) {
    if (item.request.header && collection.headers) {
      const entries = Object.entries(collection.headers);

      for (const [key, value] of entries) {
        const header = item.request.header.find(
          (h: Record<string, string>) => h.key === key
        );
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

    if (collection.baseUrl) {
      // Override the baseUrl host
      item.request.url = {
        ...item.request.url,
        host: [collection.baseUrl],
      };
    }
  }

  // Recursively process nested items
  if (item.item && Array.isArray(item.item)) {
    item.item.forEach((item: PostmanItem) =>
      addDefaultHeaders(item, collection)
    );
  }
};

function replaceOrMerge(target: any, source: any) {
  const replacementKeys = ["auth"]; // Add other keys here that should be replaced instead of merged

  for (const key in source) {
    if (replacementKeys.includes(key) && typeof source[key] === "object") {
      target[key] = JSON.parse(JSON.stringify(source[key])); // Deep clone to avoid reference issues
    } else if (typeof source[key] === "object" && source[key] !== null) {
      if (!(key in target)) {
        target[key] = Array.isArray(source[key]) ? [] : {};
      }
      replaceOrMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// Apply overrides recursively and return unmatched overrides
function applyOverrides(
  items: PostmanItem[],
  overrides: PostmanCollectionConfiguration["overrides"]
): {
  appliedOverrides: Set<string>;
  unmatchedOverrides: string[];
} {
  const appliedOverrides: Set<string> = new Set();
  const allOverrides: Set<string> = new Set();

  function applyOverridesRecursively(
    items: PostmanItem[],
    overrides: PostmanCollectionConfiguration["overrides"]
  ) {
    if (Array.isArray(overrides)) {
      overrides.forEach((override) => {
        allOverrides.add(override.name);
        const matchedItems = findItemsByName(items, override.name);
        if (matchedItems.length > 0) {
          matchedItems.forEach((item) => replaceOrMerge(item, override));
          appliedOverrides.add(override.name);
        }
      });
    } else if (typeof overrides === "object") {
      Object.entries(overrides).forEach(([name, override]) => {
        allOverrides.add(name);
        const matchedItems = findItemsByName(items, name);
        if (matchedItems.length > 0) {
          matchedItems.forEach((item) => replaceOrMerge(item, override));
          appliedOverrides.add(name);
        }
      });
    }

    // Recursively apply overrides to nested items
    items.forEach((item) => {
      if (item.item && Array.isArray(item.item)) {
        applyOverridesRecursively(item.item, overrides);
      }
    });
  }

  applyOverridesRecursively(items, overrides);

  // Calculate unmatched overrides
  const unmatchedOverrides = Array.from(allOverrides).filter(
    (name) => !appliedOverrides.has(name)
  );
  return { appliedOverrides, unmatchedOverrides };
}

// Helper function to find all items by name at any nesting level (unchanged)
function findItemsByName(items: PostmanItem[], name: string): PostmanItem[] {
  const matchedItems: PostmanItem[] = [];

  function searchRecursively(items: PostmanItem[]) {
    for (const item of items) {
      if (item.name === name) {
        matchedItems.push(item);
      }
      if (item.item && Array.isArray(item.item)) {
        searchRecursively(item.item);
      }
    }
  }

  searchRecursively(items);
  return matchedItems;
}

// Function to add additions
function addAdditions(
  collection: PostmanCollection,
  additions: PostmanCollectionConfiguration["additions"]
) {
  if (additions && additions.length > 0) {
    const additionsFolder: PostmanItem = {
      name: "Additions",
      item: additions,
    };
    collection.item.unshift(additionsFolder);
  }
}
