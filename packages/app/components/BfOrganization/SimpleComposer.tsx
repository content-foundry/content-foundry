import { iso } from "packages/app/__generated__/__isograph/iso.ts";
// import { getLogger } from "packages/logger.ts";
import { BfDsTextArea } from "packages/bfDs/components/BfDsTextArea.tsx";
import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
import { useState } from "react";
import { useRouter } from "packages/app/contexts/RouterContext.tsx";
// const logger = getLogger(import.meta);

export const SimpleComposer = iso(`
  field BfOrganization.SimpleComposer @component {
    Sidebar
  }
`)(
  function SimpleComposer(
    { data },
  ) {
    const { navigate } = useRouter();
    const Sidebar = data.Sidebar;
    const [draftTweet, setDraftTweet] = useState("");
    return (
      <div className="flexRow editor-container">
        {Sidebar && <Sidebar />}
        <div className="voice-section">
          <h2 className="voice-section-header">
            Write a draft tweet
          </h2>
          <BfDsTextArea
            value={draftTweet}
            onChange={(e) => setDraftTweet(e.target.value)}
          />
          <BfDsButton
            kind="primary"
            type="submit"
            text="Submit"
            xstyle={{ alignSelf: "flex-end" }}
            onClick={() => navigate("/twitter/workshopping")}
          />
        </div>
      </div>
    );
  },
);
