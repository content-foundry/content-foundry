import { objectType } from "nexus";
import { getLogger } from "packages/logger.ts";
import { graphqlBfNode } from "packages/graphql/types/graphqlBfNode.ts";

const _logger = getLogger(import.meta);

export const graphqlBfPerson = objectType({
  name: "BfPerson",
  definition(t) {
    t.implements(graphqlBfNode);
    t.string("name");
  },
});
