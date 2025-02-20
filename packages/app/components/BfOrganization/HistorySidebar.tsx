import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { BfDsList } from "packages/bfDs/components/BfDsList.tsx";
import { BfDsListItem } from "packages/bfDs/components/BfDsListItem.tsx";
import { getLogger } from "packages/logger.ts";
const logger = getLogger(import.meta);

export const HistorySidebar = iso(`
  field BfOrganization.HistorySidebar @component {
    __typename
  }
`)(
  function HistorySidebar(
    { data },
  ) {
    logger.debug(data.__typename);
    return (
      <div className="flexColumn right-side-bar">
        <div className="sessions-container">
          <BfDsList header="History">
            <BfDsListItem content="Initial suggestion" isHighlighted={true} />
          </BfDsList>
        </div>
      </div>
    );
  },
);
