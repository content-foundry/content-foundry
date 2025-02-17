import { type BfCurrentViewerLoggedIn__TwitterIdeator__output_type } from '../../BfCurrentViewerLoggedIn/TwitterIdeator/output_type.ts';

export type Query__EntrypointTwitter__param = {
  readonly data: {
    readonly me: ({
      /**
A client pointer for the BfCurrentViewerLoggedIn type.
      */
      readonly asBfCurrentViewerLoggedIn: ({
        readonly TwitterIdeator: BfCurrentViewerLoggedIn__TwitterIdeator__output_type,
      } | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
