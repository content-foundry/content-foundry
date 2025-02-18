
import { BfNode } from "packages/bfDb/coreModels/BfNode.ts";
import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

export type BfStoryBankProps = {
  twitterVoiceProps: {
    celebrityVoices: string[];
    description: string;
  };
};

export class BfStoryBank extends BfNode<BfStoryBankProps> {
}
