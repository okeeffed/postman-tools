export const SIMPLE_INIT = `import type { PostmanConfiguration } from "@okeeffed/postman-tools";

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
        dev: "dev-only-env-value",
        stage: "stage-only-env-value",
        sandbox: "sandbox-only-env-value",
        prod: "prod-only-env-value",
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
