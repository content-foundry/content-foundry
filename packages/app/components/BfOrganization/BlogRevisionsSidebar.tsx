import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
import { useState } from "react";
import { BfDsTabs } from "packages/bfDs/components/BfDsTabs.tsx";

export const BlogRevisionsSidebar = iso(`
  field BfOrganization.BlogRevisionsSidebar @component {
     creation {
       revisions{
         revisionTitle
         original
         instructions
         revision
         explanation
       }
     }
  }
`)(
  function BlogRevisionsSidebar(
    { data },
  ) {
    const [showExplanation, setShowExplanation] = useState(false);
    const tabs = [{ name: "Tips" }, { name: "Suggestions" }];
    return (
      <div className="flexColumn right-side-bar">
        <div className="revisions-container">
          {data?.creation?.revisions?.map((revision, _index) => {
            const [showExpanded, setShowExpanded] = useState(false);
            const [selectedTab, setSelectedTab] = useState("Tips");
            return (
              <div className="revision-item">
                <div className="flexRow">
                  <div className="revision-title">
                    {revision?.revisionTitle ?? ""}
                  </div>
                  <BfDsButton
                    iconLeft={showExpanded ? "arrowDown" : "arrowLeft"}
                    kind="overlay"
                    onClick={() => {
                      setShowExpanded(!showExpanded);
                    }}
                  />
                </div>
                {showExpanded &&
                  (
                    <div className="revision-item">
                      <div>{revision?.original}</div>
                      <div className="flexRow">
                        <BfDsTabs tabs={tabs} onTabSelected={setSelectedTab} />
                      </div>
                      {selectedTab === "Tips"
                        ? <div>{revision?.instructions}</div>
                        : (
                          <div>
                            {revision?.revision}
                            {showExplanation
                              ? (
                                <>
                                  <div className="suggestion-details">
                                    <div className="suggestion-details-close">
                                      <BfDsButton
                                        kind="overlaySuccess"
                                        size="medium"
                                        iconLeft="exclamationCircle"
                                        onClick={() =>
                                          setShowExplanation(false)}
                                      />
                                    </div>
                                    {revision?.explanation}
                                  </div>
                                </>
                              )
                              : (
                                <div style={{ textAlign: "right" }}>
                                  <BfDsButton
                                    kind="overlay"
                                    size="medium"
                                    iconLeft="exclamationCircle"
                                    onClick={() => setShowExplanation(true)}
                                    xstyle={{ alignSelf: "flex-end" }}
                                  />
                                </div>
                              )}
                          </div>
                        )}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
