import { type BfOrganization__SimpleComposer__output_type } from '../../BfOrganization/SimpleComposer/output_type.ts';

export type Query__EntrypointTwitterIdeatorCompose__param = {
  readonly data: {
    readonly me: ({
      readonly organization: ({
        readonly SimpleComposer: BfOrganization__SimpleComposer__output_type,
      } | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
