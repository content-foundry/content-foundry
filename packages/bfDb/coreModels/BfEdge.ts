import type { BfMetadataNode } from "packages/bfDb/coreModels/BfNode.ts";
import { getLogger } from "packages/logger.ts";
import type {
  BfEdgeBaseProps,
  BfMetadataEdgeBase,
} from "packages/bfDb/classes/BfEdgeBase.ts";
import type { BfNodeBaseProps } from "packages/bfDb/classes/BfNodeBase.ts";

const _logger = getLogger(import.meta);

export type BfEdgeProps = BfEdgeBaseProps & BfNodeBaseProps;

// Combine metadata from both BfNode (for DB) and BfEdgeBase (for edge structure)
export type BfMetadataEdge = BfMetadataNode & BfMetadataEdgeBase;
