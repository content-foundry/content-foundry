import type {IsographEntrypoint, NormalizationAst, RefetchQueryNormalizationArtifactWrapper} from '@isograph/react';
import {Query__EntrypointTwitterIdeator__param} from './param_type.ts';
import {Query__EntrypointTwitterIdeator__output_type} from './output_type.ts';
import readerResolver from './resolver_reader.ts';
const nestedRefetchQueries: RefetchQueryNormalizationArtifactWrapper[] = [];

const queryText = 'query EntrypointTwitterIdeator  {\
  me {\
    __typename,\
    id,\
    ... on BfCurrentViewerLoggedIn {\
      id,\
      __typename,\
      organization {\
        id,\
        identity {\
          voice,\
        },\
      },\
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
            {
              kind: "Linked",
              fieldName: "organization",
              arguments: null,
              concreteType: "BfOrganization",
              selections: [
                {
                  kind: "Scalar",
                  fieldName: "id",
                  arguments: null,
                },
                {
                  kind: "Linked",
                  fieldName: "identity",
                  arguments: null,
                  concreteType: "BfOrganization_Identity",
                  selections: [
                    {
                      kind: "Scalar",
                      fieldName: "voice",
                      arguments: null,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
const artifact: IsographEntrypoint<
  Query__EntrypointTwitterIdeator__param,
  Query__EntrypointTwitterIdeator__output_type
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
