import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import type { RouteEntrypoint } from "packages/app/routes.ts";

export const EntrypointContentFoundryApp = iso(`
  field Query.EntrypointContentFoundryApp {
    me {
      asBfCurrentViewerLoggedIn {
        LoggedInView
      }
      asBfCurrentViewerLoggedOut {
        LoggedOutView
      }
    }
  }
`)(function EntrypointContentFoundryApp({ data }): RouteEntrypoint {
  const Body = data?.me?.asBfCurrentViewerLoggedIn?.LoggedInView ?? data?.me?.asBfCurrentViewerLoggedOut?.LoggedOutView;
  if (Body == null) {
    throw new Error("No Body found");
  }
  return { Body, title: "Content Foundry" };
});
