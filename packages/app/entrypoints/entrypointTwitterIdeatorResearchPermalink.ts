import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import type { RouteEntrypoint } from "packages/app/routes.ts";
import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

enum _SubPages {
  RESEARCH = "research",
}

export const entrypointTwitterIdeatorResearchPermalink = iso(`
  field Query.entrypointTwitterIdeatorResearchPermalink {
  # field Query.entrypointTwitterIdeatorResearchPermalink($researchSlug: String) {
    me {
      asBfCurrentViewerLoggedIn {
        __typename
      }
    }
  }
`)(
  function entrypointTwitterIdeatorResearchPermalink(
    { data, parameters },
  ): RouteEntrypoint {
    const { _twitterSubpage } = parameters;
    let Body;

    Body ??= data?.me?.asBfCurrentViewerLoggedIn?.storyBank?.CreateVoice;
    Body ??= () => null;

    // a future api suggestion:
    // if (Body == null) {
    //   return { redirectToLogin: true };
    // }
    return { Body, title: "Twitter Research" };
  },
);
