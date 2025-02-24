import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { SubpageHeaderTitle } from "packages/app/components/Header/SubpageHeaderTitle.tsx";
import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
import { useState } from "react";
import { useBfDs } from "packages/bfDs/hooks/useBfDs.tsx";
import { useRouter } from "packages/app/contexts/RouterContext.tsx";

const steps = [
  "Choose a topic",
  "Get inspired and compose",
  "Workshop",
];

export const Sidebar = iso(`
  field BfOrganization.Sidebar @component {
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
  function Sidebar(
    { data },
  ) {
    const routerProps = useRouter();
    const { currentPath, routeParams } = routerProps;
    const { researchSlug } = routeParams;
    const { showModal } = useBfDs();
    const [showVerboseVoice, setShowVerboseVoice] = useState(false);
    const showSteps = false;
    let currentStep = researchSlug ? 2 : 1;
    if (currentPath === "/twitter/workshopping") {
      currentStep = 3;
    }

    return (
      <div className="flexColumn left-side-bar">
        <div className="sidebar-header">
          <SubpageHeaderTitle>
            Tweet Ideator
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
        {showSteps &&
          (
            <div className="steps">
              {steps.map((step, index) => {
                return (
                  <div className="step flexRow">
                    <div
                      className={`step-number${
                        currentStep === index + 1 ? "-highlight" : ""
                      }`}
                    >
                      {index + 1}
                    </div>{" "}
                    {step}
                  </div>
                );
              })}
            </div>
          )}
      </div>
    );
  },
);
