import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import type { RouteEntrypoint } from "packages/app/routes.ts";
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
  ): RouteEntrypoint {
    return {
      Body: data?.me?.asBfCurrentViewerLoggedIn?.organization?.IdentityEditor,
      title: "Twitter Voice",
    };
  },
);
