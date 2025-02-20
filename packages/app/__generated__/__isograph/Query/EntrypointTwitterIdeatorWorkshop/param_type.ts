import { type BfOrganization__Workshopping__output_type } from '../../BfOrganization/Workshopping/output_type.ts';

export type Query__EntrypointTwitterIdeatorWorkshop__param = {
  readonly data: {
    readonly me: ({
      readonly organization: ({
        readonly Workshopping: BfOrganization__Workshopping__output_type,
      } | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
