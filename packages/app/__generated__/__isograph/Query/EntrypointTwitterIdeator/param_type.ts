
export type Query__EntrypointTwitterIdeator__param = {
  readonly data: {
    readonly me: ({
      /**
A client pointer for the BfCurrentViewerLoggedIn type.
      */
      readonly asBfCurrentViewerLoggedIn: ({
        readonly organization: ({
          readonly identity: ({
            readonly voice: (string | null),
          } | null),
        } | null),
      } | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
