import { type BfStoryBank__CreateVoice__output_type } from '../../BfStoryBank/CreateVoice/output_type.ts';

export type Query__EntrypointTwitterIdeator__param = {
  readonly data: {
    readonly me: ({
      /**
A client pointer for the BfCurrentViewerLoggedIn type.
      */
      readonly asBfCurrentViewerLoggedIn: ({
        readonly storyBank: ({
          readonly __typename: string,
          readonly CreateVoice: BfStoryBank__CreateVoice__output_type,
        } | null),
      } | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
