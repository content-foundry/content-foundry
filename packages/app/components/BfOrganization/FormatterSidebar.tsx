import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { SubpageHeaderTitle } from "packages/app/components/Header/SubpageHeaderTitle.tsx";
import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
import { useState } from "react";
import { useBfDs } from "packages/bfDs/hooks/useBfDs.tsx";

export const FormatterSidebar = iso(`
  field BfOrganization.FormatterSidebar @component {
    identity{
      twitter{
        handle
        name
        imgUrl
      }
      voice {
        voiceSummary
        voice
      }
    }
  }
`)(
  function FormatterSidebar(
    { data },
  ) {
    const { showModal } = useBfDs();
    const [showVerboseVoice, setShowVerboseVoice] = useState(false);

    return (
      <div className="flexColumn left-side-bar">
        <div className="sidebar-header">
          <SubpageHeaderTitle>
            Formatter
          </SubpageHeaderTitle>
        </div>
        <div className="user-card">
          <div>
            <div className="bold">X user</div>
            <div>@{data.identity?.twitter?.handle}</div>
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
                  {data.identity?.voice?.voice}
                </div>
              )
              : (
                <div>
                  {data.identity?.voice?.voiceSummary}
                </div>
              )}
          </div>
        </div>
      </div>
    );
  },
);
