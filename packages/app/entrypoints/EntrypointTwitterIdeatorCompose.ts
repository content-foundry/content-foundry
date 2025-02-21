import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import type { RouteEntrypoint } from "packages/app/routes.ts";
import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

export const EntrypointTwitterIdeatorCompose = iso(`
  field Query.EntrypointTwitterIdeatorCompose {
    me {
      organization {
        SimpleComposer
      }
    }
  }
`)(
  function EntrypointTwitterIdeatorCompose(
    { data },
  ): RouteEntrypoint {
    return {
      Body: data?.me?.organization?.SimpleComposer,
      title: "Twitter Simple Composer",
    };
  },
);
