import { iso } from "packages/app/__generated__/__isograph/iso.ts";

export const CreateVoice = iso(`
  field BfStoryBank.CreateVoice @component {
     __typename
     

  }
`)(function CreateVoice({ data }) {
  return <div>CreateVoice {data.__typename}</div>;
});
