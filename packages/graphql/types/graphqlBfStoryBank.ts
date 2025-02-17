
import { objectType } from "nexus";
import { graphqlBfNode } from "packages/graphql/types/graphqlBfNode.ts";

export const graphqlBfStoryBank = objectType({
  name: "BfStoryBank",
  definition(t) {
    t.implements(graphqlBfNode)
    t.nonNull.string("voiceProfile");
  }
});
