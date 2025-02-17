import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { useRouter } from "packages/app/contexts/RouterContext.tsx";
import { useEffect } from "react";

export const Home = iso(`
  field BfCurrentViewerLoggedIn.TwitterIdeator_Home @component {
    __typename
    TwitterIdeator_CurrentEvent
  }
`)(function Home({ data }) {
  const { navigate } = useRouter();
  const shouldRedirect = false;

  useEffect(() => {
    if (shouldRedirect) {
      navigate("/twitter/events");
    }
  }, [shouldRedirect, navigate]);
  return <div>Home - {data.__typename}</div>;
});
