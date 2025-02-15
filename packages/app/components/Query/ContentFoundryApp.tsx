import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

export const ContentFoundryApp = iso(`
  field Query.ContentFoundryApp @component {
    __typename
    me {
      asBfCurrentViewerLoggedIn {
        LoggedInView
      }
      asBfCurrentViewerLoggedOut {
        LoggedOutView
      }
    }
  }
`)(function ContentFoundryApp({ data }) {
  const Component = data?.me?.asBfCurrentViewerLoggedIn?.LoggedInView ??
    data?.me?.asBfCurrentViewerLoggedOut?.LoggedOutView ?? (() =>
      "Who are you even");

  return <Component />;
});
