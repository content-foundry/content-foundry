import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

iso(`entrypoint Mutation.LoginAsDemoPerson`);
export const LoginAsDemoPersonMutation = iso(`
  field Mutation.LoginAsDemoPerson {
    loginAsDemoPerson {
      __typename
    }
  }
`)(function LoginAsDemoPersonMutation({ data }) {
  return data?.loginAsDemoPerson?.__typename;
});
