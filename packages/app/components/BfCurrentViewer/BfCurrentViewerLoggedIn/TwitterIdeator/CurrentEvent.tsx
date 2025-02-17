import { iso } from "packages/app/__generated__/__isograph/iso.ts";

export const CurrentEvent = iso(`
  field BfCurrentViewerLoggedIn.TwitterIdeator_CurrentEvent @component {
    __typename
  }
`)(function CurrentEvent({ data }) {
  return <div>Individual event - {data.__typename}</div>
});

