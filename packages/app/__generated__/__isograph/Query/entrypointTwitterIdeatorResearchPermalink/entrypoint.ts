import type {IsographEntrypoint, NormalizationAst, RefetchQueryNormalizationArtifactWrapper} from '@isograph/react';
import {Query__entrypointTwitterIdeatorResearchPermalink__param} from './param_type.ts';
import {Query__entrypointTwitterIdeatorResearchPermalink__output_type} from './output_type.ts';
import readerResolver from './resolver_reader.ts';
const nestedRefetchQueries: RefetchQueryNormalizationArtifactWrapper[] = [];

const queryText = 'query entrypointTwitterIdeatorResearchPermalink  {\
  me {\
    __typename,\
    id,\
    ... on BfCurrentViewerLoggedIn {\
      id,\
      __typename,\
    },\
  },\
}';

const normalizationAst: NormalizationAst = {
  kind: "NormalizationAst",
  selections: [
    {
      kind: "Linked",
      fieldName: "me",
      arguments: null,
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
          kind: "InlineFragment",
          type: "BfCurrentViewerLoggedIn",
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
    },
  ],
};
const artifact: IsographEntrypoint<
  Query__entrypointTwitterIdeatorResearchPermalink__param,
  Query__entrypointTwitterIdeatorResearchPermalink__output_type,
  NormalizationAst
> = {
  kind: "Entrypoint",
  networkRequestInfo: {
    kind: "NetworkRequestInfo",
    queryText,
    normalizationAst,
  },
  concreteType: "Query",
  readerWithRefetchQueries: {
    kind: "ReaderWithRefetchQueries",
    nestedRefetchQueries,
    readerArtifact: readerResolver,
  },
};

export default artifact;
