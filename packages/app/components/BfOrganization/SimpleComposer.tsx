import { iso } from "packages/app/__generated__/__isograph/iso.ts";
// import { getLogger } from "packages/logger.ts";
import { BfDsTextArea } from "packages/bfDs/components/BfDsTextArea.tsx";
import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
import { useState } from "react";
import { useRouter } from "packages/app/contexts/RouterContext.tsx";
import { useMutation } from "packages/app/hooks/isographPrototypes/useMutation.tsx";
import makeTweetsMutation from "packages/app/__generated__/__isograph/Mutation/MakeTweets/entrypoint.ts";
import { getLogger } from "packages/logger.ts";
const logger = getLogger(import.meta);

export const SimpleComposer = iso(`
  field BfOrganization.SimpleComposer @component {
    Sidebar
  }
`)(
  function SimpleComposer(
    { data },
  ) {
    const { commit } = useMutation(makeTweetsMutation);
    const [isInFlight, setIsInFlight] = useState(false);
    const { navigate } = useRouter();
    const Sidebar = data.Sidebar;
    const [draftTweet, setDraftTweet] = useState("");
    return (
      <div className="flexRow editor-container">
        {Sidebar && <Sidebar />}
        <div className="voice-section">
          <div className="current-events-header-container-text">
            <div className="subpageHeaderRoute">Workshopping</div>
            <h2 className="current-events-header">Initial suggestion</h2>
          </div>
          <div>
            Jot down a quick draft of your tweet. When you click "Continue,"
            you’ll see options to enhance it using your voice!
          </div>
          <BfDsTextArea
            value={draftTweet}
            onChange={(e) => setDraftTweet(e.target.value)}
          />
          <BfDsButton
            disabled={draftTweet.length === 0 || isInFlight}
            kind="primary"
            type="submit"
            showSpinner={isInFlight}
            text="Continue"
            xstyle={{ alignSelf: "flex-end" }}
            onClick={() => (
              setIsInFlight(true),
                commit({ tweet: draftTweet }, {
                  onComplete: (makeTweetMutationData) => {
                    logger.debug(
                      "tweet created successfully",
                      makeTweetMutationData,
                    );
                    setIsInFlight(false);
                    navigate("/twitter/workshopping");
                  },
                })
            )}
          />
        </div>
      </div>
    );
  },
);
