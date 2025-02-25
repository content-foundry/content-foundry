// packages/bfDb/classes/BfEdgeBase.ts

import {
  type BfMetadataBase,
  BfNodeBase,
  type BfNodeBaseProps,
} from "packages/bfDb/classes/BfNodeBase.ts";
import type { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { getLogger } from "packages/logger.ts";

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
}
