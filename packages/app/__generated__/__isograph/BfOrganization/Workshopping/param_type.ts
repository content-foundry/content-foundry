import { type BfOrganization__SessionsSidebar__output_type } from '../../BfOrganization/SessionsSidebar/output_type.ts';
import { type BfOrganization__Sidebar__output_type } from '../../BfOrganization/Sidebar/output_type.ts';

export type BfOrganization__Workshopping__param = {
  readonly data: {
    readonly Sidebar: BfOrganization__Sidebar__output_type,
    readonly SessionsSidebar: BfOrganization__SessionsSidebar__output_type,
    readonly creation: ({
      readonly suggestions: (ReadonlyArray<(string | null)> | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
