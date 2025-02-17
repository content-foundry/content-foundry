
import { BfNode } from "packages/bfDb/coreModels/BfNode.ts";
import type { BfNodeBaseProps } from "packages/bfDb/classes/BfNodeBase.ts";

interface BfStoryBankProps extends BfNodeBaseProps {
  voiceProfile: string;
}

export class BfStoryBank extends BfNode<BfStoryBankProps> {

}
