// packages/bfDb/classes/BfEdgeBase.ts

import {
  type BfMetadataBase,
  BfNodeBase,
  type BfNodeBaseProps,
} from "packages/bfDb/classes/BfNodeBase.ts";
import type { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { getLogger } from "packages/logger.ts";
import { BfErrorNotImplemented } from "packages/BfError.ts";

const logger = getLogger(import.meta);

export type BfEdgeBaseProps = BfNodeBaseProps & {
  role: string;
};

export type BfMetadataEdgeBase = BfMetadataBase & {
  /** Source ID */
  bfSid: BfGid;
  bfSClassName: string;
  /** Target ID */
  bfTid: BfGid;
  bfTClassName: string;
};

/**
 * BfEdgeBase: Base class for edges between nodes that aren't database-backed
 */
export class BfEdgeBase<
  TProps extends BfEdgeBaseProps = BfEdgeBaseProps,
  TMetadata extends BfMetadataEdgeBase = BfMetadataEdgeBase,
> extends BfNodeBase<TProps, TMetadata> {


  
  /**
   * Creates an instance of BfEdgeBase.
   *
   * @param _currentViewer - The current viewer context
   * @param _props - The edge properties
   * @param metadata - Optional partial metadata for the edge
   */
  constructor(
    protected override _currentViewer: BfCurrentViewer,
    protected override _props: TProps,
    metadata?: Partial<TMetadata>,
  ) {
    super(_currentViewer, _props, metadata);
  }

  /**
   * Get the source ID for this edge
   */
  get sourceId(): BfGid {
    return this.metadata.bfSid;
  }

  /**
   * Get the target ID for this edge
   */
  get targetId(): BfGid {
    return this.metadata.bfTid;
  }

  /**
   * Get the source class name for this edge
   */
  get sourceClassName(): string {
    return this.metadata.bfSClassName;
  }

  /**
   * Get the target class name for this edge
   */
  get targetClassName(): string {
    return this.metadata.bfTClassName;
  }

  /**
   * Get the role/label for this edge relationship, if any
   */
  get role(): string | undefined {
    return this.props.role;
  }

  /**
   * Factory method to create an edge between two nodes.
   * This uses a simpler approach without complex generics to avoid type errors.
   */
  static createBetweenNodes(
    cv: BfCurrentViewer,
    sourceNode: BfNodeBase,
    targetNode: BfNodeBase,
    role?: string,
    additionalProps?: Record<string, unknown>,
  ): BfEdgeBase {
    logger.debug("BfEdgeBase.createBetweenNodes", {
      sourceId: sourceNode.metadata.bfGid,
      sourceClass: sourceNode.metadata.className,
      targetId: targetNode.metadata.bfGid,
      targetClass: targetNode.metadata.className,
      role,
    });

    const partialMetadata: Partial<BfMetadataEdgeBase> = {
      bfSid: sourceNode.metadata.bfGid,
      bfSClassName: sourceNode.metadata.className,
      bfTid: targetNode.metadata.bfGid,
      bfTClassName: targetNode.metadata.className,
    };

    // Combine the given props with the role
    const edgeProps = {
      ...(additionalProps || {}),
      role,
    } as BfEdgeBaseProps;

    // Using the concrete class directly for better type safety
    return new BfEdgeBase(cv, edgeProps, partialMetadata);
  }

  /**
   * Override toString to include source and target information
   */
  override toString() {
    return `${this.constructor.name}#${this.metadata.bfGid} (${this.sourceClassName}#${this.sourceId} -> ${this.targetClassName}#${this.targetId})`;
  }

  /**
   * Override toGraphql to include edge-specific fields
   */
  override toGraphql() {
    const baseGraphql = super.toGraphql();

    return {
      ...baseGraphql,
      sourceId: this.sourceId,
      targetId: this.targetId,
      sourceClassName: this.sourceClassName,
      targetClassName: this.targetClassName,
      role: this.role,
    };
  }

  /**
   * Queries source instances connected to a target node.
   * 
   * @param currentViewer - The current viewer context
   * @param SourceClass - The class of the source nodes to query
   * @param targetId - The ID of the target node
   * @param propsToQuery - Optional properties to filter the query
   * @returns Promise resolving to an array of source instances
   */
  static querySourceInstances<
    TSourceClass extends typeof BfNodeBase,
    TThis extends typeof BfEdgeBase,
    TRequiredProps extends BfEdgeBaseProps = BfEdgeBaseProps,
    TOptionalProps extends Record<string, unknown> = Record<string, unknown>
  >(
    this: TThis,
    _cv: BfCurrentViewer,
    SourceClass: TSourceClass,
    _targetId: BfGid,
    _propsToQuery: Partial<TRequiredProps & TOptionalProps> = {},
  ): Promise<Array<InstanceType<TSourceClass>>> {
    throw new BfErrorNotImplemented("Not implemented");
  }

  /**
   * Queries target instances connected to a source node.
   * 
   * @param currentViewer - The current viewer context
   * @param TargetClass - The class of the target nodes to query
   * @param sourceId - The ID of the source node
   * @param propsToQuery - Optional properties to filter the query
   * @param edgePropsToQuery - Optional edge properties to filter the query
   * @returns Promise resolving to an array of target instances
   */
  static queryTargetInstances<
    TTargetClass extends typeof BfNodeBase
  >(
    this: typeof BfEdgeBase,
    _cv: BfCurrentViewer,
    TargetClass: TTargetClass,
    _sourceId: BfGid,
    _propsToQuery: Partial<BfEdgeBaseProps & Record<string, unknown>> = {},
    _edgePropsToQuery: Partial<unknown> = {},
  ): Promise<Array<InstanceType<TTargetClass>>> {
    throw new BfErrorNotImplemented("Not implemented");
  }

  /**
   * Queries all source edges connected to a node.
   * 
   * @param node - The node whose source edges to query
   * @returns Promise resolving to an array of edge instances
   */
  static querySourceEdgesForNode(
    this: typeof BfEdgeBase,
    _node: BfNodeBase
  ): Promise<Array<InstanceType<typeof BfEdgeBase>>> {
    throw new BfErrorNotImplemented("Not implemented");
  }

  /**
   * Queries all target edges connected to a node.
   * 
   * @param node - The node whose target edges to query
   * @returns Promise resolving to an array of edge instances
   */
  static queryTargetEdgesForNode(
    this: typeof BfEdgeBase,
    _node: BfNodeBase
  ): Promise<Array<InstanceType<typeof BfEdgeBase>>> {
    throw new BfErrorNotImplemented("Not implemented");
  }

  /**
   * Finds an edge between source and target nodes.
   * 
   * @param cv - The current viewer context
   * @param sourceNode - The source node
   * @param targetNode - The target node
   * @param role - Optional role for the relationship
   * @returns Promise resolving to an edge instance or null if not found
   */
  static findBySourceAndTarget<
    T extends typeof BfEdgeBase = typeof BfEdgeBase,
    S extends BfNodeBase = BfNodeBase,
    U extends BfNodeBase = BfNodeBase
  >(
    this: T,
    _cv: BfCurrentViewer,
    _sourceNode: S,
    _targetNode: U,
    _role = "",
  ): Promise<InstanceType<T> | null> {
    throw new BfErrorNotImplemented("Not implemented");
  }

  /**
   * Deletes all edges touching a specific node.
   * 
   * @param cv - The current viewer context
   * @param id - The ID of the node
   * @returns Promise resolving when deletion is complete
   */
  static deleteEdgesTouchingNode(
    this: typeof BfEdgeBase,
    _cv: BfCurrentViewer,
    _id: BfGid,
  ): Promise<void> {
    throw new BfErrorNotImplemented("Not implemented");
  }

  /**
   * Deletes this edge and checks if the target node should also be deleted.
   * This is typically used when the target node might not have other connections
   * and should be removed when the last edge to it is deleted.
   * 
   * @returns Promise resolving when deletion is complete
   */
  deleteAndCheckForNetworkDelete(): Promise<void> {
    throw new BfErrorNotImplemented("Not implemented");
  }
}
