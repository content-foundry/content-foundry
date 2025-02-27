import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
import { CfLogo } from "packages/app/resources/CfLogo.tsx";
import { useState } from "react";

export function LeftSideBar() {
  const [showVerboseVoice, setShowVerboseVoice] = useState(false);
  return (
    <div className="flexColumn left-side-bar">
      <CfLogo boltColor="black" foundryColor="black" />
      <div className="flexColumn brand-voice">
        <h2>Brand voice</h2>
        <div className="voice-section-voice-style">
          <div className="flexRow">
            <h3 className="flex1">Style</h3>
            <BfDsButton kind="overlay" iconLeft="pencil" />
            <BfDsButton
              kind="overlay"
              iconLeft={showVerboseVoice ? "arrowLeft" : "arrowDown"}
              onClick={() => setShowVerboseVoice(!showVerboseVoice)}
            />
          </div>
          {showVerboseVoice
            ? (
              <div>
                You’re aiming for a voice that is witty, direct, and lightly
                irreverent—one that breaks away from stale corporate talk but
                still comes across as knowledgeable and genuine. This approach
                is casual enough to feel human-friendly, yet firmly grounded in
                expertise so your audience trusts what you say.

                You sound like a mix between Richard Feynman (for his ability to
                make complex concepts accessible with wit and charm) and Anthony
                Bourdain (for his sharp cultural observations and no-BS
                authenticity).
              </div>
            )
            : (
              <div>
                Witty
                <br />
                Direct
                <br />
                Lightly irreverent
              </div>
            )}
        </div>
      </div>
      <div className="flexColumn instructions">
        <div>
          Paste your draft blog post in the field. We’ll provide recommendations
          for how to keep it on brand, with the established voice and tone.
        </div>
        <div>
          Something will happen.
        </div>
        <BfDsButton
          kind="secondary"
          type="submit"
          text="Show results"
          disabled
          xstyle={{ alignSelf: "flex-end" }}
        />
      </div>
      <div className="flexColumn ai-score">
      </div>
    </div>
  );
}
