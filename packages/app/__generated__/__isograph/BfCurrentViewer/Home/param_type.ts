import { type BfContentCollection__ContentCollection__output_type } from '../../BfContentCollection/ContentCollection/output_type.ts';

export type BfCurrentViewer__Home__param = {
  readonly data: {
    readonly __typename: string,
    readonly contentCollection: ({
      readonly ContentCollection: BfContentCollection__ContentCollection__output_type,
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
