import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { CfLogo } from "packages/app/resources/CfLogo.tsx";

export const Home = iso(`
  field BfCurrentViewer.Home @component {
    __typename
    # content(slug: "home") {
    #   ContentBody
    # }
  }
`)(function Home() {
  return (
    <div className="appPage flexCenter">
      <div className="appHeader">
        <div className="appHeaderCenter">
          <div className="appHeaderWelcomer">
            Welcome to
          </div>
          <div className="appHeaderLogo">
            <CfLogo boltColor="black" foundryColor="black" />
          </div>
        </div>
      </div>
      <div className="loginBox">
        Coming soon.
      </div>
    </div>
  );
});
