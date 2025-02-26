import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { getLogger } from "packages/logger.ts";
const logger = getLogger(import.meta);

iso(`entrypoint Mutation.ReviseBlog`);
export const ReviseBlogMutation = iso(`
  field Mutation.ReviseBlog($blogPost: String!) {
    reviseBlog(blogPost: $blogPost){
      __typename
    }
  }
`)(function ReviseBlog({ data }) {
  logger.info("reviseBlogMutation", data);
  return data;
});
