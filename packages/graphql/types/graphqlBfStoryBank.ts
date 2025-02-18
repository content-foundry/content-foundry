import { objectType } from "nexus";
import { getLogger } from "packages/logger.ts";
import { graphqlBfNode } from "packages/graphql/types/graphqlBfNode.ts";

const _logger = getLogger(import.meta);

export const graphqlBfStoryBankTwitterVoiceProps = objectType({
  name: "BfStoryBankTwitterVoiceProps",
  definition(t) {
    t.list.string("celebrityVoices");
    t.string("description");
  },
});

export const graphqlBfStoryBankType = objectType({
  name: "BfStoryBank",
  definition(t) {
    t.implements(graphqlBfNode);
    t.field("twitterVoiceProps", {
      type: graphqlBfStoryBankTwitterVoiceProps,
      resolve: async (_parent, _args, ctx) => {
        return {
          __typename: "BfStoryBank",
          id: "lol",
          celebrityVoices: ["kermit", "miss piggy"],
          description: "lol",
        };
      }
    });
  },
});
