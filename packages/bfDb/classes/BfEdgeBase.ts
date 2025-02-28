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

export type BfEdgeBaseProps<T extends BfNodeBaseProps = BfNodeBaseProps> = BfNodeBaseProps & {
  role: string;
} & T;

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
   * @param _props - The edge properties including role information
   * @param metadata - Optional partial metadata for the edge including source and target IDs
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
   * 
   * @param cv - The current viewer context
   * @param sourceNode - The source node to connect from
   * @param targetNode - The target node to connect to
   * @param role - Optional role/label for the edge relationship
   * @param additionalProps - Optional additional properties for the edge
   * @returns A new BfEdgeBase instance representing the edge
   */
  static createBetweenNodes(
    cv: BfCurrentViewer,
    sourceNode: BfNodeBase,
    targetNode: BfNodeBase,
    role?: string,
    additionalProps?: Record<string, unknown>,
  ): Promise<BfEdgeBase> {
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
    return Promise.resolve(new BfEdgeBase(cv, edgeProps, partialMetadata));
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
   * @param cv - The current viewer context
   * @param bfNode - The target node instance
   * @param SourceClass - The class of the source nodes to query
   * @param targetId - The ID of the target node
   * @param propsToQuery - Optional properties to filter the query
   * @returns Promise resolving to an array of source instances
   */
  static querySourceInstances<
    TSourceClass extends typeof BfNodeBase,
    TTargetNode extends BfNodeBase,
    TRequiredProps extends BfEdgeBaseProps = BfEdgeBaseProps,
    TOptionalProps extends Record<string, unknown> = Record<string, unknown>,
  >(
    _cv: BfCurrentViewer,
    _bfNode: TTargetNode,
    _SourceClass: TSourceClass,
    _targetId: BfGid,
    _propsToQuery: Partial<TRequiredProps & TOptionalProps> = {},
  ): Promise<Array<InstanceType<TSourceClass>>> {
    throw new BfErrorNotImplemented("Not implemented");
  }

  /**
   * Queries target instances connected to a source node.
   * 
   * @param cv - The current viewer context
   * @param bfNode - The source node instance
   * @param TargetClass - The class of the target nodes to query
   * @param sourceId - The ID of the source node
   * @param propsToQuery - Optional properties to filter the query
   * @param edgePropsToQuery - Optional edge properties to filter the query
   * @returns Promise resolving to an array of target instances
   */
  static queryTargetInstances<
    TSourcNode extends BfNodeBase,
    TTargetProps extends BfNodeBaseProps,
    TEdgeProps extends BfEdgeBaseProps,
    TTargetClass extends typeof BfNodeBase<TTargetProps>,
  >(
    _cv: BfCurrentViewer,
    _bfNode: TSourcNode,
    _TargetClass: TTargetClass,
    _sourceId: BfGid,
    _propsToQuery: Partial<TTargetProps>,
    _edgePropsToQuery: Partial<TEdgeProps> = {},
  ): Promise<Array<InstanceType<TTargetClass>>> {
    throw new BfErrorNotImplemented("Not implemented");
  }

  /**
   * Queries all source edges connected to a node.
   *
   * @param node - The node whose source edges to query
   * @param SourceClass - The class of the source nodes to filter by
   * @returns Promise resolving to an array of edge instances
   */
  static querySourceEdgesForNode<TProps extends BfEdgeBaseProps>(
    _node: BfNodeBase,
    _SourceClass: typeof BfNodeBase,
  ): Promise<Array<InstanceType<typeof BfEdgeBase<TProps>>>> {
    throw new BfErrorNotImplemented("Not implemented");
  }

  /**
   * Queries all target edges connected to a node.
   *
   * @param node - The node whose target edges to query
   * @param TargetClass - The class of the target nodes to filter by
   * @returns Promise resolving to an array of edge instances
   */
  static queryTargetEdgesForNode(
    _node: BfNodeBase,
    _TargetClass: typeof BfNodeBase,
  ): Promise<Array<InstanceType<typeof BfEdgeBase>>> {
    throw new BfErrorNotImplemented("Not implemented");
  }

  /**
   * Deletes all edges touching a specific node.
   *
   * @param cv - The current viewer context
   * @param id - The ID of the node whose edges should be deleted
   * @returns Promise resolving when deletion is complete
   */
  static deleteEdgesTouchingNode(
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
