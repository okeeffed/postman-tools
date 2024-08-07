export const SIMPLE_INIT = `import type { PostmanConfiguration } from "./src/types";

const stages = ["dev", "stage", "sandbox", "prod"] as const;

export default {
  stages,
  environment: {
    name: "Example environment",
    values: [
      {
        key: "example",
        type: "default",
        default: "default",
        dev: "dev",
        stage: "stage",
        sandbox: "sandbox",
        prod: "prod 2",
      },
      {
        key: "secret",
        type: "secret",
        default: "this is a secret",
      },
    ],
  },
  collection: {
    in: "swagger.json",
    out: "postman.collection.json",
    headers: {
      "x-correlation-id": "{{$guid}}",
      "x-api-key": "{{API_KEY}}",
    },
    auth: {
      type: "bearer",
      bearer: [
        {
          key: "token",
          value: "{{BEARER_TOKEN}}",
          type: "string",
        },
      ],
    },
  },
} satisfies PostmanConfiguration<typeof stages>;
`;

export const CONFIG_FILENAME = `.postmanrc.ts`;
