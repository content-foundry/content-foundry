import { type BfCurrentViewerLoggedIn__EditVoice__output_type } from '../../BfCurrentViewerLoggedIn/EditVoice/output_type.ts';

export type Query__EntrypointTwitterIdeatorVoice__param = {
  readonly data: {
    readonly me: ({
      /**
A client pointer for the BfCurrentViewerLoggedIn type.
      */
      readonly asBfCurrentViewerLoggedIn: ({
        readonly EditVoice: BfCurrentViewerLoggedIn__EditVoice__output_type,
      } | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
