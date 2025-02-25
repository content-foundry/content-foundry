import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { PageMarketing } from "packages/app/pages/PageMarketing.tsx";

export const Home = iso(`
  field BfCurrentViewer.Home @component {
    __typename
  }
`)(function Home() {
  return <PageMarketing />;
});
