import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { RouterLink } from "packages/app/components/Router/RouterLink.tsx";

export const LoggedInView = iso(`
  field BfCurrentViewerLoggedIn.LoggedInView @component {
    __typename
    
  }
`)(function LoggedInView({ data }) {
  return <RouterLink to="/twitter">Go to twitter voice thing</RouterLink>;
});
