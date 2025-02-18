import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import type { RouteEntrypoint } from "packages/app/routes.ts";
import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

enum _SubPages {
  EVENTS = "events",
}

export const EntrypointTwitterIdeatorWorkshopPermalink = iso(`
  field Query.EntrypointTwitterIdeatorWorkshopPermalink {
  # field Query.EntrypointTwitterIdeatorWorkshopPermalink($eventSlug: String) {
    me {
      asBfCurrentViewerLoggedIn {
        __typename
      }
    }
  }
`)(
  function EntrypointTwitterIdeatorWorkshopPermalink(
    { data },
  ): RouteEntrypoint {
    let Body;

    Body ??= data?.me?.asBfCurrentViewerLoggedIn?.storyBank?.CreateVoice;
    Body ??= () => null;

    // a future api suggestion:
    // if (Body == null) {
    //   return { redirectToLogin: true };
    // }
    return { Body, title: "Twitter Voice" };
  },
);
