import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
import { BfDsInput } from "packages/bfDs/components/BfDsInput.tsx";
import { getLogger } from "packages/logger.ts";
import { BfDsTooltip } from "packages/bfDs/components/BfDsTooltip.tsx";

export const SuggestionsPage = iso(`
  field BfOrganization_Research.SuggestionsPage @component {
    topics {
      name
      entries {
        type
        name
        summary
        url
      }
    }
  }
`)(
  function SuggestionsPage(
    { data },
  ) {
    const logger = getLogger(import.meta);
    return (
      <div className="flexRow editor-workspace">
        <div className="current-events-container">
          <div className="current-events-header-container">
            <div className="current-events-header-container-text">
              <div className="subpageHeaderRoute">Research</div>
              <h2 className="current-events-header">Choose a topic</h2>
            </div>
            <BfDsButton
              kind="secondary"
              type="submit"
              text="Skip"
              onClick={() => logger.info(true)}
            />
          </div>
          {data.topics?.map((topic) => {
            if (!topic) return null;
            return (
              <div key={topic?.name} className="current-event-section">
                <h3 className="category">{topic.name}</h3>
                <div className="card-container">
                  {topic.entries?.map((entry) => {
                    if (!entry) return null;
                    return (
                      <BfDsTooltip key={entry.name} text={entry?.summary}>
                        <div
                          className="card"
                          onClick={() =>
                            globalThis.open(entry.url ?? "", "_blank")}
                        >
                          <div className="headline">
                            <div className="text">{entry?.name}</div>
                          </div>
                        </div>
                      </BfDsTooltip>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="current-event-section free-form">
            <h3 className="category">Free-form</h3>
            <BfDsInput type="text" placeholder="Something on your mind..." />
            <BfDsButton
              kind="primary"
              text="Continue"
              xstyle={{ alignSelf: "flex-end" }}
            >
            </BfDsButton>
          </div>
        </div>
        <div className="flexColumn right-side-bar">
          <div className="sessions-container">
            <h3 className="sidebar-header">
              Sessions
            </h3>
            <div className="session">
              Tweet 2/12/2025 2
            </div>
            <div className="session">
              Tweet 2/12/2025
            </div>
            <div className="session">
              Tweet 2/10/2025
            </div>
          </div>
        </div>
      </div>
    );
  },
);
