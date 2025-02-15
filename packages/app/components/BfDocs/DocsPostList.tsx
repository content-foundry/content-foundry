import { iso } from "packages/app/__generated__/__isograph/iso.ts";

export const DocsPostList = iso(`
  field BfDocs.DocsPostList {
     __typename
     posts {
       nodes {
          DocsPostListItem
       }
     }
  }
`)(function DocsPostList({ data }) {
  const nodes = data?.nodes ?? [];
  const docsPostListItems = nodes.map((node) => (
    <div className="docs-page-list-item" key={node.slug}>
      <div className="docs-page-item-info">
        <div className="docs-list-item-title">
          {node.title}
          {node.status && (
            <span className="docs_status_tag">{node.status}</span>
          )}
        </div>
        <div className="docs-list-item-summary">{node.summary}</div>
      </div>
    </div>
  ));

  return docsPostListItems.length > 0
    ? docsPostListItems
    : <div>No documentation found</div>;
});
