// packages/graphql/scalars/JSONScalar.ts
import { scalarType } from "nexus";
import GraphQLJSON from "graphql-type-json";

export const graphqlJSONScalarType = scalarType({
  name: "JSON",
  ...GraphQLJSON,
});

import { Kind } from "graphql";

export const graphqlJSONStringScalarType = scalarType({
  name: "JSONString",
  asNexusMethod: "jsonString",
  description:
    "A scalar that only accepts a valid JSON string. It returns the same valid JSON string on output.",
  /**
   * parseValue: Called when the value comes from the **client** (e.g. in a mutation).
   * We want to ensure it’s a string that can be parsed by JSON.parse.
   * If valid, we store/return it as a string internally (so resolvers see a string).
   */
  parseValue(value) {
    if (typeof value !== "string") {
      throw new Error(
        `JSONString must be passed as a string, got: ${typeof value}`,
      );
    }
    try {
      JSON.parse(value);
    } catch {
      throw new Error("JSONString must be valid JSON syntax");
    }
    return value; // store as string internally
  },
  /**
   * parseLiteral: Called when the value is provided directly in the GraphQL query,
   * e.g. { myField: """ { "foo": "bar" } """ } without variables.
   */
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new Error(`JSONString must be a string literal`);
    }
    try {
      JSON.parse(ast.value);
    } catch {
      throw new Error("JSONString must be valid JSON syntax");
    }
    return ast.value;
  },
  /**
   * serialize: Called when sending data **back to the client**.
   * Here, we output a string. If it’s not already a string, we try to JSON.stringify it.
   */
  serialize(value) {
    // If it's already a string, ensure it's valid JSON
    if (typeof value === "string") {
      try {
        JSON.parse(value);
        return value;
      } catch {
        // If it’s an invalid JSON string, but still a string, you can decide:
        //   - throw an error, or
        //   - attempt to fix it with JSON.stringify (not recommended if it’s truly invalid).
        throw new Error("JSONString must be valid JSON syntax");
      }
    }
    // If it's not a string, attempt to JSON.stringify it
    try {
      return JSON.stringify(value);
    } catch {
      throw new Error("JSONString: Could not stringify the returned value");
    }
  },
});
