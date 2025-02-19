import { type BfOrganization__Sidebar__output_type } from '../../BfOrganization/Sidebar/output_type.ts';
import { type BfOrganization_Research__SuggestionsPage__output_type } from '../../BfOrganization_Research/SuggestionsPage/output_type.ts';

export type BfOrganization__Research__param = {
  readonly data: {
    readonly Sidebar: BfOrganization__Sidebar__output_type,
    readonly research: ({
      readonly SuggestionsPage: BfOrganization_Research__SuggestionsPage__output_type,
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
