import {
  type BfMetadataNode,
  BfNode,
} from "packages/bfDb/coreModels/BfNode.ts";
import type { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import { getLogger } from "packages/logger.ts";
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import type {
  BfEdgeBaseProps,
  BfMetadataEdgeBase,
} from "packages/bfDb/classes/BfEdgeBase.ts";
import type { BfNodeBaseProps } from "packages/bfDb/classes/BfNodeBase.ts";

const logger = getLogger(import.meta);

export type BfEdgeProps = BfEdgeBaseProps & BfNodeBaseProps;

// Combine metadata from both BfNode (for DB) and BfEdgeBase (for edge structure)
export type BfMetadataEdge = BfMetadataNode & BfMetadataEdgeBase;

/**
 * BfEdge: Database-backed edge record in bfdb
 *
 * This class uses composition to combine the database functionality from BfNode
 * with the edge-specific structure from BfEdgeBase
 */
export class BfEdge extends BfNode<BfEdgeProps, BfMetadataEdge> {
  /**
   * Creates an edge between two existing BfNodes, storing bf_sid / bf_tid so that
   * you can later find "neighbors" or "connected nodes" in the bfdb table.
   */
  /**
   * Creates an edge between two existing BfNodes, storing bf_sid / bf_tid so that
   * you can later find "neighbors" or "connected nodes" in the bfdb table.
   */
  static async createBetweenNodes<
    T extends typeof BfEdge = typeof BfEdge,
    S extends BfNode = BfNode,
    U extends BfNode = BfNode,
  >(
    this: T, // Using TypeScript "this type" pattern
    cv: BfCurrentViewer,
    sourceNode: S,
    targetNode: U,
    role = "",
  ): Promise<InstanceType<T>> {
    logger.debug(`${this.name}.createBetweenNodes`, {
      sourceId: sourceNode.metadata.bfGid,
      sourceClass: sourceNode.metadata.className,
      targetId: targetNode.metadata.bfGid,
      targetClass: targetNode.metadata.className,
      role,
    });

    const partialMetadata: Partial<BfMetadataEdge> = {
      bfSid: sourceNode.metadata.bfGid,
      bfSClassName: sourceNode.metadata.className,
      bfTid: targetNode.metadata.bfGid,
      bfTClassName: targetNode.metadata.className,
    };

    // Put whatever you need in props:
    const props = { role } as BfEdgeProps;

    // Use this.__DANGEROUS__createUnattached to support inheritance properly
    return await this.__DANGEROUS__createUnattached(
      cv,
      props,
      partialMetadata,
    ) as InstanceType<T>;
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
   * Find an edge by source and target nodes, supporting subclass return types
   */
  static async findBySourceAndTarget<
    T extends typeof BfEdge = typeof BfEdge,
    S extends BfNode = BfNode,
    U extends BfNode = BfNode,
  >(
    this: T,
    cv: BfCurrentViewer,
    sourceNode: S,
    targetNode: U,
    role = "",
  ): Promise<InstanceType<T> | null> {
    // Query using bfdb functions
    const metadata: Partial<BfMetadataEdge> = {
      bfSid: sourceNode.metadata.bfGid,
      bfTid: targetNode.metadata.bfGid,
      bfOid: cv.bfOid,
      className: this.name, // Ensure we only get instances of this class
    };

    const props = { role };

    const edges = await this.query(cv, metadata, props) as Array<
      InstanceType<T>
    >;

    return edges.length > 0 ? edges[0] : null;
  }

  /**
   * Find edges by source node, supporting subclass return types
   */
  static async findBySource<
    T extends typeof BfEdge = typeof BfEdge,
    S extends BfNode = BfNode,
  >(
    this: T,
    cv: BfCurrentViewer,
    sourceNode: S,
    targetClassName?: string,
    role = "",
  ): Promise<Array<InstanceType<T>>> {
    // Query using bfdb functions
    const metadata: Partial<BfMetadataEdge> = {
      bfSid: sourceNode.metadata.bfGid,
      bfOid: cv.bfOid,
      className: this.name, // Ensure we only get instances of this class
    };

    if (targetClassName) {
      metadata.bfTClassName = targetClassName;
    }

    const props = { role };

    return await this.query(cv, metadata, props) as Array<InstanceType<T>>;
  }

  /**
   * Find edges by target node, supporting subclass return types
   */
  static async findByTarget<
    T extends typeof BfEdge = typeof BfEdge,
    U extends BfNode = BfNode,
  >(
    this: T,
    cv: BfCurrentViewer,
    targetNode: U,
    sourceClassName?: string,
    role = "",
  ): Promise<Array<InstanceType<T>>> {
    // Query using bfdb functions
    const metadata: Partial<BfMetadataEdge> = {
      bfTid: targetNode.metadata.bfGid,
      bfOid: cv.bfOid,
      className: this.name, // Ensure we only get instances of this class
    };

    if (sourceClassName) {
      metadata.bfSClassName = sourceClassName;
    }

    const props = { role };

    return await this.query(cv, metadata, props) as Array<InstanceType<T>>;
  }
}
