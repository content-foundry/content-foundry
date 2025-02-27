import type {IsographEntrypoint, NormalizationAst, RefetchQueryNormalizationArtifactWrapper} from '@isograph/react';
import {Mutation__RegistrationOptions__param} from './param_type.ts';
import {Mutation__RegistrationOptions__output_type} from './output_type.ts';
import readerResolver from './resolver_reader.ts';
const nestedRefetchQueries: RefetchQueryNormalizationArtifactWrapper[] = [];

const queryText = 'mutation RegistrationOptions ($email: String!) {\
  registrationOptions____email___v_email: registrationOptions(email: $email),\
}';

const normalizationAst: NormalizationAst = {
  kind: "NormalizationAst",
  selections: [
    {
      kind: "Scalar",
      fieldName: "registrationOptions",
      arguments: [
        [
          "email",
          { kind: "Variable", name: "email" },
        ],
      ],
    },
  ],
};
const artifact: IsographEntrypoint<
  Mutation__RegistrationOptions__param,
  Mutation__RegistrationOptions__output_type,
  NormalizationAst
> = {
  kind: "Entrypoint",
  networkRequestInfo: {
    kind: "NetworkRequestInfo",
    queryText,
    normalizationAst,
  },
  concreteType: "Mutation",
  readerWithRefetchQueries: {
    kind: "ReaderWithRefetchQueries",
    nestedRefetchQueries,
    readerArtifact: readerResolver,
  },
};

export default artifact;
