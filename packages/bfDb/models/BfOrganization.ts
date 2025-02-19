import { getLogger } from "packages/logger.ts";
import { BfNode } from "packages/bfDb/coreModels/BfNode.ts";
import type { JSONValue } from "packages/bfDb/bfDb.ts";

const _logger = getLogger(import.meta);

type Props = {
  identity?: Record<string, JSONValue>;
  research: Record<string, JSONValue>;
  creation: Record<string, JSONValue>;
  distribution: Record<string, JSONValue>;
  analytics: Record<string, JSONValue>;
};

export class BfOrganization extends BfNode<Props> {
}
