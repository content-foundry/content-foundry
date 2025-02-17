import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import type { RouteEntrypoint } from "packages/app/routes.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

export const EntrypointTwitter = iso(`
  field Query.EntrypointTwitter {
    me {
      asBfCurrentViewerLoggedIn {
        TwitterIdeator
      }
    }
  }
`)(function EntrypointTwitter({ data }): RouteEntrypoint {
  const Body = data?.me?.asBfCurrentViewerLoggedIn?.TwitterIdeator;
  if (Body == null) {
    // @ts-expect-error #NOCOMMIT FIX THIS PLS
    return { redirectToLogin: true}
  }
  return { Body, title: "Twitter Voice" };
});
