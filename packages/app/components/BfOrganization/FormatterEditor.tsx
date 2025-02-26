import { iso } from "packages/app/__generated__/__isograph/iso.ts";
// import { useRouter } from "packages/app/contexts/RouterContext.tsx";
import { getLogger } from "packages/logger.ts";
const _logger = getLogger(import.meta);

export const FormatterEditor = iso(`
  field BfOrganization.FormatterEditor @component {
    FormatterSidebar
    FormatterEditorPanel
  }
`)(
  function FormatterEditor(
    { data },
  ) {
    // const routerProps = useRouter();
    // const { editorSlug } = routerProps.routeParams;

    // if (editorSlug) {
    //   logger.debug("FormatterEditor slug is ", editorSlug);
    // }
    const FormatterSidebar = data.FormatterSidebar;
    const FormatterEditorPanel = data.FormatterEditorPanel;
    return (
      <div className="flexRow editor-container">
        {FormatterSidebar && <FormatterSidebar />}
        {FormatterEditorPanel && <FormatterEditorPanel />}
        {/* {SessionsSidebar && <SessionsSidebar />} */}
      </div>
    );
  },
);
