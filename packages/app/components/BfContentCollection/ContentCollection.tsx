import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { getLogger } from "packages/logger.ts";
import { useFeatureFlagEnabled } from "packages/app/hooks/useFeatureFlagHooks.ts";

const _logger = getLogger(import.meta);

export const ContentCollection = iso(`
  field BfContentCollection.ContentCollection @component {
    __typename
    items {
      ContentItem
      id
    }
  }
`)(function ContentCollection({ data }) {
  const collection = data;
  const items = collection?.items || [];
  const showExtendedContent = useFeatureFlagEnabled("show_extended_content");

  if (!collection) {
    return <div className="content-collection-empty">Collection not found</div>;
  }

  if (items.length === 0) {
    return (
      <div className="content-collection-empty">No content items found</div>
    );
  }

  const _itemElements = items
    .map((item) => item && <item.ContentItem key={item.id} />)
    .filter(Boolean) as React.ReactNode[];

  return (
    <div className="loginBox">
      {collection && showExtendedContent
        ? (
          <div className="content-collection">
            <div className="content-items">
              {items.length > 0
                ? (
                  items.map((_item, index) => (
                    <div key={index} className="content-item">
                      {/* <h3 className="content-item-title">{item?.title}</h3> */}
                      {/* <p className="content-item-body">{item?.body}</p> */}
                      <a
                        href=""
                        className="content-item-link"
                      >
                        Read more
                      </a>
                    </div>
                  ))
                )
                : <p>No content items available.</p>}
            </div>
          </div>
        )
        : <p>Coming soon.</p>}
    </div>
  );
});
