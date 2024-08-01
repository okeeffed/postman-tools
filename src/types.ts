export interface EnvironmentValue {
  key: string;
  value: string;
  type: "default" | "secret";
  enabled: true;
}

export type PostmanEnvironmentVariable<T extends readonly string[]> = {
  key: EnvironmentValue["key"];
  type: EnvironmentValue["type"];
  default: string;
} & {
  [K in T[number]]?: string;
};

export interface PostmanEnvironmentFile {
  id: string;
  name: string;
  values: Array<EnvironmentValue>;
}

export interface PostmanEnvironmentConfiguration<T extends readonly string[]> {
  name: string;
  environments: T;
  values: Array<PostmanEnvironmentVariable<T>>;
}
