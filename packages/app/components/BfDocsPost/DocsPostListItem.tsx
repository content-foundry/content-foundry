import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { RouterLink } from "packages/app/components/Router/RouterLink.tsx";

export const DocsPostListItem = iso(`
  field BfDocsPost.DocsPostListItem @component {
    title
    id
    summary
    author
    status
    href
  }
`)(function DocsPostListItem({ data }) {
  if (!data) return null;

  return (
    <article className="docs-post-item">
      <h3 className="docs-post-title">
        <RouterLink to={data.href ?? "/docs/" + data.id}>
          {data.title || "Untitled Documentation"}
        </RouterLink>
      </h3>
      {data.author && <div className="docs-post-author">By {data.author}</div>}
      {data.summary && <p className="docs-post-summary">{data.summary}</p>}
      {data.status && (
        <div className="docs-post-status">
          <span className={`status-${data.status.toLowerCase()}`}>
            {data.status}
          </span>
        </div>
      )}
    </article>
  );
});
