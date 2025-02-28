import {
  BfEdgeBase,
  type BfEdgeBaseProps,
  type BfMetadataEdgeBase,
} from "packages/bfDb/classes/BfEdgeBase.ts";
import type {
  BfNodeBase,
  BfNodeBaseProps,
} from "packages/bfDb/classes/BfNodeBase.ts";
import type { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

/**
 * In-memory storage for edges
 */
const inMemoryEdges: Map<string, BfEdgeInMemory> = new Map();

export type BfEdgeInMemoryProps = BfEdgeBaseProps;
export type BfMetadataEdgeInMemory = BfMetadataEdgeBase;

/**
 * BfEdgeInMemory: In-memory implementation of edges between nodes
 * Useful for testing or simple in-memory operations
 */
export class BfEdgeInMemory<
  TProps extends BfEdgeInMemoryProps = BfEdgeInMemoryProps,
  TMetadata extends BfMetadataEdgeInMemory = BfMetadataEdgeInMemory,
> extends BfEdgeBase<TProps, TMetadata> {
  /**
   * Create an edge between nodes and store it in memory
   */
  static override createBetweenNodes<
    T extends typeof BfEdgeInMemory = typeof BfEdgeInMemory,
    S extends BfNodeBase = BfNodeBase,
    U extends BfNodeBase = BfNodeBase,
  >(
    this: T,
    cv: BfCurrentViewer,
    sourceNode: S,
    targetNode: U,
    role = "",
    additionalProps?: Record<string, unknown>,
  ): Promise<InstanceType<T>> {
    logger.debug(`${this.name}.createBetweenNodes`, {
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

    const edge = new this(cv, edgeProps, partialMetadata) as InstanceType<T>;

    // Store the edge in memory
    const key = `${edge.sourceId}:${edge.targetId}:${role}`;
    inMemoryEdges.set(key, edge as BfEdgeInMemory);

    return Promise.resolve(edge);
  }

  /**
   * Query source instances connected to a target node
   */
  static override async querySourceInstances<
    TSourceClass extends typeof BfNodeBase,
    TTargetNode extends BfNodeBase,
    TRequiredProps extends BfEdgeBaseProps = BfEdgeBaseProps,
    TOptionalProps extends Record<string, unknown> = Record<string, unknown>,
  >(
    cv: BfCurrentViewer,
    _targetNode: TTargetNode,
    SourceClass: TSourceClass,
    targetId: BfGid,
    propsToQuery: Partial<TRequiredProps & TOptionalProps> = {},
  ): Promise<Array<InstanceType<TSourceClass>>> {
    const sources: Array<InstanceType<TSourceClass>> = [];

    // Filter edges that match the target ID and optionally the role
    const matchingEdges = Array.from(inMemoryEdges.values()).filter((edge) => {
      let matches = edge.targetId === targetId;

      // Match source class name if specified
      matches = matches && (edge.sourceClassName === SourceClass.name);

      // Match props if specified (like role)
      if (propsToQuery.role !== undefined) {
        matches = matches && edge.role === propsToQuery.role;
      }

      return matches;
    });

    // Find the source nodes
    for (const edge of matchingEdges) {
      try {
        const source = await SourceClass.findX(
          cv,
          edge.sourceId,
        ) as InstanceType<TSourceClass>;
        if (source) {
          sources.push(source);
        }
      } catch (error) {
        logger.error(`Error finding source node: ${error}`);
      }
    }

    return sources;
  }

  /**
   * Query target instances connected to a source node
   */
  static override async queryTargetInstances<
    TSourceNode extends BfNodeBase,
    TTargetProps extends BfNodeBaseProps,
    TEdgeProps extends BfEdgeBaseProps,
    TTargetClass extends typeof BfNodeBase<TTargetProps>,
  >(
    cv: BfCurrentViewer,
    _sourceNode: TSourceNode,
    TargetClass: TTargetClass,
    sourceId: BfGid,
    propsToQuery: Partial<TTargetProps>,
    edgePropsToQuery: Partial<TEdgeProps> = {},
  ): Promise<Array<InstanceType<TTargetClass>>> {
    const targets: Array<InstanceType<TTargetClass>> = [];

    // Filter edges that match the source ID and optionally the role
    const matchingEdges = Array.from(inMemoryEdges.values()).filter((edge) => {
      let matches = edge.sourceId === sourceId;

      // Match target class name if specified
      matches = matches && (edge.targetClassName === TargetClass.name);

      // Match edge props if specified (like role)
      if (edgePropsToQuery.role !== undefined) {
        matches = matches && edge.role === edgePropsToQuery.role;
      }

      return Promise.resolve(matches);
    });

    // Find the target nodes
    for (const edge of matchingEdges) {
      try {
        const target = await TargetClass.findX(
          cv,
          edge.targetId,
        ) as InstanceType<TTargetClass>;

        // Match target props if specified
        let include = true;
        for (const [key, value] of Object.entries(propsToQuery)) {
          if (target.props[key as keyof typeof target.props] !== value) {
            include = false;
            break;
          }
        }

        if (include) {
          targets.push(target);
        }
      } catch (error) {
        logger.error(`Error finding target node: ${error}`);
      }
    }

    return targets;
  }

  /**
   * Query all source edges connected to a node
   */
  static override querySourceEdgesForNode<
    TProps extends BfEdgeBaseProps,
    TSourceClass extends typeof BfNodeBase,
  >(
    node: BfNodeBase,
    SourceClass: TSourceClass,
  ) {
    return Promise.resolve(
      Array.from(inMemoryEdges.values()).filter((edge) =>
        edge.targetId === node.metadata.bfGid &&
        (SourceClass ? edge.sourceClassName === SourceClass.name : true)
      ) as Array<BfEdgeBase<TProps, BfMetadataEdgeBase>>,
    );
  }
  /**
   * Query all target edges connected to a node
   */
  static override queryTargetEdgesForNode<
    TProps extends BfEdgeBaseProps,
    TTargetClass extends typeof BfNodeBase,
  >(
    node: BfNodeBase,
    TargetClass: TTargetClass,
  ) {
    return Promise.resolve(
      Array.from(inMemoryEdges.values()).filter((edge) =>
        edge.sourceId === node.metadata.bfGid &&
        (TargetClass ? edge.targetClassName === TargetClass.name : true)
      ) as Array<BfEdgeBase<TProps, BfMetadataEdgeBase>>,
    );
  }

  /**
   * Delete all edges touching a specific node
   */
  // static override async deleteEdgesTouchingNode(
  //   cv: BfCurrentViewer,
  //   id: BfGid,
  // ): Promise<void> {
  //   // Find all edges that touch this node and delete them
  //   const edgesToDelete: string[] = [];

  //   inMemoryEdges.forEach((edge, key) => {
  //     if (edge.sourceId === id || edge.targetId === id) {
  //       edgesToDelete.push(key);
  //     }
  //   });

  //   // Delete the edges
  //   for (const key of edgesToDelete) {
  //     inMemoryEdges.delete(key);
  //   }

  //   logger.debug(`Deleted ${edgesToDelete.length} edges touching node ${id}`);
  // }

  // /**
  //  * Delete this edge and check if the target node should also be deleted
  //  */
  // override deleteAndCheckForNetworkDelete(): Promise<void> {
  //   const key = `${this.sourceId}:${this.targetId}:${this.role}`;

  //   // Delete this edge
  //   inMemoryEdges.delete(key);

  //   logger.debug(`Deleted edge ${key}`);

  //   // Note: In a real implementation, you might check if the target node
  //   // should also be deleted based on business rules (e.g., if it has no other connections)
  //   return Promise.resolve();
  // }

  /**
   * Save edge to memory
   */
  override save(): Promise<this> {
    const key = `${this.sourceId}:${this.targetId}:${this.role}`;
    inMemoryEdges.set(key, this);
    return Promise.resolve(this);
  }

  /**
   * Delete edge from memory
   */
  override delete(): Promise<boolean> {
    const key = `${this.sourceId}:${this.targetId}:${this.role}`;
    return Promise.resolve(inMemoryEdges.delete(key));
  }

  /**
   * Clear all in-memory edges (useful for testing)
   */
  static clearAll(): void {
    inMemoryEdges.clear();
  }
}
