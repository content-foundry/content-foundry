import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { BfDsInput } from "packages/bfDs/components/BfDsInput.tsx";
import { useEffect, useRef, useState } from "react";
import { useDebouncedFunction } from "packages/app/hooks/useDebouncedFunction.ts";
import checkEmailMutation from "packages/app/__generated__/__isograph/Mutation/CheckEmail/entrypoint.ts";
import { getLogger } from "packages/logger.ts";
import { useMutation } from "packages/app/hooks/isographPrototypes/useMutation.tsx";

const logger = getLogger(import.meta);
export const LoginAndRegisterForm = iso(`
  field BfCurrentViewerLoggedOut.LoginAndRegisterForm @component {
    LoginButton
    RegisterButton
  }
`)(function LoginAndRegisterForm({ data }) {
  const { commit } = useMutation(checkEmailMutation);
  const [email, setEmail] = useState("");
  const [hasEmail, setHasEmail] = useState<boolean>();
  const [isInFlight, setIsInFlight] = useState(false);
  const abortControllerRef = useRef<AbortController>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      abortControllerRef.current?.abort();
    };
  }, []);

  const debouncedSetEmail = useDebouncedFunction(setEmail, 300);
  useEffect(() => {
    if (!email) {
      setHasEmail(undefined);
      return;
    }

    setIsInFlight(true);
    // Abort previous request if exists
    abortControllerRef.current?.abort();
    // Create new controller for this request
    abortControllerRef.current = new AbortController();

    commit({ email }, {
      // @ts-expect-error lets try it anyway
      signal: abortControllerRef.current.signal,
      onComplete(hasEmail) {
        setIsInFlight(false);
        setHasEmail(hasEmail);
        logger.debug("Got check email response", data);
      },
    });
  }, [email]);
  return (
    <>
      <div className="center">
        <BfDsInput
          autoFocus
          label="Email"
          name="email"
          placeholder="randall@contentfoundry.com"
          onChange={(e) => debouncedSetEmail(e.currentTarget.value)}
          xstyle={{ width: "80%" }}
        />
      </div>
      <data.RegisterButton
        hasEmail={hasEmail}
        email={email}
        isInFlight={isInFlight}
      />
      <hr />
      <div className="center">
        Already have an account?
      </div>
      <data.LoginButton
        hasEmail={hasEmail}
        email={email}
        isInFlight={isInFlight}
      />
    </>
  );
});
