import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfBlog__BlogPostList__param } from './param_type.ts';
import { BlogPostList as resolver } from '../../../../components/BfBlog/BlogPostList.tsx';
import BfBlogPost__BlogPostListItem__resolver_reader from '../../BfBlogPost/BlogPostListItem/resolver_reader.ts';

const readerAst: ReaderAst<BfBlog__BlogPostList__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
  {
    kind: "Linked",
    fieldName: "posts",
    alias: null,
    arguments: null,
    condition: null,
    isUpdatable: false,
    selections: [
      {
        kind: "Linked",
        fieldName: "nodes",
        alias: null,
        arguments: null,
        condition: null,
        isUpdatable: false,
        selections: [
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
];

const artifact: ComponentReaderArtifact<
  BfBlog__BlogPostList__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfBlog.BlogPostList",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
