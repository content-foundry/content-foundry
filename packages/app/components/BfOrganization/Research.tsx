import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { useRouter } from "packages/app/contexts/RouterContext.tsx";
import { getLogger } from "packages/logger.ts";
const logger = getLogger(import.meta);

export const Research = iso(`
  field BfOrganization.Research @component {
    Sidebar
    SessionsSidebar
    research {
      Topics
      Topic
    }
  }
`)(
  function Research(
    { data },
  ) {
    const routerProps = useRouter();
    const { researchSlug } = routerProps.routeParams;

    if (researchSlug) {
      logger.debug("Research slug is ", researchSlug);
    }
    const Sidebar = data.Sidebar;
    const SessionsSidebar = data.SessionsSidebar;
    const Topics = data.research?.Topics;
    const Topic = data.research?.Topic;
    return (
      <div className="flexRow editor-container">
        {Sidebar && <Sidebar />}
        {researchSlug ? Topic && <Topic /> : Topics && <Topics />}
        {SessionsSidebar && <SessionsSidebar />}
      </div>
    );
  },
);
