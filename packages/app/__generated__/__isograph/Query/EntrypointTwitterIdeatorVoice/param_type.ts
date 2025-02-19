import { type BfOrganization__IdentityEditor__output_type } from '../../BfOrganization/IdentityEditor/output_type.ts';

export type Query__EntrypointTwitterIdeatorVoice__param = {
  readonly data: {
    readonly me: ({
      /**
A client pointer for the BfCurrentViewerLoggedIn type.
      */
      readonly asBfCurrentViewerLoggedIn: ({
        readonly organization: ({
          readonly IdentityEditor: BfOrganization__IdentityEditor__output_type,
        } | null),
      } | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
