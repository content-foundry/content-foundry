import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { useRouter } from "packages/app/contexts/RouterContext.tsx";
import { useEffect } from "react";

export const LoggedInView = iso(`
  field BfCurrentViewerLoggedIn.LoggedInView @component {
    __typename
    
  }
`)(function LoggedInView() {
  const { replace } = useRouter();
  useEffect(function LoggedInViewEffect() {
    replace("/twitter");
  });
  return <div></div>;
});
