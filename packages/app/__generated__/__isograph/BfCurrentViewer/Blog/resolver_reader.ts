import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfCurrentViewer__Blog__param } from './param_type.ts';
import { Blog as resolver } from '../../../../components/BfCurrentViewer/Blog.tsx';
import BfBlog__BlogPostList__resolver_reader from '../../BfBlog/BlogPostList/resolver_reader.ts';

const readerAst: ReaderAst<BfCurrentViewer__Blog__param> = [
  {
    kind: "Linked",
    fieldName: "blog",
    alias: null,
    arguments: null,
    condition: null,
    isUpdatable: false,
    selections: [
      {
        kind: "Resolver",
        alias: "BlogPostList",
        arguments: null,
        readerArtifact: BfBlog__BlogPostList__resolver_reader,
        usedRefetchQueries: [],
      },
    ],
  },
];

const artifact: ComponentReaderArtifact<
  BfCurrentViewer__Blog__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfCurrentViewer.Blog",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
