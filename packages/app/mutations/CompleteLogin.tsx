import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

export const LoginMutation = iso(`
  field Mutation.Login($email: String!, $authResp: JSONString!) {
    login(email: $email, authResp: $authResp) {
      __typename
    }
  }
`)(function LoginMutation({ data }) {
  return data?.login?.__typename;
});
