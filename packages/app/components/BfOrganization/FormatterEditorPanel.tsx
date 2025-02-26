import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { getLogger } from "packages/logger.ts";
import { BfDsTextArea } from "packages/bfDs/components/BfDsTextArea.tsx";
const logger = getLogger(import.meta);

export const FormatterEditorPanel = iso(`
  field BfOrganization.FormatterEditorPanel @component {
    __typename
  }
`)(
  function FormatterEditorPanel(
    { data },
  ) {
    logger.debug(data.__typename);
    return (
      <div className="flex1">
        <BfDsTextArea
          onChange={() => logger.info("changed")}
          placeholder="TODO: Markdown editor"
        />
      </div>
    );
  },
);
