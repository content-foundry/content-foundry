import { objectType } from "nexus";
import { graphqlBfNode } from "packages/graphql/types/graphqlBfNode.ts";

export const graphqlIdentityType = objectType({
  name: "Identity",
  definition(t) {
    t.string("tbd");
  },
});

export const graphqlResearchType = objectType({
  name: "Research",
  definition(t) {
    t.string("tbd");
  },
});

export const graphqlCreationType = objectType({
  name: "Creation",
  definition(t) {
    t.string("tbd");
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
