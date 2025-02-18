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
       __typename
      }
    }
  }
`)(
  function EntrypointTwitterIdeatorEvents(
    { data, parameters },
  ): RouteEntrypoint {
    const { _twitterSubpage } = parameters;
    const Body = undefined;

    // Body ??= data?.me?.asBfCurrentViewerLoggedIn?.storyBank?.CreateVoice
    Body ??= () => `${data?.me?.organization?.__typename}™`;

    // a future api suggestion:
    // if (Body == null) {
    //   return { redirectToLogin: true };
    // }
    return { Body, title: "Twitter Voice" };
  },
);
