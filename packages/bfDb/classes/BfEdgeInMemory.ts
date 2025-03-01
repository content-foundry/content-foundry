import {
  BfEdgeBase,
  type BfEdgeBaseProps,
  type BfMetadataEdgeBase,
} from "packages/bfDb/classes/BfEdgeBase.ts";
import type { BfNodeBase } from "packages/bfDb/classes/BfNodeBase.ts";
import type { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

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
  // In-memory storage for edges
  private static inMemoryEdges: Map<string, BfEdgeInMemory> = new Map();

  /**
   * Creates an edge between two nodes and stores it in memory
   *
   * @param cv - The current viewer context
   * @param sourceNode - The source node to connect from
   * @param targetNode - The target node to connect to
   * @param role - Optional role/label for the edge relationship
   * @returns A new BfEdgeInMemory instance representing the edge
   */
  static override async createBetweenNodes<
    T extends typeof BfEdgeInMemory = typeof BfEdgeInMemory,
    S extends BfNodeBase = BfNodeBase,
    U extends BfNodeBase = BfNodeBase,
  >(
    this: T,
    cv: BfCurrentViewer,
    sourceNode: S,
    targetNode: U,
    role = "",
  ): Promise<InstanceType<T>> {
    // Use the superclass implementation to create the edge
    const edge = await super.createBetweenNodes(
      cv,
      sourceNode,
      targetNode,
      role,
    ) as InstanceType<T>;

    // Store the edge in memory using a composite key of source and target IDs
    const key =
      `${sourceNode.metadata.bfGid}-${targetNode.metadata.bfGid}-${role}`;
    this.inMemoryEdges.set(key, edge as unknown as BfEdgeInMemory);

    return edge;
  }

  override save(): Promise<this> {
    // For in-memory implementation, just return this instance
    // No persistence needed as everything is already in memory
    return Promise.resolve(this);
  }

  override delete() {
    // Find the key for this edge
    for (const [key, edge] of BfEdgeInMemory.inMemoryEdges.entries()) {
      if (edge.metadata.bfGid === this.metadata.bfGid) {
        // Remove the edge from memory
        BfEdgeInMemory.inMemoryEdges.delete(key);
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }

  override load() {
    // For in-memory implementation, nothing needs to be loaded
    // The edge is already in memory
    return Promise.resolve(this);
  }

  /**
   * Gets all in-memory edges
   *
   * @returns Array of all edges stored in memory
   */
  static getAllInMemoryEdges(): BfEdgeInMemory[] {
    return Array.from(this.inMemoryEdges.values());
  }

  /**
   * Clears all in-memory edges
   */
  static clearInMemoryEdges(): void {
    this.inMemoryEdges.clear();
  }
}
