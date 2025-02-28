import { type BfContentItem__ContentItem__output_type } from '../../BfContentItem/ContentItem/output_type.ts';

export type BfContentCollection__ContentCollection__param = {
  readonly data: {
    readonly __typename: string,
    readonly items: (ReadonlyArray<({
      readonly ContentItem: BfContentItem__ContentItem__output_type,
      /**
Unique identifier for the resource
      */
      readonly id: string,
    } | null)> | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
