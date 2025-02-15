import { BfNode } from "packages/bfDb/coreModels/BfNode.ts";
import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

type BfOrganizationProps = {
  name: string;
};

/**
 * @class BfOrganization
 * @description A BfOrganization is a collection of BfUsers, and is linked through BfAccount to BfUser.
 */
export class BfOrganization extends BfNode<BfOrganizationProps> {
}
