import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

export const EntrypointTwitterIdeatorVoice = iso(`
  field Query.EntrypointTwitterIdeatorVoice {
  # field Query.EntrypointTwitterIdeatorVoice($researchSlug: String) {
    me {
      asBfCurrentViewerLoggedIn {
        organization {
          IdentityEditor
        }
      }
    }
  }
`)(
  function EntrypointTwitterIdeatorVoice(
    { data },
  ){
    return {
      Body: data?.me?.asBfCurrentViewerLoggedIn?.organization?.IdentityEditor,
      title: "Twitter Voice",
    };
  },
);
