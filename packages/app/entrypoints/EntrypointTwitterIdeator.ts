import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import type { RouteEntrypoint } from "packages/app/routes.ts";
import { getLogger } from "packages/logger.ts";
import { useRouter } from "packages/app/contexts/RouterContext.tsx";
import { useEffect } from "react";

const _logger = getLogger(import.meta);

export const EntrypointTwitterIdeator = iso(`
  field Query.EntrypointTwitterIdeator {
  # field Query.EntrypointTwitterIdeator($researchSlug: String) {
    me {
      asBfCurrentViewerLoggedIn {
        organization {
          identity {
            voice {
              voiceSummary
              voice
            }
          }
        }
      }
    }
  }
`)(function EntrypointTwitterIdeator({ data }): RouteEntrypoint {
  const { replace } = useRouter();
  const hasVoice = data?.me?.asBfCurrentViewerLoggedIn?.organization?.identity;
  useEffect(() => {
    if (hasVoice) {
      replace("/twitter/research");
      return;
    }
    replace("/twitter/voice");
  }, []);
  return { Body: () => null, title: "Twitter Ideator™" };
});
