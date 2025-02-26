import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

export const EntrypointHome = iso(`
  field Query.EntrypointHome {
    me {
      Home
    }
  }
`)(function EntrypointHome({ data }) {
  const Body = data?.me?.Home;
  logger.debug("dataer", data);
  const title = "Content Foundry: The Content Operating System.";
  return { Body, title };
});
