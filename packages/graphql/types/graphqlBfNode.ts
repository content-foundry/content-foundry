import { BfNode } from "packages/bfDb/coreModels/BfNode.ts";
import { getLogger } from "packages/logger.ts";
import { idArg, interfaceType, queryField } from "nexus";
import { type BfGid, toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
// import { BfBlogPost } from "packages/bfDb/models/BfBlogPost.ts";
// import {
//   idArg,
//   interfaceType,
//   nonNull,
//   objectType,
//   queryField,
//   stringArg,
//   subscriptionField,
// } from "packages/graphql/deps.ts";
// import { toBfGid } from "packages/bfDb/classes/BfBaseModelIdTypes.ts";
// import { getLogger } from "packages/logger/logger.ts";

const _logger = getLogger(import.meta);

export type GraphqlNode = {
  __typename: string;
  id: BfGid;
};

export type GraphqlBfNode = GraphqlNode;

export const graphqlNode = interfaceType({
  name: "Node",
  sourceType: {
    module: import.meta.url
      .replace("file://", ""),
    export: "GraphqlNode",
  },
  definition(t) {
    t.nonNull.id("id", {
      description: "Unique identifier for the resource",
    });
  },
});
export const graphqlBfNode = interfaceType({
  name: "BfNode",
  sourceType: {
    module: import.meta.url
      .replace("file://", ""),
    export: "GraphqlBfNode",
  },
  definition(t) {
    t.implements(graphqlNode);
  },
});

export const graphqlBfNodeQuery = queryField("bfNode", {
  type: graphqlBfNode,
  args: {
    id: idArg(),
  },
  resolve: async (_, { id }, ctx) => {
    if (!id) {
      return null;
    }
    const node = await ctx.findX(BfNode, toBfGid(id));
    return node.toGraphql();
  },
});

// export const BfNodeGraphQLSubscriptionType = subscriptionField("node", {
//   type: BfNodeGraphQLType,
//   args: {
//     id: idArg(),
//   },
//   subscribe: async function (_, { id }, { bfCurrentViewer }) {
//     if (!id) {
//       return Promise.reject();
//     }
//     logger.debug(`Subscribing to node ${id}`);
//     const node = await BfNode.findX(bfCurrentViewer, toBfGid(id));
//     return node.getSubscriptionForGraphql();
//   },
//   resolve: async function (_, { id }, { bfCurrentViewer }) {
//     logger.debug(`Resolving ${id} for ${bfCurrentViewer}`);
//     const node = await BfNode.find(bfCurrentViewer, toBfGid(id));
//     return node?.toGraphql();
//   },
// });

// export const BfConnectionEdgeType = objectType({
//   name: "BfConnectionEdge",
//   definition(t) {
//     t.field("node", {
//       type: BfNodeGraphQLType,
//     });
//     t.string("cursor");
//   },
// });

// export const BfConnectionSubscriptionPayloadType = objectType({
//   name: "BfConnectionSubscriptionPayload",
//   definition(t) {
//     t.field("append", { type: BfConnectionEdgeType });
//     // TODO: other operations
//     // t.field("prepend", { type: BfConnectionEdgeType });
//     // t.field("delete", { type: BfConnectionEdgeType });
//     // t.field("move", { type: BfConnectionEdgeType });
//   },
// });

// export const BfConnectionCreateEdgeSubscriptionType = subscriptionField(
//   "connection",
//   {
//     type: BfConnectionSubscriptionPayloadType,
//     args: {
//       id: idArg(),
//       targetClassName: stringArg(),
//     },
//     subscribe: async function (
//       _,
//       { id, targetClassName },
//       { bfCurrentViewer },
//     ) {
//       if (!id || !targetClassName) {
//         return Promise.reject();
//       }
//       logger.debug(`Subscribing to node ${id}`);
//       const node = await BfNode.findX(bfCurrentViewer, toBfGid(id));
//       return node.getConnectionSubscriptionForGraphql(targetClassName);
//     },
//     resolve: async function (
//       { operation, bfTid, cursor },
//       { targetClassName },
//       { bfCurrentViewer },
//     ) {
//       const node = await BfNode.findX(bfCurrentViewer, bfTid);
//       const edge = {
//         __typename: `${targetClassName}Edge`,
//         node: node.toGraphql(),
//         cursor,
//       };
//       switch (operation) {
//         case "INSERT": {
//           return {
//             append: edge,
//           };
//         }
//       }
//     },
//   },
// );
