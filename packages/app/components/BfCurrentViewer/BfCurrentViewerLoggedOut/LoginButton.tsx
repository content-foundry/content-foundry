import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { useState } from "react";
import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
import { getLogger } from "packages/logger.ts";
import { startAuthentication } from "@simplewebauthn/browser";
import { useMutation } from "packages/app/hooks/isographPrototypes/useMutation.tsx";
import mutation from "packages/app/__generated__/__isograph/Mutation/GetLoginOptions/entrypoint.ts";
import completeLoginMutation from "packages/app/__generated__/__isograph/Mutation/Login/entrypoint.ts";
import { BfDsTooltip } from "packages/bfDs/components/BfDsTooltip.tsx";

const logger = getLogger(import.meta);

type Props = {
  hasEmail: boolean | null;
  email: string | null;
  isInFlight?: boolean;
};

export const LoginButton = iso(`
  field BfCurrentViewerLoggedOut.LoginButton @component {
    __typename
  }
`)(
  function LoginButton(
    _,
    { hasEmail, email, isInFlight: parentInFlight }: Props,
  ) {
    logger.debug(
      "hasEmail",
      hasEmail,
      "email",
      email,
      "parentInFlight",
      parentInFlight,
    );
    const { commit: getLoginOptions } = useMutation(mutation);
    const { commit: login } = useMutation(completeLoginMutation);
    const [isInFlight, setIsInFlight] = useState(false);

    const handleLogin = () => {
      setIsInFlight(true);
      try {
        if (!email) {
          return;
        }

        logger.debug("Getting authentication options...");
        getLoginOptions({
          email,
        }, {
          onComplete: async (data) => {
            logger.debug("Got authentication options", data);

            const options = JSON.parse(data);
            const authResp = await startAuthentication({
              optionsJSON: options,
            });
            logger.debug("Got authentication response", authResp);
            login({ email, authResp: JSON.stringify(authResp) }, {
              onComplete: (data) => {
                logger.debug("Got login response", data);
                globalThis.location.reload();
                setIsInFlight(false);
              },
            });
          },
        });
      } catch (error) {
        logger.error(
          "Error getting login options or during authentication:",
          error,
        );
        // Handle error appropriately
      }
    };

    const showSpinner = parentInFlight || isInFlight;
    const enableLogin = hasEmail && email;

    // BUG: this is a data leak
    if (hasEmail === false) {
      return (
        <BfDsButton
          text="Login"
          showSpinner={showSpinner}
          disabled={true}
          tooltip="The email wasn't found. Either register or try a different email?"
        />
      );
    }
    return (
      <BfDsTooltip text={enableLogin ? "Login" : "Enter an email to log in"}>
        <div className="center">
          <BfDsButton
            kind="outline"
            text="Login"
            onClick={handleLogin}
            showSpinner={showSpinner}
            disabled={!enableLogin}
            xstyle={{ width: "80%" }}
          />
        </div>
      </BfDsTooltip>
    );
  },
);
