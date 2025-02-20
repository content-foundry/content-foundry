import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { getLogger } from "packages/logger.ts";
const logger = getLogger(import.meta);

export const SessionsSidebar = iso(`
  field BfOrganization.SessionsSidebar @component {
    __typename
  }
`)(
  function SessionsSidebar(
    { data },
  ) {
    logger.debug(data.__typename);
    return (
      <div className="flexColumn right-side-bar">
        <div className="sessions-container">
          <h3 className="sidebar-header">
            Sessions
          </h3>
          <div className="session">
            Tweet 2/12/2025 2
          </div>
          <div className="session">
            Tweet 2/12/2025
          </div>
          <div className="session">
            Tweet 2/10/2025
          </div>
        </div>
      </div>
    );
  },
);
