import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
import entrypoint from "packages/app/__generated__/__isograph/Mutation/RegistrationOptions/entrypoint.ts";
import mutation from "packages/app/__generated__/__isograph/Mutation/Register/entrypoint.ts";
import { useImperativeReference } from "@isograph/react";
import { getLogger } from "packages/logger.ts";
import { startRegistration } from "@simplewebauthn/browser";

import { useState } from "react";
import { useMutation } from "packages/app/hooks/isographPrototypes/useMutation.tsx";
import { BfDsTooltip } from "packages/bfDs/components/BfDsTooltip.tsx";

const logger = getLogger(import.meta);

type Props = {
  hasEmail: boolean | null;
  email: string | null;
  isInFlight?: boolean;
};

export const RegisterButton = iso(`
  field BfCurrentViewerLoggedOut.RegisterButton @component {
    __typename
  }
`)(
  function RegisterButton(
    _,
    { hasEmail, email, isInFlight: parentIsInFlight }: Props,
  ) {
    const { loadFragmentReference } = useImperativeReference(entrypoint);
    const { commit } = useMutation(mutation);
    const [isInFlight, setIsInFlight] = useState(false);
    const showSpinner = parentIsInFlight || isInFlight;

    // BUG: This is a data leak
    if (hasEmail) {
      return (
        <BfDsButton
          disabled
          text="Register"
          tooltip="You are already registered"
        />
      );
    }

    const register = () => {
      if (!email) return;
      loadFragmentReference({
        email,
      }, {
        onComplete: async (optionsJSON) => {
          logger.debug("received result", optionsJSON);
          let attRespJSON;
          try {
            attRespJSON = await startRegistration({ optionsJSON });
            logger.debug("start this thing nao omfg", attRespJSON);
          } catch (e) {
            logger.error(e);
          }
          if (attRespJSON) {
            const attResp = JSON.stringify(attRespJSON);
            logger.debug("attResp", attRespJSON, attResp);
            setIsInFlight(true);
            commit({ attResp, email }, {
              onComplete: () => {
                logger.debug("Completed registration.");
                setIsInFlight(false);
              },
            });
          } else {
            setIsInFlight(false);
          }
        },
      });
    };
    const enableRegister = hasEmail === false && email;

    return (
      <BfDsTooltip
        text={enableRegister ? "Register" : "Enter an email to register"}
      >
        <div className="center">
          <BfDsButton
            kind="secondary"
            text="Register"
            onClick={register}
            showSpinner={showSpinner}
            disabled={!enableRegister}
            xstyle={{ width: "80%" }}
          />
        </div>
      </BfDsTooltip>
    );
  },
);
