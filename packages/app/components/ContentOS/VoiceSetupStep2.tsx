import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
import { useState } from "react";
import { BfDsTextArea } from "packages/bfDs/components/BfDsTextArea.tsx";
import { BfDsInput } from "packages/bfDs/components/BfDsInput.tsx";
import { classnames } from "lib/classnames.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

export function VoiceSetupStep2() {
  const [showChanges, setShowChanges] = useState(false);
  const [voiceLinks, setVoiceLinks] = useState<Array<string | null>>([null]);

  const sectionClasses = classnames([
    "voice-section-voice-style",
    {
      highlight: !showChanges,
    },
  ]);

  return (
    <>
      <h2 className="voice-section-header">
        How does this look?
      </h2>
      <div className={sectionClasses}>
        You’re aiming for a voice that is witty, direct, and lightly
        irreverent—one that breaks away from stale corporate talk but still
        comes across as knowledgeable and genuine. This approach is casual
        enough to feel human-friendly, yet firmly grounded in expertise so your
        audience trusts what you say.
        <br />
        You sound like a mix between Richard Feynman (for his ability to make
        complex concepts accessible with wit and charm) and Anthony Bourdain
        (for his sharp cultural observations and no-BS authenticity).
      </div>
      {!showChanges &&
        (
          <div className="flexRow spaceBetween gapMedium">
            <BfDsButton
              kind="outline"
              text="Make Changes"
              onClick={() => {
                setShowChanges(true);
              }}
              xstyle={{ alignSelf: "flex-end" }}
            />
            <BfDsButton
              kind="primary"
              type="submit"
              text="Looks Good"
              xstyle={{ alignSelf: "flex-end" }}
            />
          </div>
        )}
      {showChanges &&
        (
          <>
            <BfDsTextArea
              placeholder="What would you change?"
              onChange={() => (logger.info("foo"))}
              value={""}
            />
            {voiceLinks.map((link, index) => (
              <BfDsInput
                autoFocus={index === voiceLinks.length - 1}
                key={index}
                label={index === 0
                  ? `Source link${voiceLinks.length > 1 ? "s" : ""}`
                  : undefined}
                placeholder="https://my.blog.com/"
                value={link ?? ""}
                onChange={(e) => {
                  const updatedVoiceLinks = [...voiceLinks];
                  updatedVoiceLinks[index] = e.target.value;
                  setVoiceLinks(updatedVoiceLinks);
                }}
              />
            ))}
            <BfDsButton
              kind="overlay"
              iconLeft="plus"
              text="Add another source"
              xstyle={{ alignSelf: "flex-start" }}
              onClick={() => {
                setVoiceLinks([...voiceLinks, ""]);
              }}
            />
            <div className="flexRow spaceBetween gapMedium">
              <BfDsButton
                kind="outline"
                text="Use the first version"
                onClick={() => {
                  setShowChanges(true);
                }}
              />
              <BfDsButton
                kind="primary"
                type="submit"
                text="Submit changes"
              />
            </div>
          </>
        )}
    </>
  );
}
