import type {IsographEntrypoint, NormalizationAst, RefetchQueryNormalizationArtifactWrapper} from '@isograph/react';
import {Mutation__CheckEmail__param} from './param_type.ts';
import {Mutation__CheckEmail__output_type} from './output_type.ts';
import readerResolver from './resolver_reader.ts';
const nestedRefetchQueries: RefetchQueryNormalizationArtifactWrapper[] = [];

const queryText = 'mutation CheckEmail ($email: String!) {\
  checkEmail____email___v_email: checkEmail(email: $email),\
}';

const normalizationAst: NormalizationAst = {
  kind: "NormalizationAst",
  selections: [
    {
      kind: "Scalar",
      fieldName: "checkEmail",
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
  Mutation__CheckEmail__param,
  Mutation__CheckEmail__output_type,
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
