# Postman tools

Simple tools to generate local Postman files.

Useful for drag-and-drop updates when you don't have an API Key available to you.

## Roadmap

- [x] Generate environments
- [x] Generate collections from Swagger files
- [x] Initialize configuration file
- [ ] Support multi-environment configurations.
- [ ] Support more overrides.
- [ ] Support switching off query variables across all endpoints by default.
- [ ] Support scripts.

## Getting started

```s
# Run help
$ npm i -D @okeeffed/postman-tools
$ npx @okeeffed/postman-tools --help
```

Setup a configuration file.

```s
$ npx @okeeffed/postman-tools init
INFO Attempting to initialise
CREATED .../.postmanrc.ts
```

An example configuration:

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
        dev: "dev-only-env-value",
        stage: "stage-only-env-value",
        sandbox: "sandbox-only-env-value",
        prod: "prod-only-env-value",
      },
      {
        key: "secret",
        type: "secret",
        default: "this is a secret value",
      },
    ],
  },
  collection: [
    {
      in: "tmp/swagger-alt.json",
      out: "postman.collection.json",
      baseUrl: "{{URL}}",
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
  ],
} satisfies PostmanConfiguration<typeof stages>;
```

Run a test to generate the environment configurations:

```s
$ npx @okeeffed/postman-tools env:generate

INFO Generating environment variables...
GENERATED /.../exampleEnvironment.dev.env.json
GENERATED /.../exampleEnvironment.stage.env.json
GENERATED /.../exampleEnvironment.sandbox.env.json
GENERATED /.../exampleEnvironment.prod.env.json
INFO Finished generating environment variables JSON files
```

For generating a Postman collection.

```s
$ npx @okeeffed/postman-tools env:generate

INFO Generating Postman collection...
GENERATED postman.collection.json
```

## Configuration

There are three top-level configuration options:

| Options     | Does                                                              |
| ----------- | ----------------------------------------------------------------- |
| stages      | Defines the different stage environments you need to support      |
| environment | Object for defining different environment configurations          |
| collection  | Array of objects for supporting multiple OpenAPI spec input files |

Things to note:

- Define `stages` as a const e.g. `["dev"] as const` to get the type benefits within the configuration.
- `environment.values` object relies on the stages type. If you define `dev` as a stage, it will be available as a key for a "dev" environment value override.
- For `collection[number]`, you should define a different `in` and `out` file.

## Caveats

The override configurations (e.g. headers, auth) will apply **to all** endpoints.

I will consider making this more flexible (with likely breaking changes), but for now you are best configuring it with the overrides that are likely necessary for each endpoint.

## Repo todo

- [ ] Clean up repo configuration for build
- [ ] Set some standard generator files
- [ ] Automate releases with GitHub actions
