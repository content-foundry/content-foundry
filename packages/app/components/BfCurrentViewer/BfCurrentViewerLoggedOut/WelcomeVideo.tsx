import { iso } from "packages/app/__generated__/__isograph/iso.ts";

export const WelcomeVideo = iso(`
  field BfCurrentViewerLoggedOut.WelcomeVideo @component {
    __typename
  }
`)(function WelcomeVideo() {
  return <div className="videoPlayer">I'm a video player</div>;
});
