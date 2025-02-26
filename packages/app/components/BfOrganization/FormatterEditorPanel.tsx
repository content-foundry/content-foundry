import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { getLogger } from "packages/logger.ts";
import { BfDsTextArea } from "packages/bfDs/components/BfDsTextArea.tsx";
import { useState } from "react";
import { useMutation } from "packages/app/hooks/isographPrototypes/useMutation.tsx";
import reviseBlogMutation from "packages/app/__generated__/__isograph/Mutation/ReviseBlog/entrypoint.ts";
import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
const logger = getLogger(import.meta);

export const FormatterEditorPanel = iso(`
  field BfOrganization.FormatterEditorPanel @component {
    __typename
  }
`)(
  function FormatterEditorPanel(
    { data },
  ) {
    logger.info("FormatterEditorPanel", data.__typename);
    const [blogPost, setBlogPost] = useState("");
    const { commit } = useMutation(reviseBlogMutation);
    return (
      <div className="flex1">
        <BfDsTextArea
          onChange={(e) => {
            setBlogPost(e.target.value);
          }}
          value={blogPost}
          placeholder="TODO: Markdown editor"
        />
        <BfDsButton
          kind="primary"
          text="Submit"
          onClick={() => {
            commit({ blogPost: blogPost }, {
              onError: () => {
                logger.error("An error occurred.");
              },
              onComplete: (reviseBlogMutationData) => {
                logger.debug(
                  "blog created successfully",
                  reviseBlogMutationData,
                );
              },
            });
          }}
        />
      </div>
    );
  },
);
