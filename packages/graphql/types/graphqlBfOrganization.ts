import { mutationField, nonNull, objectType, stringArg } from "nexus";
import { graphqlBfNode } from "packages/graphql/types/graphqlBfNode.ts";
import { getLogger } from "packages/logger.ts";
import { getVoice } from "packages/app/ai/getVoice.ts";
import { makeTweets } from "packages/app/ai/makeTweets.ts";

const _logger = getLogger(import.meta);

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
      }),
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
    t.list.field("suggestions", {
      type: objectType({
        name: "Suggestion",
        definition(t) {
          t.string("tweet");
          t.string("explanation");
        },
      }),
    });
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
    const org = await ctx.findOrganizationForCurrentViewer();
    if (!org) {
      throw new Error("No organization found");
    }
    const voiceResponse = await getVoice(handle);
    org.props = {
      ...org.props,
      identity: {
        twitter: {
          handle,
        },
        voice: voiceResponse,
      },
    };
    await org.save();
    return voiceResponse;
  },
});

export const makeTweetsMutation = mutationField("makeTweets", {
  args: {
    tweet: nonNull(stringArg()),
  },
  type: "Creation",
  resolve: async (_, { tweet }, ctx) => {
    const org = await ctx.findOrganizationForCurrentViewer();
    if (!org) {
      throw new Error("No organization found");
    }
    const response = await makeTweets(tweet, org.props.identity?.voice?.voice);
    org.props = {
      ...org.props,
      creation: response,
    };
    await org.save();
    return response;
  },
});
