import { getLogger } from "packages/logger.ts";
import { type BfGid, toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import {
  BfCurrentViewer,
  type CurrentViewerTypenames,
} from "packages/bfDb/classes/BfCurrentViewer.ts";
import type {
  BfNodeBase,
  BfNodeBaseProps,
} from "packages/bfDb/classes/BfNodeBase.ts";
import type {
  BfMetadataNode,
  BfNode,
} from "packages/bfDb/coreModels/BfNode.ts";
import { BfPerson } from "packages/bfDb/models/BfPerson.ts";
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { BfOrganization } from "packages/bfDb/models/BfOrganization.ts";
import { BfBlog } from "packages/bfDb/models/BfBlog.ts";
import { BfBlogPost } from "packages/bfDb/models/BfBlogPost.ts";
import type { BfEdge } from "packages/bfDb/coreModels/BfEdge.ts";
import type { Connection, ConnectionArguments } from "graphql-relay";
import { bfQueryItemsForGraphQLConnection } from "packages/bfDb/bfDb.ts";

const logger = getLogger(import.meta);

export type Context = {
  [Symbol.dispose]: () => void;
  getCvForGraphql(): {
    __typename: CurrentViewerTypenames;
    id: string;
  };
  createTargetNode<
    TProps extends BfNodeBaseProps,
    TBfClass extends typeof BfNode<TProps>,
  >(
    sourceNode: BfNode,
    BfClass: TBfClass,
    props: TProps,
    metadata?: BfMetadataNode,
  ): Promise<InstanceType<TBfClass>>;
  find<
    TProps extends BfNodeBaseProps,
    TClass extends typeof BfNodeBase<TProps>,
  >(
    BfClass: TClass,
    id: BfGid | string | null | undefined,
  ): Promise<InstanceType<TClass> | null>;
  findX<
    TProps extends BfNodeBaseProps,
    TClass extends typeof BfNodeBase<TProps>,
  >(
    BfClass: TClass,
    id: BfGid,
  ): Promise<InstanceType<TClass>>;
  findCurrentUser(): Promise<BfPerson | null>;
  login(
    email: string,
    options: AuthenticationResponseJSON,
  ): Promise<BfCurrentViewer>;
  register(
    registrationResponse: RegistrationResponseJSON,
    email: string,
  ): Promise<BfPerson>;
  getRequestHeader(name: string): string | null;
  getResponseHeaders(): Headers;
  loginDemoUser(): Promise<BfCurrentViewer>;
  findOrganizationForCurrentViewer(): Promise<BfOrganization | null>;
  queryConnectionForGraphql<
    TProps extends BfNodeBaseProps,
    TBfClass extends typeof BfNode<TProps>,
    TEdgeClass extends typeof BfEdge,
  >(
    SourceNodeClass: TBfClass,
    TargetNodeClass: TBfClass,
    EdgeClass: TEdgeClass,
    sourceId: BfGid,
    args: ConnectionArguments,
    filters?: {
      edgeProps?: Record<string, unknown>;
      targetProps?: Record<string, unknown>;
    },
  ): Promise<Connection<InstanceType<TBfClass>> & { count: number }>;
  getMainBlog(): Promise<BfBlog>;
};

export async function createContext(request: Request): Promise<Context> {
  logger.debug("Creating new context");
  const cache = new Map<string, Map<BfGid, BfNodeBase>>();
  const responseHeaders = new Headers();
  let currentViewer = await BfCurrentViewer.createFromRequest(
    import.meta,
    request,
    responseHeaders,
  );
  logger.debug("Current viewer created");

  async function loginDemoUser() {
    currentViewer = await BfCurrentViewer.createForDemo(
      import.meta,
      responseHeaders,
    );
    return currentViewer;
  }

  async function login(email: string, options: AuthenticationResponseJSON) {
    logger.debug("Logging in user");
    currentViewer = await BfCurrentViewer.createFromLoginOptions(
      import.meta,
      email,
      options,
      responseHeaders,
    );
    logger.debug("User logged in successfully");
    return currentViewer;
  }

  async function register(
    registrationResponse: RegistrationResponseJSON,
    email: string,
  ) {
    logger.debug("Registering user");
    currentViewer = await BfCurrentViewer.createFromRegistrationResponse(
      import.meta,
      registrationResponse,
      email,
      responseHeaders,
    );
    const person = await BfPerson.register(registrationResponse, email);
    logger.debug("User registered successfully");
    return person;
  }

  logger.debug("context Creating");
  const ctx: Context = {
    [Symbol.dispose]() {
      logger.debug("Starting context disposal");
      cache.clear();
      logger.debug("Cache cleared");
      currentViewer.clear();
      logger.debug("Current viewer cleared");
      logger.debug("Context disposed successfully");
    },

    getResponseHeaders() {
      return new Headers(responseHeaders);
    },

    getRequestHeader(name: string) {
      return request.headers.get(name);
    },

    getCvForGraphql() {
      return currentViewer.toGraphql();
    },

    async createTargetNode<
      TProps extends BfNodeBaseProps = BfNodeBaseProps,
      TBfClass extends typeof BfNode<TProps> = typeof BfNode<TProps>,
    >(
      sourceNode: BfNode,
      TargetBfClass: TBfClass,
      props: TProps,
      metadata?: BfMetadataNode,
    ) {
      let innerCache = cache.get(TargetBfClass.name);
      if (!innerCache) {
        innerCache = new Map<BfGid, BfNodeBase>();
        cache.set(TargetBfClass.name, innerCache);
      }

      const newItem = await sourceNode.createTargetNode(
        TargetBfClass,
        props,
        metadata,
      );
      return newItem as InstanceType<TBfClass>;
    },

    async find(BfClass, idOrString) {
      if (idOrString == null) {
        return null;
      }
      const id = toBfGid(idOrString);
      const item = await BfClass.find(
        currentViewer,
        id,
        cache.get(BfClass.name),
      );
      return item as InstanceType<typeof BfClass>;
    },

    async findX(BfClass, id) {
      const item = await BfClass.findX(
        currentViewer,
        id,
        cache.get(BfClass.name),
      );
      return item as InstanceType<typeof BfClass>;
    },

    async findCurrentUser() {
      const currentViewerPerson = await BfPerson.findCurrentViewer(
        currentViewer,
      );
      return currentViewerPerson;
    },

    login,
    register,
    loginDemoUser,

    async findOrganizationForCurrentViewer() {
      const orgs = await BfOrganization.query(
        currentViewer,
        { bfCid: currentViewer.bfGid },
      );
      return orgs[0];
    },

    /**
     * Query a connection for GraphQL, handling edges and pagination
     */
    async queryConnectionForGraphql<
      TProps extends BfNodeBaseProps,
      TBfClass extends typeof BfNode<TProps>,
      TEdgeClass extends typeof BfEdge,
    >(
      SourceNodeClass: TBfClass,
      TargetNodeClass: TBfClass,
      EdgeClass: TEdgeClass,
      sourceId: BfGid,
      args: ConnectionArguments,
      filters?: {
        edgeProps?: Record<string, unknown>;
        targetProps?: Record<string, unknown>;
      },
    ): Promise<Connection<InstanceType<TBfClass>> & { count: number }> {
      logger.debug("Querying connection for GraphQL", {
        sourceClass: SourceNodeClass.name,
        targetClass: TargetNodeClass.name,
        edgeClass: EdgeClass.name,
        sourceId,
        args,
        filters,
      });

      // First, get the source node
      const sourceNode = await this.findX(SourceNodeClass, sourceId);

      // Get all edges from source to targets of the specified class
      const edges = await EdgeClass.findBySource(
        currentViewer,
        sourceNode,
        TargetNodeClass.name,
      );

      // Filter edges by properties if specified
      let filteredEdges = edges;
      if (filters?.edgeProps) {
        filteredEdges = edges.filter((edge) => {
          return Object.entries(filters.edgeProps).every(([key, value]) => {
            return edge.props[key] === value;
          });
        });
      }

      // Get all target IDs
      const targetIds = filteredEdges.map((edge) => edge.targetId);

      // Query the connection using bfQueryItemsForGraphQLConnection
      const connection = await bfQueryItemsForGraphQLConnection(
        {
          className: TargetNodeClass.name,
          bfOid: currentViewer.bfOid,
        },
        filters?.targetProps || {},
        args,
        targetIds,
      );

      return connection;
    },

    // Helper method to get the main blog
    async getMainBlog() {
      return await BfBlog.getMainBlog(currentViewer);
    },
  };
  return ctx;
}
