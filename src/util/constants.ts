export const SIMPLE_INIT = `import type { PostmanEnvironmentConfiguration } from "@okeeffed/postman-tools";

const environments = ["dev"] as const;

export default {
  name: "Example environment",
  environments,
  values: [
    {
      key: "example",
      type: "default",
      default: "default",
      dev: "dev",
    },
    {
      key: "secret",
      type: "secret",
      default: "this is a secret",
    },
  ],
} satisfies PostmanEnvironmentConfiguration<typeof environments>;
`;

export const CONFIG_FILENAME = `.postmanrc.ts`;
