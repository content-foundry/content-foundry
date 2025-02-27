import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

export const GetLoginOptionsMutation = iso(`
  field Mutation.GetLoginOptions($email: String!) {
    getLoginOptions(email: $email)
  }
`)(function GetLoginOptionsMutation({ data }) {
  return data?.getLoginOptions;
});
