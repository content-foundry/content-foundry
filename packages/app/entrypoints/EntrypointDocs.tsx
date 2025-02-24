import { iso } from "packages/app/__generated__/__isograph/iso.ts";

export const EntrypointDocs = iso(`
  field Query.EntrypointDocs {
    __typename
  }
`)(function EntrypointDocs(){
  return {
    Body: () => (
      <div className="docs-container">
        <div>Docs coming soon</div>
      </div>
    ),
    title: "Documentation",
  };
});
