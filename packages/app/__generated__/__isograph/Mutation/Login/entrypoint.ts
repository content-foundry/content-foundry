import type {IsographEntrypoint, NormalizationAst, RefetchQueryNormalizationArtifactWrapper} from '@isograph/react';
import {Mutation__Login__param} from './param_type.ts';
import {Mutation__Login__output_type} from './output_type.ts';
import readerResolver from './resolver_reader.ts';
const nestedRefetchQueries: RefetchQueryNormalizationArtifactWrapper[] = [];

const queryText = 'mutation Login ($email: String!, $authResp: JSONString!) {\
  login____email___v_email____authResp___v_authResp: login(email: $email, authResp: $authResp) {\
    __typename,\
    id,\
    __typename,\
  },\
}';

const normalizationAst: NormalizationAst = {
  kind: "NormalizationAst",
  selections: [
    {
      kind: "Linked",
      fieldName: "login",
      arguments: [
        [
          "email",
          { kind: "Variable", name: "email" },
        ],

        [
          "authResp",
          { kind: "Variable", name: "authResp" },
        ],
      ],
      concreteType: null,
      selections: [
        {
          kind: "Scalar",
          fieldName: "__typename",
          arguments: null,
        },
        {
          kind: "Scalar",
          fieldName: "id",
          arguments: null,
        },
        {
          kind: "Scalar",
          fieldName: "__typename",
          arguments: null,
        },
      ],
    },
  ],
};
const artifact: IsographEntrypoint<
  Mutation__Login__param,
  Mutation__Login__output_type,
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
