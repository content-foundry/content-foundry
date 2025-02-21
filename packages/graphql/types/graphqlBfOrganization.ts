import { mutationField, nonNull, objectType, stringArg } from "nexus";
import { graphqlBfNode } from "packages/graphql/types/graphqlBfNode.ts";
import { BfOrganization } from "packages/bfDb/models/BfOrganization.ts";
import { toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { getLogger } from "packages/logger.ts";
import { getVoice } from "packages/app/ai/getVoice.ts";

const logger = getLogger(import.meta);

export const exampleBfOrg = {
  __typename: "BfOrganization",
  id: "lol",
  identity: null,
  research: null,
  creation: null,
  distribution: {},
  analytics: {},
};

export const graphqlIdentityType = objectType({
  name: "BfOrganization_Identity",
  definition(t) {
    t.field("twitter", {
      type: objectType({
        name: "Twitter",
        definition(t) {
          t.string("handle");
          t.string("name");
          t.string("imgUrl");
        },
      }),
    });
    t.field("voice", {
      type: objectType({
        name: "Voice",
        definition(t) {
          t.string("voiceSummary");
          t.string("voice");
        },
      })
    });
  },
});

export const graphqlResearchType = objectType({
  name: "BfOrganization_Research",
  definition(t) {
    t.list.field("topics", {
      type: objectType({
        name: "ResearchTopic",
        definition(t) {
          t.string("name");
          t.list.field("entries", {
            type: objectType({
              name: "ResearchEntry",
              definition(t) {
                t.string("type");
                t.string("name");
                t.string("summary");
                t.string("url");
              },
            }),
          });
        },
      }),
    });
  },
});

export const graphqlCreationType = objectType({
  name: "Creation",
  definition(t) {
    t.string("originalText");
    t.list.string("suggestions");
  },
});

export const graphqlDistributionType = objectType({
  name: "Distribution",
  definition(t) {
    t.string("tbd");
  },
});

export const graphqlAnalyticsType = objectType({
  name: "Analytics",
  definition(t) {
    t.string("tbd");
  },
});

export const graphqlBfOrganizationType = objectType({
  name: "BfOrganization",
  definition(t) {
    t.implements(graphqlBfNode);
    t.field("identity", {
      type: graphqlIdentityType,
    });
    t.field("research", {
      type: graphqlResearchType,
    });
    t.field("creation", {
      type: graphqlCreationType,
    });
    t.field("distribution", {
      type: graphqlDistributionType,
    });
    t.field("analytics", {
      type: graphqlAnalyticsType,
    });
  },
});

export const createVoiceMutation = mutationField("createVoice", {
  args: {
    handle: nonNull(stringArg()),
  },
  type: "Voice",
  resolve: async (_, { handle }, ctx) => {
    const org = await ctx.findX(
      BfOrganization,
      toBfGid("1526874860774e4fb612258ed8092ab7"),
    );
    logger.info("ORG", org);
    // TODO: get twitter name and picture
    // const twitterResponse...
    const voiceResponse = await getVoice(handle);
    logger.info("VOICE RESPONSE", voiceResponse);
    org.props = {
      ...org.props,
      identity: {
        twitter: {
          handle,
          // name: twitterResponse.name,
          // imgUrl: twitterResponse.imgUrl,
        },
        voice: voiceResponse,
      },
    };
    await org.save();
    return voiceResponse;
  },
});
