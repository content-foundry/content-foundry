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
      voiceSummary
      voice
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

    let currentStep = researchSlug ? 2 : 1;
    if (currentPath === "/twitter/workshopping") {
      currentStep = 3;
    }

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
      </div>
    );
  },
);
