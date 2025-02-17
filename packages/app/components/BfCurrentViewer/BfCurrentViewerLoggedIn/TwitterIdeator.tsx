import { iso } from "packages/app/__generated__/__isograph/iso.ts";
// import { TwitterHome } from "packages/app/components/TwitterIdeator/TwitterHome.tsx";
import { useState } from "react";
// import { CreateTwitterIdeator } from "packages/app/components/TwitterIdeator/CreateTwitterIdeator.tsx";

export const TwitterIdeator = iso(`
  field BfCurrentViewerLoggedIn.TwitterIdeator @component {
    __typename
    TwitterIdeator_CreateTwitterVoice
    TwitterIdeator_Home
  }
`)(function TwitterIdeator({ data }) {
  const showVoiceCreator = false;
  return showVoiceCreator ? <data.TwitterIdeator_CreateTwitterVoice /> : <data.TwitterIdeator_Home />;
});
