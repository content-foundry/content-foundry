import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { CfLogo } from "packages/app/resources/CfLogo.tsx";
import { useFeatureFlagEnabled } from "packages/app/hooks/useFeatureFlagHooks.ts";

export const Home = iso(`
  field BfCurrentViewer.Home @component {
    __typename
    # Isograph bug preventing string literals
    contentCollection(slug: "marketing") {
      items {
            title
            body
            href
      }
    }
  }
`)(function Home({ data }) {
  // Extract content items from the data
  const collection = data?.contentCollection;
  const contentItems = collection?.items || [];
  const showExtendedContent = useFeatureFlagEnabled("show_extended_content");

  return (
    <div className="appPage flexCenter">
      <div className="appHeader">
        <div className="appHeaderCenter">
          <div className="appHeaderWelcomer">
            Welcome to
          </div>
          <div className="appHeaderLogo">
            <CfLogo boltColor="blpack" foundryColor="black" />
          </div>
        </div>
      </div>

      <div className="loginBox">
        {collection && showExtendedContent
          ? (
            <div className="content-collection">
              <div className="content-items">
                {contentItems.length > 0
                  ? (
                    contentItems.map((item, index) => (
                      <div key={index} className="content-item">
                        <h3 className="content-item-title">{item?.title}</h3>
                        <p className="content-item-body">{item?.body}</p>
                        <a
                          href={item?.href ?? ""}
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
    </div>
  );
});
