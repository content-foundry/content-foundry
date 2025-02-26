import { type BfOrganization__FormatterEditor__output_type } from '../../BfOrganization/FormatterEditor/output_type.ts';

export type Query__entrypointFormatterEditor__param = {
  readonly data: {
    readonly me: ({
      readonly organization: ({
        readonly FormatterEditor: BfOrganization__FormatterEditor__output_type,
      } | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
