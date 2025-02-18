import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import type { RouteEntrypoint } from "packages/app/routes.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

enum SubPages {
  EVENTS = "events"
}

export const EntrypointTwitterIdeator = iso(`
  field Query.EntrypointTwitterIdeator {
  # field Query.EntrypointTwitterIdeator($eventSlug: String) {
    me {
      asBfCurrentViewerLoggedIn {
        storyBank {
          __typename
          # TwitterIdeator_Workshopping
          # twitterVoice(eventSlug: $eventSlug) {
            # TwitterIdeator_CurrentEvents
            # TwitterIdeator_CurrentEvent(slug: $eventSlug)
          # }
          # TwitterIdeator_CreateVoice
        }
      }
    }
  }
`)(function EntrypointTwitterIdeator({ data, parameters }): RouteEntrypoint {
  logger.info("shitfuck", parameters)
  const { twitterSubpage } = parameters;
  let Body = () => data?.me?.asBfCurrentViewerLoggedIn?.storyBank?.__typename ?? "null";
  
  
  // a future api suggestion:
  // if (Body == null) {
  //   return { redirectToLogin: true };
  // }
  return { Body, title: "Twitter Voice" };
});
