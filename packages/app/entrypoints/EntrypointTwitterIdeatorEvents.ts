import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import type { RouteEntrypoint } from "packages/app/routes.ts";
import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

enum _SubPages {
  EVENTS = "events",
}

export const EntrypointTwitterIdeatorEvents = iso(`
  field Query.EntrypointTwitterIdeatorEvents {
    me {
      organization {
        Research
      }
    }
  }
`)(
  function EntrypointTwitterIdeatorEvents(
    { data },
  ): RouteEntrypoint {
    return {
      Body: data?.me?.organization?.Research,
      title: "Twitter Research",
    };
  },
);
