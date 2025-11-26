import type { PostmanConfiguration } from "./src/types";
import { Auth } from './src/constructs/auth.ts'
import { Request } from './src/constructs/request.ts'
import { Environment } from './src/constructs/environment.ts'

const stages = ["dev", "stage", "sandbox", "prod"] as const;

export default {
  stages,
  environment: new Environment<typeof stages>({
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
  }),
  collection: [
    {
      in: "tmp/swagger-alt.json",
      out: "postman.collection.json",
      baseUrl: "{{URL}}",
      headers: {
        "x-correlation-id": "{{$guid}}",
        "x-api-key": "{{API_KEY}}",
      },
      auth: new Auth({
        type: "bearer",
        bearer: [
          {
            key: "token",
            value: "{{BEARER_TOKEN}}",
            type: "string",
          },
        ],
      }),
      overrides: [
        new Request({
          name: "Get Health",
          request: {
            auth: {
              type: "noauth",
            },
          },
        }),
        new Request({
          name: "Passwords File Sent",
          request: {
            auth: {
              type: "noauth",
            },
          },
        }),
      ],
      additions: [
        new Request({
          name: "v2/token",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "var jsonData = pm.response.json();",
                  'pm.environment.set("ping_token", jsonData.access_token);',
                  'pm.environment.set("refresh_token", jsonData.refresh_token);',
                ],
                type: "text/javascript",
              },
            },
          ],
          request: {
            auth: {
              type: "basic",
            },
            method: "POST",
            header: [
              {
                key: "Authorization",
                value: "{{BASIC_AUTH}}",
                type: "text",
              },
            ],
            url: {
              raw: "{{URL}}/v2/token",
              host: ["{{URL}}"],
              path: ["v2", "token"],
            },
          },
          response: [],
        }),
        new Request({
          name: "Refresh Token",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "var jsonData = pm.response.json();",
                  'pm.environment.set("ping_token", jsonData.access_token);',
                ],
                type: "text/javascript",
              },
            },
          ],
          request: {
            auth: {
              type: "noauth",
            },
            method: "POST",
            header: [],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                refresh_token: "{{refresh_token}}",
              }),
              options: {
                raw: {
                  language: "json",
                },
              },
            },
            url: {
              raw: "{{URL}}/v2/token/refresh",
              host: ["{{URL}}"],
              path: ["v2", "token", "refresh"],
            },
          },
          response: [],
        }),
      ],
    },
  ],
} satisfies PostmanConfiguration<typeof stages>;
