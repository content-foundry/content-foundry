import { iso } from "packages/app/__generated__/__isograph/iso.ts";

export const CreateTwitterVoice = iso(`
  field BfCurrentViewerLoggedIn.TwitterIdeator_CreateTwitterVoice @component {
    __typename
    TwitterIdeator_CreateStep1
    TwitterIdeator_CreateStep2
  }
`)(function CreateTwitterVoice({ data }) {
  const step1 = false;
  return step1
    ? <data.TwitterIdeator_CreateStep1 />
    : <data.TwitterIdeator_CreateStep2 />;
});
