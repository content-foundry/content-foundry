import { iso } from "packages/app/__generated__/__isograph/iso.ts";

export const Docs = iso(`
  field BfCurrentViewer.Docs @component {
    docs {
     DocsList
    }
  }
`)(function Docs({ data }) {
  const DocsList = data?.docs?.DocsList;

  return (
    DocsList ? <DocsList /> : <div>Documentation coming soon!</div>
  );
});
