import { type BfOrganization__SessionsSidebar__output_type } from '../../BfOrganization/SessionsSidebar/output_type.ts';
import { type BfOrganization__Sidebar__output_type } from '../../BfOrganization/Sidebar/output_type.ts';
import { type BfOrganization_Research__Topic__output_type } from '../../BfOrganization_Research/Topic/output_type.ts';
import { type BfOrganization_Research__Topics__output_type } from '../../BfOrganization_Research/Topics/output_type.ts';

export type BfOrganization__Research__param = {
  readonly data: {
    readonly Sidebar: BfOrganization__Sidebar__output_type,
    readonly SessionsSidebar: BfOrganization__SessionsSidebar__output_type,
    readonly research: ({
      readonly Topics: BfOrganization_Research__Topics__output_type,
      readonly Topic: BfOrganization_Research__Topic__output_type,
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
