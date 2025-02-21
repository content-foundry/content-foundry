import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { CfLogo } from "packages/bfDs/static/CfLogo.tsx";
import { BfDsInput } from "packages/bfDs/components/BfDsInput.tsx";
import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
import { BfDsDropzone } from "packages/bfDs/components/BfDsDropzone.tsx";
import { getLogger } from "packages/logger.ts";
import { useMutation } from "packages/app/hooks/isographPrototypes/useMutation.tsx";
import { useState } from "react";
import createVoiceMutation from "packages/app/__generated__/__isograph/Mutation/CreateVoice/entrypoint.ts";

export const EntrypointTwitterIdeatorVoice = iso(`
  field BfOrganization.IdentityEditor @component {
    identity {
      EditIdentity
    }
  }
`)(
  function EntrypointTwitterIdeatorVoice(
    { data },
  ) {
    const { commit } = useMutation(createVoiceMutation);
    const EditIdentity = data.identity?.EditIdentity;
    const [handle, setHandle] = useState("");
    const logger = getLogger(import.meta);
    return (
      <div className="page">
        <div className="header">
          <CfLogo boltColor="black" foundryColor="black" />
        </div>
        <div className="voice-container">
          <div className="voice-section flex-column">
            {EditIdentity ? <EditIdentity /> : (
              <>
                <h2 className="voice-section-header">
                  Let's find your voice
                </h2>
                <div className="voice-section-text">
                  Paste your Twitter handle and we’ll get a feel for your
                  current voice.
                </div>
                <BfDsInput
                  label="Twitter handle"
                  placeholder="@George_LeVitre"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                />
                <div className="line-separator-container">
                  <div className="line" />
                  <div>OR</div>
                  <div className="line" />
                </div>
                <div className="voice-section-text">
                  Upload an archive of all your tweets. You can download on{" "}
                  <a href="https://x.com/settings/download_your_data">
                    x.com
                  </a>
                </div>
                <BfDsDropzone
                  accept="application/zip, .zip"
                  onFileSelect={() => (logger.info("foo"))}
                />
                <BfDsButton
                  kind="primary"
                  type="submit"
                  text="Submit"
                  xstyle={{ alignSelf: "flex-end" }}
                  onClick={() => (
                    commit({ handle: handle }, {
                      onComplete: (createVoiceMutationData) => {
                        setHandle("");
                        logger.debug(
                          "voice created successfully",
                          createVoiceMutationData,
                        );
                      },
                    })
                  )}
                />
              </>
            )}
          </div>
        </div>
      </div>
    );
  },
);
