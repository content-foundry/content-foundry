import { type BfOrganization__HistorySidebar__output_type } from '../../BfOrganization/HistorySidebar/output_type.ts';
import { type BfOrganization__Sidebar__output_type } from '../../BfOrganization/Sidebar/output_type.ts';

export type BfOrganization__Workshopping__param = {
  readonly data: {
    readonly Sidebar: BfOrganization__Sidebar__output_type,
    readonly HistorySidebar: BfOrganization__HistorySidebar__output_type,
    readonly creation: ({
      readonly originalText: (string | null),
      readonly suggestions: (ReadonlyArray<({
        readonly tweet: (string | null),
        readonly explanation: (string | null),
      } | null)> | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
