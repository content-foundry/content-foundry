import type {IsographEntrypoint, NormalizationAst, RefetchQueryNormalizationArtifactWrapper} from '@isograph/react';
import {Mutation__LoginAsDemoPerson__param} from './param_type.ts';
import {Mutation__LoginAsDemoPerson__output_type} from './output_type.ts';
import readerResolver from './resolver_reader.ts';
const nestedRefetchQueries: RefetchQueryNormalizationArtifactWrapper[] = [];

const queryText = 'mutation LoginAsDemoPerson  {\
  loginAsDemoPerson {\
    id,\
    __typename,\
  },\
}';

const normalizationAst: NormalizationAst = {
  kind: "NormalizationAst",
  selections: [
    {
      kind: "Linked",
      fieldName: "loginAsDemoPerson",
      arguments: null,
      concreteType: "BfCurrentViewerLoggedIn",
      selections: [
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
  Mutation__LoginAsDemoPerson__param,
  Mutation__LoginAsDemoPerson__output_type,
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
