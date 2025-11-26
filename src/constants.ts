import { Auth } from "#constructs/auth.ts"
import { Event } from "#constructs/event.ts"

export const NO_AUTH = new Auth({
  type: 'noauth'
})

export const BEARER_AUTH = new Auth({
  type: 'bearer',
  bearer: [
    {
      key: "token",
      value: "{{BEARER_TOKEN}}",
      type: "string",
    },
  ]
})

export const BASIC_AUTH = new Auth({
  type: 'basic',
  basic: [
    { key: 'username', value: '{{USERNAME}}', type: 'string' },
    { key: 'password', value: '{{PASSWORD}}', type: 'string' }
  ]
});

// Status code validation
export const SET_OIDC_TOKENS = new Event({
  listen: 'test',
  script: {
    exec: [
      "var jsonData = pm.response.json();",
      'pm.environment.set("ACCESS_TOKEN", jsonData.access_token);',
      'pm.environment.set("REFRESH_TOKEN", jsonData.refresh_token);',
      'pm.environment.set("ID_TOKEN", jsonData.id_token);'
    ],
    type: 'text/javascript'
  }
});

// Status code validation
export const TEST_STATUS_200 = new Event({
  listen: 'test',
  script: {
    exec: ['pm.test("Status code is 200", function () {', 'pm.response.to.have.status(200); ', '}); '],
    type: 'text/javascript'
  }
});

// Response time check
export const TEST_RESPONSE_TIME = new Event({
  listen: 'test',
  script: {
    exec: ['pm.test("Response time is less than 500ms", function () {', 'pm.expect(pm.response.responseTime).to.be.below(500); ', '}); '],
    type: 'text/javascript'
  }
});
