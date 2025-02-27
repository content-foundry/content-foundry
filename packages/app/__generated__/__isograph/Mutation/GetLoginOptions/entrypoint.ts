import type {IsographEntrypoint, NormalizationAst, RefetchQueryNormalizationArtifactWrapper} from '@isograph/react';
import {Mutation__GetLoginOptions__param} from './param_type.ts';
import {Mutation__GetLoginOptions__output_type} from './output_type.ts';
import readerResolver from './resolver_reader.ts';
const nestedRefetchQueries: RefetchQueryNormalizationArtifactWrapper[] = [];

const queryText = 'mutation GetLoginOptions ($email: String!) {\
  getLoginOptions____email___v_email: getLoginOptions(email: $email),\
}';

const normalizationAst: NormalizationAst = {
  kind: "NormalizationAst",
  selections: [
    {
      kind: "Scalar",
      fieldName: "getLoginOptions",
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
  Mutation__GetLoginOptions__param,
  Mutation__GetLoginOptions__output_type,
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
