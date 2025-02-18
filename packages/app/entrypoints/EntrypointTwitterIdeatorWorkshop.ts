import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import type { RouteEntrypoint } from "packages/app/routes.ts";
import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

enum _SubPages {
  EVENTS = "events",
}

export const EntrypointTwitterIdeatorWorkshop = iso(`
  field Query.EntrypointTwitterIdeatorWorkshop {
  # field Query.EntrypointTwitterIdeatorWorkshop($eventSlug: String) {
    me {
      asBfCurrentViewerLoggedIn {
        __typename
      }
    }
  }
`)(
  function EntrypointTwitterIdeatorWorkshop(
    { parameters },
  ): RouteEntrypoint {
    const { _twitterSubpage } = parameters;
    let Body; // Changed from const to let

    // Body ??= data?.me?.asBfCurrentViewerLoggedIn?.storyBank?.CreateVoice
    Body ??= () => null;

    return { Body, title: "Twitter Voice" };
  },
);
