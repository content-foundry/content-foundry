import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { getLogger } from "packages/logger.ts";
const logger = getLogger(import.meta);

export const BlogRevisionsSidebar = iso(`
  field BfOrganization.BlogRevisionsSidebar @component {
     creation {
       revisions{
         revisionTitle
         original
         revision
         explanation
       }
     }
  }
`)(
  function BlogRevisionsSidebar(
    { data },
  ) {
    return (
      <div className="flexColumn right-side-bar">
        <div className="sessions-container">
          {data?.creation?.revisions?.map((revision) => (
            <>
              <div>{revision?.revisionTitle ?? ""}</div>
              <div>{revision?.original ?? ""}</div>
              <div>{revision?.revision ?? ""}</div>
              <div>{revision?.explanation ?? ""}</div>
            </>
          ))}
        </div>
      </div>
    );
  },
);
