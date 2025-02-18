import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

export const EntrypointTwitterIdeatorVoice = iso(`
  field BfOrganization.IdentityEditor @component {
    identity {
      __typename
    }
  }
`)(
  function EntrypointTwitterIdeatorVoice(
    { data },
  ) {
    return <div>{data.identity?.__typename}™</div>
  },
);
