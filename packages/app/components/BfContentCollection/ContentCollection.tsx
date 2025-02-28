import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { use } from "react";
import { getLogger } from "packages/logger.ts";
import { BfIsographFragmentReader } from "lib/BfIsographFragmentReader.tsx";
import { useFeatureFlagEnabled } from "packages/app/hooks/useFeatureFlagHooks.ts";

const logger = getLogger(import.meta);

function useContentItem(path: string | null, showContent: boolean) {
  if (path && showContent) {
    const Component = use(getComponent(path));
    return <Component />;
  }
  return null;
}

function getComponent(
  path: string,
): Promise<React.FC> {
  let gettablePath = `build/content${path}`;
  if (typeof Deno === "undefined") {
    const regexForMdAndMdx = /\.mdx?$/;
    gettablePath = `/static/${gettablePath.replace(regexForMdAndMdx, ".js")}`;
  }

  return new Promise<React.FC>((resolve) => {
    import(gettablePath).then((module) => {
      resolve(module.default as React.FC);
    }).catch((error) => {
      logger.error(`Error loading content component: ${path}`, error);
      resolve(() => <div>Content could not be loaded</div>);
    });
  });
}

export const ContentCollection = iso(`
  field BfContentCollection.ContentCollection @component {
    __typename
      items {
        title
      }
    }
`)(function ContentCollection({ data }) {
  const collection = data
  const items = collection?.items || [];
  const showExtendedContent = useFeatureFlagEnabled("show_extended_content");

  if (!collection) {
    return <div className="content-collection-empty">Collection not found</div>;
  }

  return (
    <div className="loginBox">
      {collection && showExtendedContent
        ? (
          <div className="content-collection">
            <div className="content-items">
              {items.length > 0
                ? (
                  items.map((item, index) => (
                    <div key={index} className="content-item">
                      {/* <h3 className="content-item-title">{item?.title}</h3> */}
                      {/* <p className="content-item-body">{item?.body}</p> */}
                      <a
                        href={""}
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
