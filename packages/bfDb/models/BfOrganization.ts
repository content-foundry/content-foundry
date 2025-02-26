import { getLogger } from "packages/logger.ts";
import { BfNode } from "packages/bfDb/coreModels/BfNode.ts";
import type { JSONValue } from "packages/bfDb/bfDb.ts";

const _logger = getLogger(import.meta);

type Props = {
  identity?: {
    twitter?: {
      handle?: string | null;
      name?: string | null;
      imgUrl?: string | null;
    } | null;
    voice?: {
      voice?: string | null;
      voiceSummary?: string | null;
    } | null;
  } | null;
  research?: {
    topics?:
      | Array<{
        name: string;
        entries: Array<{
          type: string;
          name: string;
          summary: string;
          url: string;
        }>;
      }>
      | null;
  } | null;
  creation?: {
    originalText?: string | null;
    suggestions?:
      | Array<{
        tweet: string;
        explanation: string;
      }>
      | null;
    draftBlog?: string | null;
    revisions?:
      | Array<{
        revisionTitle: string;
        original: string;
        revised: string;
        explanation: string;
      }>
      | null;
  };
  distribution?: Record<string, JSONValue>;
  analytics?: Record<string, JSONValue>;
};

export class BfOrganization extends BfNode<Props> {
}
