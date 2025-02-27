import type {IsographEntrypoint, NormalizationAst, RefetchQueryNormalizationArtifactWrapper} from '@isograph/react';
import {Query__EntrypointBlogPost__param} from './param_type.ts';
import {Query__EntrypointBlogPost__output_type} from './output_type.ts';
import readerResolver from './resolver_reader.ts';
const nestedRefetchQueries: RefetchQueryNormalizationArtifactWrapper[] = [];

const queryText = 'query EntrypointBlogPost ($slug: ID) {\
  me {\
    __typename,\
    id,\
    blog {\
      id,\
      post____id___v_slug: post(id: $slug) {\
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
              kind: "Linked",
              fieldName: "post",
              arguments: [
                [
                  "id",
                  { kind: "Variable", name: "slug" },
                ],
              ],
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
};
const artifact: IsographEntrypoint<
  Query__EntrypointBlogPost__param,
  Query__EntrypointBlogPost__output_type,
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
