import type { PostmanEnvironmentConfiguration } from "./src/types";

const environments = ["dev", "stage", "sandbox", "prod"] as const;

export default {
  name: "Example environment",
  environments,
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
} satisfies PostmanEnvironmentConfiguration<typeof environments>;
