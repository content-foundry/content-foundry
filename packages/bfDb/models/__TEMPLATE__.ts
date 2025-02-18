import { getLogger } from "packages/logger.ts";
import { BfNode } from "packages/bfDb/coreModels/BfNode.ts";

const _logger = getLogger(import.meta);

type Props = {
  name: string;
};

export class Bf$1 extends BfNode<Props> {}
