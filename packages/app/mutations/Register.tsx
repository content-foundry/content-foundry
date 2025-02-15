import { getLogger } from "packages/logger.ts";
import { iso } from "packages/app/__generated__/__isograph/iso.ts";

const logger = getLogger(import.meta);

iso(`entrypoint Mutation.Register`);
export const RegisterMutation = iso(`
  field Mutation.Register($attResp: JSONString!, $email: String!) @component {
    register(attResp: $attResp, email: $email) {
      __typename
    }
  }
`)(function RegisterMutation({ data }) {
  if (data?.register?.__typename) {
    // navigate(data.register.nextPage)

    logger.debug("Logged in!");
  }
  return null;
});
