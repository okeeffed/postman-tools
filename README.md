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
import type { PostmanConfiguration } from "./src/types";

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
    spec: "openapi.json",
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
```

Run a test to generate the environment configurations:

```s
$ npx @okeeffed/postman-tools env:generate

INFO Generating environment variables...
GENERATED .../exampleEnvironment.dev.env.json
GENERATED .../exampleEnvironment.stage.env.json
GENERATED .../exampleEnvironment.sandbox.env.json
GENERATED .../exampleEnvironment.prod.env.json
INFO Finished generating environment variables JSON files
```

For generating a Postman collection.

```s
$ npx @okeeffed/postman-tools env:generate

INFO Generating Postman collection...
INFO Finished generating environment variables JSON files
```

## Repo todo

- [ ] Clean up repo configuration for build
- [ ] Set some standard generator files
- [ ] Automate releases with GitHub actions
