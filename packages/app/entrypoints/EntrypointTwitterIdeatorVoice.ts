import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import type { RouteEntrypoint } from "packages/app/routes.ts";
import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

export const EntrypointTwitterIdeatorVoice = iso(`
  field Query.EntrypointTwitterIdeatorVoice {
  # field Query.EntrypointTwitterIdeatorVoice($eventSlug: String) {
    me {
      asBfCurrentViewerLoggedIn {
        __typename
      }
    }
  }
`)(
  function EntrypointTwitterIdeatorVoice(
    { data, parameters },
  ): RouteEntrypoint {
    const Body = () => data?.me?.asBfCurrentViewerLoggedIn?.__typename;
    if (!Body) throw new Error("Can't do my thing.");
    return { Body, title: "Twitter Voice" };
  },
);
