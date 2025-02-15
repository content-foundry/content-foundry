import { iso } from "packages/app/__generated__/__isograph/iso.ts";

export const DocsList = iso(`
  field BfDocs.DocsList @component {
    posts {
      nodes {
        DocsPostListItem
        status
        title
        summary
      }
    }
  }
`)(function DocsList({ data }) {
  const nodes = data?.posts?.nodes ?? [];
  const docsListItems = nodes
    .map((node) =>
      node && (
        <div key={node.title} className="docs-list-section">
          <div className="docs-list-header">
            <h2>{node.title}</h2>
            {node.status && <span className="docs-status">{node.status}</span>}
          </div>
          {node.summary && <p className="docs-summary">{node.summary}</p>}
          <node.DocsPostListItem />
        </div>
      )
    )
    .filter(Boolean);

  return (
    <div className="docs-list">
      {docsListItems.length > 0
        ? docsListItems
        : <div>No documentation found</div>}
    </div>
  );
});
