
export type Query__EntrypointFormatter__param = {
  readonly data: {
    readonly me: ({
      /**
A client pointer for the BfCurrentViewerLoggedIn type.
      */
      readonly asBfCurrentViewerLoggedIn: ({
        readonly organization: ({
          readonly identity: ({
            readonly voice: ({
              readonly voiceSummary: (string | null),
              readonly voice: (string | null),
            } | null),
          } | null),
        } | null),
      } | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
