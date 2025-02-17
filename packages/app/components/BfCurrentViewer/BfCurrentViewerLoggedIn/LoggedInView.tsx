import { iso } from "packages/app/__generated__/__isograph/iso.ts";

export const LoggedInView = iso(`
  field BfCurrentViewerLoggedIn.LoggedInView @component {
    __typename
    TwitterIdeator
    
  }
`)(function LoggedInView({ data }) {
  return <data.TwitterIdeator />;
});
