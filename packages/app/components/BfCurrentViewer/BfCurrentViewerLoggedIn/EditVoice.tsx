import { iso } from "packages/app/__generated__/__isograph/iso.ts";

export const EditVoice = iso(`
  field BfCurrentViewerLoggedIn.EditVoice @component {
     storyBank {
       __typename
     }
     

  }
`)(function EditVoice({ data }) {
  const hasVoice = data?.storyBank?.__typename;
  if (!hasVoice) {
    return "SHHHH";
  }
  return <div>EditVoice {data?.storyBank?.__typename}</div>;
});
