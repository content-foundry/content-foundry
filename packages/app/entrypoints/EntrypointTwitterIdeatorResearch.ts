import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

enum _SubPages {
  RESEARCH = "research",
}

export const entrypointTwitterIdeatorResearch = iso(`
  field Query.entrypointTwitterIdeatorResearch {
    me {
      organization {
        Research
      }
    }
  }
`)(
  function entrypointTwitterIdeatorResearch(
    { data },
  ) {
    return {
      Body: data?.me?.organization?.Research,
      title: "Twitter Research",
    };
  },
);
