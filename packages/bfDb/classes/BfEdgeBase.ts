import {
  type BfMetadataBase,
  BfNodeBase,
  type BfNodeBaseProps,
} from "packages/bfDb/classes/BfNodeBase.ts";
import type { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { getLogger } from "packages/logger.ts";
import { BfErrorNotImplemented } from "packages/BfError.ts";
import type { BfMetadataEdge } from "packages/bfDb/coreModels/BfEdge.ts";

const _logger = getLogger(import.meta);

export type BfEdgeBaseProps = {
  role: string;
} & BfNodeBaseProps;

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
  static async createBetweenNodes(
    cv: BfCurrentViewer,
    sourceNode: BfNodeBase,
    targetNode: BfNodeBase,
    role: string | null = null,
  ): Promise<BfEdgeBase> {
    const metadata = {
      bfSClassName: sourceNode.constructor.name,
      bfSid: sourceNode.metadata.bfGid,
      bfTClassName: targetNode.constructor.name,
      bfTid: targetNode.metadata.bfGid,
    } as BfMetadataEdge;

    const newEdge = await this.__DANGEROUS__createUnattached(cv, {
      role,
    }, metadata);

    return newEdge;
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
    TEdgeProps extends BfEdgeBaseProps,
    TSourceProps extends BfNodeBaseProps = BfNodeBaseProps,
  >(
    _cv: BfCurrentViewer,
    _SourceClass: TSourceClass,
    _targetId: BfGid,
    _propsToQuery: Partial<TSourceProps> = {},
    _edgePropsToQuery: Partial<TEdgeProps> = {},
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
    TTargetProps extends BfNodeBaseProps,
    TEdgeProps extends BfEdgeBaseProps,
    TTargetClass extends typeof BfNodeBase<TTargetProps>,
  >(
    _cv: BfCurrentViewer,
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
  ): Promise<Array<InstanceType<typeof BfEdgeBase>>> {
    throw new BfErrorNotImplemented("Not implemented");
  }
}
