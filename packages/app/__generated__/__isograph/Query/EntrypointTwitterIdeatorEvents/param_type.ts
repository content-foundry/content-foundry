import { type BfOrganization__Research__output_type } from '../../BfOrganization/Research/output_type.ts';

export type Query__EntrypointTwitterIdeatorEvents__param = {
  readonly data: {
    readonly me: ({
      readonly organization: ({
        readonly Research: BfOrganization__Research__output_type,
      } | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
