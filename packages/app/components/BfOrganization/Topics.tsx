import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { getLogger } from "packages/logger.ts";
import { BfDsTooltip } from "packages/bfDs/components/BfDsTooltip.tsx";
import { useRouter } from "packages/app/contexts/RouterContext.tsx";
import { BfDsForm } from "packages/bfDs/components/BfDsForm/BfDsForm.tsx";
import { BfDsFormSubmitButton } from "packages/bfDs/components/BfDsForm/BfDsFormSubmitButton.tsx";
import { BfDsFormTextArea } from "packages/bfDs/components/BfDsForm/BfDsFormTextArea.tsx";

const _logger = getLogger(import.meta);

export const Topics = iso(`
  field BfOrganization_Research.Topics @component {
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
  function Topics(
    { data },
  ) {
    const { navigate } = useRouter();
    const _logger = getLogger(import.meta);

    return (
      <div className="current-events-container">
        <div className="current-events-header-container">
          <div className="current-events-header-container-text">
            <div className="subpageHeaderRoute">Research</div>
            <h2 className="current-events-header">Choose a topic</h2>
          </div>
          {/* TODO: Figure out the UX for "skip" */}
          {
            /* <BfDsButton
            kind="secondary"
            type="submit"
            text="Skip"
            onClick={() => navigate("/twitter/workshopping")}
          /> */
          }
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
                          navigate(
                            `/twitter/research/${entry.name?.split(" ")[0]}`,
                          )}
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

        <div className="current-event-section">
          <h3 className="category">Free-form</h3>
          <BfDsForm
            initialData={{ input: "" }}
            xstyle={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            <BfDsFormTextArea
              id="input"
              placeholder="Something on your mind..."
            />
            <BfDsFormSubmitButton
              kind="secondary"
              text="Continue"
              xstyle={{ alignSelf: "flex-end" }}
            />
          </BfDsForm>
        </div>
      </div>
    );
  },
);
