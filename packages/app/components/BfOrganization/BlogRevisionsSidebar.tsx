import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
import { useState } from "react";

export const BlogRevisionsSidebar = iso(`
  field BfOrganization.BlogRevisionsSidebar @component {
     creation {
       revisions{
         revisionTitle
         original
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
    return (
      <div className="flexColumn right-side-bar">
        <BfDsButton
          iconLeft="check"
          kind="outlineSuccess"
          xstyle={{ alignSelf: "flex-end" }}
        />
        <div className="revisions-container">
          {data?.creation?.revisions?.map((revision, _index) => {
            const [showExpanded, setShowExpanded] = useState(false);
            return (
              <div className="revision-item">
                <div className="flexRow">
                  <div className="revision-title">
                    {revision?.revisionTitle ?? ""}
                  </div>
                  <BfDsButton kind="outlineSuccess" iconLeft="check" />
                  <BfDsButton kind="outlineAlert" iconLeft="cross" />
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
                      <div>
                        <div className="revision-title">Original text:</div>
                        {" "}
                        {revision?.original ?? ""}
                      </div>
                      <div>
                        <div className="revision-title">Revision:</div>{" "}
                        {revision?.revision ?? ""}
                      </div>
                      {showExplanation
                        ? (
                          <div className="suggestion-details">
                            <div className="suggestion-details-close">
                              <BfDsButton
                                kind="overlaySuccess"
                                size="medium"
                                iconLeft="exclamationCircle"
                                onClick={() => setShowExplanation(false)}
                              />
                            </div>
                            {revision?.explanation}
                          </div>
                        )
                        : (
                          <BfDsButton
                            kind="overlay"
                            size="medium"
                            iconLeft="exclamationCircle"
                            onClick={() => setShowExplanation(true)}
                            xstyle={{ alignSelf: "flex-end" }}
                          />
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
