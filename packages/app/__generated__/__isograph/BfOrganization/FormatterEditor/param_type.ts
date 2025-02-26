import { type BfOrganization__BlogRevisionsSidebar__output_type } from '../../BfOrganization/BlogRevisionsSidebar/output_type.ts';
import { type BfOrganization__FormatterEditorPanel__output_type } from '../../BfOrganization/FormatterEditorPanel/output_type.ts';
import { type BfOrganization__FormatterSidebar__output_type } from '../../BfOrganization/FormatterSidebar/output_type.ts';

export type BfOrganization__FormatterEditor__param = {
  readonly data: {
    readonly FormatterSidebar: BfOrganization__FormatterSidebar__output_type,
    readonly FormatterEditorPanel: BfOrganization__FormatterEditorPanel__output_type,
    readonly BlogRevisionsSidebar: BfOrganization__BlogRevisionsSidebar__output_type,
  },
  readonly parameters: Record<PropertyKey, never>,
};
