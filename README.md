# Postman tools

Simple tools to generate local Postman files.

Useful for drag-and-drop updates when you don't have an API Key available to you.

## Roadmap

- [x] Generate environments
- [ ] Generate collections from Swagger files
- [ ] Initialize configuration file

## Getting started

```s
# Run help
$ npm i -D @okeeffed/postman-tools
$ npx @okeeffed/postman-tools --help
```

Setup a configuration file. Here is an example:

```ts
import type { PostmanEnvironmentConfiguration } from "@okeeffed/postman-tools";

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
```

Run a test to generate the environment configurations:

```s
$ npx @okeeffed/postman-tools env:generate

> @okeeffed/dmcs@0.0.18 dev /Users/dennis.okeeffe/code/okeeffed/postman-tools
> npx tsx src/main.ts "env:generate"

INFO Generating environment variables...
GENERATED .../exampleEnvironment.dev.env.json
GENERATED .../exampleEnvironment.stage.env.json
GENERATED .../exampleEnvironment.sandbox.env.json
GENERATED .../exampleEnvironment.prod.env.json
INFO Finished generating environment variables JSON files
```

## Repo todo

- [ ] Clean up repo configuration for build
- [ ] Set some standard generator files
