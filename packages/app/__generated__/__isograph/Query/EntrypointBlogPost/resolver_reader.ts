import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointBlogPost__param } from './param_type.ts';
import { Query__EntrypointBlogPost__output_type } from './output_type.ts';
import { EntrypointBlogPost as resolver } from '../../../../entrypoints/EntrypointBlogPost.ts';
import BfBlogPost__BlogPostListItem__resolver_reader from '../../BfBlogPost/BlogPostListItem/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointBlogPost__param> = [
  {
    kind: "Linked",
    fieldName: "me",
    alias: null,
    arguments: null,
    condition: null,
    isUpdatable: false,
    selections: [
      {
        kind: "Linked",
        fieldName: "blog",
        alias: null,
        arguments: null,
        condition: null,
        isUpdatable: false,
        selections: [
          {
            kind: "Linked",
            fieldName: "post",
            alias: null,
            arguments: [
              [
                "id",
                { kind: "Variable", name: "slug" },
              ],
            ],
            condition: null,
            isUpdatable: false,
            selections: [
              {
                kind: "Scalar",
                fieldName: "__typename",
                alias: null,
                arguments: null,
                isUpdatable: false,
              },
              {
                kind: "Resolver",
                alias: "BlogPostListItem",
                arguments: null,
                readerArtifact: BfBlogPost__BlogPostListItem__resolver_reader,
                usedRefetchQueries: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointBlogPost__param,
  Query__EntrypointBlogPost__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointBlogPost",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
