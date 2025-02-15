import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
import { BfDsTooltip } from "packages/bfDs/components/BfDsTooltip.tsx";
import { useMutation } from "packages/app/hooks/isographPrototypes/useMutation.tsx";
import mutation from "packages/app/__generated__/__isograph/Mutation/LoginAsDemoPerson/entrypoint.ts";
import { getLogger } from "packages/logger.ts";
import { useState } from "react";

const logger = getLogger(import.meta);

export const DemoButton = iso(`
  field BfCurrentViewerLoggedOut.DemoButton @component {
    __typename
  }
`)(function DemoButton() {
  const { commit: loginAsDemoPerson } = useMutation(mutation);
  const [isInFlight, setIsInFlight] = useState(false);

  const handleLogin = () => {
    setIsInFlight(true);
    loginAsDemoPerson({}, {
      onComplete: (data) => {
        logger.debug("Got demo login response", data);
        globalThis.location.reload();
        setIsInFlight(false);
      },
    });
  };

  return (
    <BfDsTooltip text="Try the demo">
      <div className="center">
        <BfDsButton
          text="Try the demo"
          xstyle={{ width: "80%" }}
          onClick={handleLogin}
          showSpinner={isInFlight}
        />
      </div>
    </BfDsTooltip>
  );
});
