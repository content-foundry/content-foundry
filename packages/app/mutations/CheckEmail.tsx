import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

export const CheckEmailMutation = iso(`
  field Mutation.CheckEmail($email: String!) {
    checkEmail(email: $email)
  }
`)(function CheckEmailMutation({ data }) {
  logger.debug("CheckEmailMutation", data);
  return data?.checkEmail;
});
