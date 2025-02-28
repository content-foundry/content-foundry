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
    const [isInFlight, setIsInFlight] = useState(false);
    const [blogPost, setBlogPost] = useState("");
    const { commit } = useMutation(reviseBlogMutation);

    const fullEditorStyle = {
      flex: 1,
      width: "100%",
      border: "none",
      resize: "none" as const,
      borderRadius: "0",
      outline: "none",
      padding: 30,
    };
    return (
      <div className="flex1 flexColumn">
        <BfDsTextArea
          onChange={(e) => {
            setBlogPost(e.target.value);
          }}
          value={blogPost}
          placeholder="TODO: Markdown editor"
          xstyle={fullEditorStyle}
        />
        <div className="selfAlignEnd">
          <BfDsButton
            kind="primary"
            text="Get suggestions"
            onClick={() => {
              setIsInFlight(true);
              commit({ blogPost: blogPost }, {
                onError: () => {
                  logger.error("An error occurred.");
                },
                onComplete: (reviseBlogMutationData) => {
                  setIsInFlight(false);
                  logger.debug(
                    "blog created successfully",
                    reviseBlogMutationData,
                  );
                },
              });
            }}
            showSpinner={isInFlight}
          />
        </div>
      </div>
    );
  },
);
