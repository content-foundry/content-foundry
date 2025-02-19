import { type BfCurrentViewerLoggedIn__LoggedInView__output_type } from '../../BfCurrentViewerLoggedIn/LoggedInView/output_type.ts';
import { type BfCurrentViewerLoggedOut__LoggedOutView__output_type } from '../../BfCurrentViewerLoggedOut/LoggedOutView/output_type.ts';

export type Query__EntrypointContentFoundryApp__param = {
  readonly data: {
    readonly me: ({
      /**
A client pointer for the BfCurrentViewerLoggedIn type.
      */
      readonly asBfCurrentViewerLoggedIn: ({
        readonly LoggedInView: BfCurrentViewerLoggedIn__LoggedInView__output_type,
      } | null),
      /**
A client pointer for the BfCurrentViewerLoggedOut type.
      */
      readonly asBfCurrentViewerLoggedOut: ({
        readonly LoggedOutView: BfCurrentViewerLoggedOut__LoggedOutView__output_type,
      } | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
