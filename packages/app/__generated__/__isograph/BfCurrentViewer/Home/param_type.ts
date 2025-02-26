
export type BfCurrentViewer__Home__param = {
  readonly data: {
    readonly __typename: string,
    readonly contentCollection: ({
      readonly name: (string | null),
      readonly description: (string | null),
      readonly items: ({
        /**
https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types
        */
        readonly edges: (ReadonlyArray<({
          /**
https://facebook.github.io/relay/graphql/connections.htm#sec-Node
          */
          readonly node: ({
            readonly title: (string | null),
            readonly body: (string | null),
            readonly href: (string | null),
          } | null),
        } | null)> | null),
      } | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
