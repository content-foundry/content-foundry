import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import type { RouteEntrypoint } from "packages/app/routes.ts";

export const EntrypointDocs = iso(`
  field Query.EntrypointDocs {
    me {
      docs {
        DocsList
      }
    }
  }
`)(function EntrypointDocs({ data }): RouteEntrypoint {
  const DocsList = data?.me?.docs?.DocsList;
  return {
    Body: () => (
      <div className="docs-container">
        {DocsList ? <DocsList /> : <div>DocsList docs not found</div>}
      </div>
    ),
    title: "Documentation",
  };
});
