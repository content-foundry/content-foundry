import {
  arg,
  interfaceType,
  mutationField,
  nonNull,
  objectType,
  queryField,
  stringArg,
} from "nexus";
import { graphqlNode } from "packages/graphql/types/graphqlBfNode.ts";
import { getLogger } from "packages/logger.ts";
import { BfPerson } from "packages/bfDb/models/BfPerson.ts";
import {
  graphqlJSONStringScalarType,
} from "packages/graphql/types/graphqlJSONScalar.ts";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import { graphqlBfBlogType } from "packages/graphql/types/graphqlBfBlog.ts";
import { BfBlog } from "packages/bfDb/models/BfBlog.ts";
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { graphqlBfOrganizationType } from "packages/graphql/types/graphqlBfOrganization.ts";
const logger = getLogger(import.meta);

export const graphqlBfCurrentViewerType = interfaceType({
  name: "BfCurrentViewer",
  definition(t) {
    t.implements(graphqlNode);
    t.field("blog", {
      type: graphqlBfBlogType,
      resolve: async (_parent, _args, ctx) => {
        const blog = await ctx.findX(BfBlog, "the-blog" as BfGid);
        return blog.toGraphql();
      },
    });
    t.field("organization", {
      type: graphqlBfOrganizationType,
      resolve: async (_parent, _args, ctx) => {
        const org = await ctx.findOrganizationForCurrentViewer();
        if (!org) {
          throw new Error("No organization found for current viewer");
        }
        return org.toGraphql();
      },
    });
  },
});

export const graphqlBfCurrentViewerLoggedInType = objectType({
  name: "BfCurrentViewerLoggedIn",
  definition(t) {
    t.implements(graphqlBfCurrentViewerType);
  },
});

export const graphqlBfCurrentViewerLoggedOutType = objectType({
  name: "BfCurrentViewerLoggedOut",
  definition(t) {
    t.implements(graphqlBfCurrentViewerType);
  },
});

export const graphqlBfCurrentViewerQueryType = queryField("me", {
  type: graphqlBfCurrentViewerType,
  resolve(_root, _args, ctx) {
    return ctx.getCvForGraphql();
  },
});

export const graphqlBfCurrentViewerRegistrationOptionsType = mutationField(
  "registrationOptions",
  {
    type: graphqlJSONStringScalarType,
    args: {
      email: nonNull(stringArg()),
    },
    resolve: async (_parent, { email }) => {
      const { regOptions } = await BfPerson
        .generateRegistrationOptionsForGraphql(email);
      return JSON.stringify(regOptions);
    },
  },
);

export const graphqlBfCurrentViewerRegisterMutation = mutationField(
  "register",
  {
    type: graphqlBfCurrentViewerLoggedInType,
    args: {
      attResp: nonNull(arg({ type: graphqlJSONStringScalarType })),
      email: nonNull(stringArg()),
    },
    async resolve(_parent, { attResp, email }, ctx) {
      const registrationResponseJSON: RegistrationResponseJSON = JSON.parse(
        attResp,
      );
      const person = await ctx.register(registrationResponseJSON, email);
      return person.cv.toGraphql();
    },
  },
);

export const graphqlBfCurrentViewerLoginDemoUser = mutationField(
  "loginAsDemoPerson",
  {
    type: graphqlBfCurrentViewerLoggedInType,

    async resolve(_parent, _, ctx) {
      const cv = await ctx.loginDemoUser();
      return cv.toGraphql();
    },
  },
);

export const graphqlBfCurrentViewerCheckEmailMutation = mutationField(
  "checkEmail",
  {
    type: "Boolean",
    args: {
      email: nonNull(stringArg()),
    },
    resolve: async (_, { email }, _ctx) => {
      try {
        const cv = BfCurrentViewer
          .__DANGEROUS_USE_IN_REGISTRATION_ONLY__createCvForRegistration(
            import.meta,
            email,
          );
        const person = await BfPerson.findByEmail(cv, email);
        logger.debug("person", person);
        return person != null && person.props?.credential !== undefined;
      } catch (_) {
        return false;
      }
    },
  },
);

export const graphqlBfCurrentViewerGetLoginOptionsMutation = mutationField(
  "getLoginOptions",
  {
    type: graphqlJSONStringScalarType,
    args: {
      email: nonNull(stringArg()),
    },
    async resolve(_parent, { email }) {
      const options = await BfPerson.generateAuthenticationOptionsForGraphql(
        email,
      );
      return JSON.stringify(options);
    },
  },
);

export const graphqlBfCurrentViewerLoginMutation = mutationField(
  "login",
  {
    type: graphqlBfCurrentViewerType,
    args: {
      email: nonNull(stringArg()),
      authResp: nonNull(arg({ type: graphqlJSONStringScalarType })),
    },
    async resolve(_parent, { email, authResp }, ctx) {
      const optionsJSON = JSON.parse(authResp);
      const cv = await ctx.login(email, optionsJSON);
      const result = cv.toGraphql();
      return {
        ...result,
        // necessary for type error
        __typename: "BfCurrentViewerLoggedIn",
      };
    },
  },
);
