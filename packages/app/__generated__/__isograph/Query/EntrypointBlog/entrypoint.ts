import type {IsographEntrypoint, NormalizationAst, RefetchQueryNormalizationArtifactWrapper} from '@isograph/react';
import {Query__EntrypointBlog__param} from './param_type.ts';
import {Query__EntrypointBlog__output_type} from './output_type.ts';
import readerResolver from './resolver_reader.ts';
const nestedRefetchQueries: RefetchQueryNormalizationArtifactWrapper[] = [];

const queryText = 'query EntrypointBlog  {\
  me {\
    __typename,\
    id,\
    blog {\
      id,\
      __typename,\
      name,\
      posts {\
        nodes {\
          id,\
          __typename,\
          author,\
          cta,\
          href,\
          summary,\
          title,\
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
          kind: "Linked",
          fieldName: "blog",
          arguments: null,
          concreteType: "BfBlog",
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
              kind: "Scalar",
              fieldName: "name",
              arguments: null,
            },
            {
              kind: "Linked",
              fieldName: "posts",
              arguments: null,
              concreteType: "BfBlogPostConnection",
              selections: [
                {
                  kind: "Linked",
                  fieldName: "nodes",
                  arguments: null,
                  concreteType: "BfBlogPost",
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
                      kind: "Scalar",
                      fieldName: "author",
                      arguments: null,
                    },
                    {
                      kind: "Scalar",
                      fieldName: "cta",
                      arguments: null,
                    },
                    {
                      kind: "Scalar",
                      fieldName: "href",
                      arguments: null,
                    },
                    {
                      kind: "Scalar",
                      fieldName: "summary",
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
      ],
    },
  ],
};
const artifact: IsographEntrypoint<
  Query__EntrypointBlog__param,
  Query__EntrypointBlog__output_type,
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
