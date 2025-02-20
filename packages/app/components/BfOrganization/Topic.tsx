import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
import { useRouter } from "packages/app/contexts/RouterContext.tsx";
import { BfDsList } from "packages/bfDs/components/BfDsList.tsx";
import { BfDsListItem } from "packages/bfDs/components/BfDsListItem.tsx";
import { BfDsTextArea } from "packages/bfDs/components/BfDsTextArea.tsx";
import { getLogger } from "packages/logger.ts";
const logger = getLogger(import.meta);

export const Topic = iso(`
  field BfOrganization_Research.Topic @component {
    __typename
  }
`)(
  function Topic(
    { data },
  ) {
    const { navigate } = useRouter();

    logger.debug(data.__typename);
    return (
      <div className="flexColumn scrollable">
        <div className="current-events-container">
          <div className="current-events-page-header-container">
            <BfDsButton
              kind="outline"
              iconLeft="arrowLeft"
              onClick={() => navigate("/twitter/research")}
            />
            <div className="header-image">
            </div>
            <div className="current-events-header-container-text">
              <div className="subpageHeaderRoute">Research</div>
              <h2 className="current-events-header">Current Event</h2>
            </div>
          </div>
          <div className="current-event-page-content">
            <div className="info-section">
              <BfDsList header="Inspiration">
                <BfDsListItem content="Celebrating the Champions" />
                <BfDsListItem content="Highlighting the Halftime Show" />
                <BfDsListItem content="Record-Breaking Viewership" />
                <BfDsListItem content="Memorable Commercials" />
                <BfDsListItem content="Reflecting on Predictions" />
                <BfDsListItem content="Honoring the MVP" />
                <BfDsListItem content="Discussing the Halftime Show’s Impact" />
              </BfDsList>
            </div>

            <div className="info-section">
              <BfDsList header="Posts from people you follow">
                <BfDsListItem content="So-and-so talked about the graphics from the Super Bowl broadcast.
                    Maybe reply to them" />
                <BfDsListItem content="So-and-so talked about the graphics from the Super Bowl broadcast.
                    Maybe reply to them." />
              </BfDsList>
            </div>
          </div>
          <div className="current-event-section">
            <h3 className="category">News articles</h3>
            <div className="card-container">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="card">
                  <div className="headline">Headline</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="compose-section">
          <h3 className="category">Compose</h3>
          <div className="compose-text">
            Write a draft tweet and we’ll help you flesh it out
          </div>
          <BfDsTextArea
            className="input-box"
            placeholder="I've never thought about..."
            value={""}
            onChange={() => logger.debug("onChange")}
          />
          <BfDsButton
            kind="primary"
            text="Continue"
            xstyle={{ alignSelf: "flex-end" }}
            onClick={() => {
              navigate("/twitter/workshopping");
            }}
          />
        </div>
      </div>
    );
  },
);
