import {
  type BfMetadataNode,
  BfNode,
} from "packages/bfDb/coreModels/BfNode.ts";
import type { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import { getLogger } from "packages/logger.ts";
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import type { BfMetadataBase } from "packages/bfDb/classes/BfNodeBase.ts";

const logger = getLogger(import.meta);

export type BfEdgeProps = {
  /**
   * Optional label for the relationship
   */
  role?: string;
};

export type BfMetadataEdge = BfMetadataBase & BfMetadataNode & {
  /** Source ID */
  bfSid: BfGid;
  bfSClassName: string;
  /** Target ID */
  bfTid: BfGid;
  bfTClassName: string;
};
/**
 * BfEdge: minimal “edge” record in bfdb
 */
export class BfEdge extends BfNode<BfEdgeProps, BfMetadataEdge> {
  /**
   * Creates an edge between two existing BfNodes, storing bf_sid / bf_tid so that
   * you can later find “neighbors” or “connected nodes” in the bfdb table.
   */
  static async createBetweenNodes<
    TSourceBfNode extends BfNode,
    TTargetBfNode extends BfNode,
  >(
    this: typeof BfEdge,
    cv: BfCurrentViewer,
    sourceNode: TSourceBfNode,
    targetNode: TTargetBfNode,
    role?: string,
  ): Promise<BfEdge> {
    logger.debug("BfEdge.createBetweenNodes", {
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
    const props: BfEdgeProps = { role };

    // Actually creates the new BfEdge record in bfdb
    return await this.__DANGEROUS__createUnattached(cv, props, partialMetadata);
  }
}
