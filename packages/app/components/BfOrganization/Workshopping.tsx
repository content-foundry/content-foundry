import { useState } from "react";
import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { useRouter } from "packages/app/contexts/RouterContext.tsx";
import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
import { BfDsList } from "packages/bfDs/components/BfDsList.tsx";
import { BfDsListItem } from "packages/bfDs/components/BfDsListItem.tsx";
import { BfDsIcon } from "packages/bfDs/components/BfDsIcon.tsx";
import { BfDsCopyButton } from "packages/bfDs/components/BfDsCopyButton.tsx";
import { getLogger } from "packages/logger.ts";
const logger = getLogger(import.meta);

export const Workshopping = iso(`
  field BfOrganization.Workshopping @component {
    Sidebar
    HistorySidebar
    creation {
      originalText
      suggestions
    }
  }
`)(
  function Workshopping(
    { data },
  ) {
    const routerProps = useRouter();
    const { workshoppingSlug } = routerProps.routeParams;
    const [thumbs, setThumbs] = useState<Record<number, string | null>>({});

    const handleThumbClick = (direction: string, thumbIndex: number) => {
      let thisThumbDirection = thumbs[thumbIndex];
      if (thisThumbDirection === direction) {
        thisThumbDirection = null;
      } else {
        thisThumbDirection = direction;
      }
      setThumbs({ ...thumbs, [thumbIndex]: thisThumbDirection });
    };

    let thumbsUp = 0;
    let thumbsDown = 0;
    Object.values(thumbs).forEach((direction) => {
      if (direction === "up") {
        thumbsUp += 1;
      } else if (direction === "down") {
        thumbsDown += 1;
      }
    });

    if (workshoppingSlug) {
      logger.debug("Workshopping slug is ", workshoppingSlug);
    }
    const Sidebar = data.Sidebar;
    const HistorySidebar = data.HistorySidebar;
    return (
      <div className="flexRow editor-container">
        {Sidebar && <Sidebar />}
        <div className="flexColumn flex1">
          <div className="current-events-container scrollable">
            <div className="current-events-page-header-container">
              <div className="current-events-header-container-text">
                <div className="subpageHeaderRoute">Workshopping</div>
                <h2 className="current-events-header">Initial suggestion</h2>
              </div>
            </div>

            <div className="original-section">
              <h3 className="category">Original</h3>
              <div className="original-text">
                {data.creation?.originalText}
                <BfDsCopyButton
                  kind="secondary"
                  textToCopy={data.creation?.originalText ?? ""}
                />
              </div>
            </div>

            <div className="suggestions-section">
              <h3 className="category">Suggestions</h3>
              <div className="suggestion-list">
                {data.creation?.suggestions?.map((text, index) => {
                  const [showInfo, setShowInfo] = useState(false);
                  return (
                    <div key={text} className="suggestion-container flexColumn">
                      <div className="suggestion-row">
                        <div className="suggestion-header">
                          <BfDsButton
                            kind={thumbs[index] === "up"
                              ? "filledSuccess"
                              : "overlay"}
                            iconLeft="thumbUp"
                            onClick={() =>
                              handleThumbClick("up", index)}
                          />
                          <BfDsButton
                            kind={thumbs[index] === "down"
                              ? "filledAlert"
                              : "overlay"}
                            iconLeft="thumbDown"
                            onClick={() =>
                              handleThumbClick("down", index)}
                          />
                          <div className="suggestion-number">{index + 1}</div>
                        </div>
                        <div className="flexColumn flex1">
                          <div className="suggestion-card">
                            <div className="suggestion-text">
                              {text}
                            </div>
                            <BfDsCopyButton
                              kind="outline"
                              textToCopy={text ?? ""}
                            />
                          </div>
                        </div>
                      </div>
                      {showInfo
                        ? (
                          <div className="suggestion-details">
                            <div className="suggestion-details-close">
                              <BfDsButton
                                kind="overlaySuccess"
                                size="medium"
                                iconLeft="exclamationCircle"
                                onClick={() => setShowInfo(false)}
                              />
                            </div>
                            <BfDsList>
                              <BfDsListItem content="Using ‘giving meh’ adds
                        humor and
                        personality, making the tone
                        lighthearted and
                        engaging." />
                              <BfDsListItem content="The contrast between“meh” and
                        “wow” is happy
                          and memorable." />
                              <BfDsListItem content="Better matches yourirreverent style." />
                            </BfDsList>
                          </div>
                        )
                        : (
                          <BfDsButton
                            kind="overlay"
                            size="medium"
                            iconLeft="exclamationCircle"
                            onClick={() => setShowInfo(true)}
                            xstyle={{ alignSelf: "flex-end" }}
                          />
                        )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="footer">
            <BfDsButton kind="secondary" text="New suggestions" />
            <div>Text or something</div>
            <div className="engagement-container">
              <div className="engagement-icons">
                <BfDsIcon color="var(--alwaysWhite)" name="thumbUp" />{" "}
                <div>{thumbsUp}</div>
              </div>
              <div className="engagement-icons">
                <BfDsIcon color="var(--alwaysWhite)" name="thumbDown" />{" "}
                <div>{thumbsDown}</div>
              </div>
            </div>
            <BfDsButton kind="primary" text="Refine" />
          </div>
        </div>
        {HistorySidebar && <HistorySidebar />}
      </div>
    );
  },
);
