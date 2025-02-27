import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

export const LoginAsDemoPersonMutation = iso(`
  field Mutation.LoginAsDemoPerson {
    loginAsDemoPerson {
      __typename
    }
  }
`)(function LoginAsDemoPersonMutation({ data }) {
  return data?.loginAsDemoPerson?.__typename;
});
