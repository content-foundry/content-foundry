import type {IsographEntrypoint, NormalizationAst, RefetchQueryNormalizationArtifactWrapper} from '@isograph/react';
import {Query__EntrypointHome__param} from './param_type.ts';
import {Query__EntrypointHome__output_type} from './output_type.ts';
import readerResolver from './resolver_reader.ts';
const nestedRefetchQueries: RefetchQueryNormalizationArtifactWrapper[] = [];

const queryText = 'query EntrypointHome  {\
  me {\
    __typename,\
    id,\
    __typename,\
    contentCollection {\
      id,\
      description,\
      items {\
        edges {\
          node {\
            id,\
            body,\
            href,\
            title,\
          },\
        },\
      },\
      name,\
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
          kind: "Scalar",
          fieldName: "__typename",
          arguments: null,
        },
        {
          kind: "Linked",
          fieldName: "contentCollection",
          arguments: null,
          concreteType: "BfContentCollection",
          selections: [
            {
              kind: "Scalar",
              fieldName: "id",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "description",
              arguments: null,
            },
            {
              kind: "Linked",
              fieldName: "items",
              arguments: null,
              concreteType: "BfContentItemConnection",
              selections: [
                {
                  kind: "Linked",
                  fieldName: "edges",
                  arguments: null,
                  concreteType: "BfContentItemEdge",
                  selections: [
                    {
                      kind: "Linked",
                      fieldName: "node",
                      arguments: null,
                      concreteType: "BfContentItem",
                      selections: [
                        {
                          kind: "Scalar",
                          fieldName: "id",
                          arguments: null,
                        },
                        {
                          kind: "Scalar",
                          fieldName: "body",
                          arguments: null,
                        },
                        {
                          kind: "Scalar",
                          fieldName: "href",
                          arguments: null,
                        },
                        {
                          kind: "Scalar",
                          fieldName: "title",
                          arguments: null,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              kind: "Scalar",
              fieldName: "name",
              arguments: null,
            },
          ],
        },
      ],
    },
  ],
};
const artifact: IsographEntrypoint<
  Query__EntrypointHome__param,
  Query__EntrypointHome__output_type
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
