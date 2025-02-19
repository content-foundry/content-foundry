import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { SubpageHeaderTitle } from "packages/app/components/Header/SubpageHeaderTitle.tsx";
import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
import { useState } from "react";
import { useBfDs } from "packages/bfDs/hooks/useBfDs.tsx";

export const Sidebar = iso(`
  field BfOrganization.Sidebar @component {
    identity{
      twitter{
        handle
        name
        imgUrl
      }
      voiceSummary
      voice
    }
  }
`)(
  function Sidebar(
    { data },
  ) {
    const { showModal } = useBfDs();
    const [showVerboseVoice, setShowVerboseVoice] = useState(false);

    return (
      <div className="flexColumn left-side-bar">
        <div className="sidebar-header">
          <SubpageHeaderTitle>
            Twitter Ideator
          </SubpageHeaderTitle>
        </div>
        <div className="user-card">
          <div
            className="user-card-image"
            style={{
              background:
                `url(${data.identity?.twitter?.imgUrl}) no-repeat 50% 50% / cover`,
            }}
          />
          <div>
            <div>{data.identity?.twitter?.name}</div>
            <div className="user-handle">@{data.identity?.twitter?.handle}</div>
          </div>
        </div>
        <div className="flexColumn instructions">
          <div>
            <div className="instructions-header">
              <div className="flex1">Style</div>
              <BfDsButton
                kind="overlay"
                iconLeft="pencil"
                onClick={() => showModal("TODO: voice editor")}
                size="medium"
              />
              <BfDsButton
                kind="overlay"
                iconLeft={showVerboseVoice ? "arrowLeft" : "arrowDown"}
                onClick={() => setShowVerboseVoice(!showVerboseVoice)}
                size="medium"
              />
            </div>
            {showVerboseVoice
              ? (
                <div>
                  {data.identity?.voice}
                </div>
              )
              : (
                <div>
                  {data.identity?.voiceSummary}
                </div>
              )}
          </div>
        </div>
        <div className="steps">
          {/* TODO implement classNames for highlight not worth it now with state machine that will be replaced */}
          <div className="step flexRow">
            <div className="step-number-highlight">1</div> Choose a topic.
          </div>
          <div className="step flexRow">
            <div className="step-number">2</div> Get inspired and compose.
          </div>
          <div className="step flexRow">
            <div className="step-number">3</div> Workshop
          </div>
        </div>
      </div>
    );
  },
);
