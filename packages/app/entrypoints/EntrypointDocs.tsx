import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import type { RouteEntrypoint } from "packages/app/routes.ts";

export const EntrypointDocs = iso(`
  field Query.EntrypointDocs {
    __typename
  }
`)(function EntrypointDocs(): RouteEntrypoint {
  return {
    Body: () => (
      <div className="docs-container">
        <div>Docs coming soon</div>
      </div>
    ),
    title: "Documentation",
  };
});
