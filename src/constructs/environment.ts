/**
 * Represents a Postman environment.
 */
export class Environment<T extends readonly string[]> {
  name: string;
  values: Array<{
    key: string;
    type: "default" | "secret";
    default: string;
  } & { [K in T[number]]?: string }>


  constructor(config: {
    name: string;
    values: Array<{
      key: string;
      type: "default" | "secret";
      default: string;
    } & { [K in T[number]]?: string }>;
  }) {
    this.name = config.name
    this.values = config.values
  }
}
