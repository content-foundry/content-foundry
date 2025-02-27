import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointBlog__param } from './param_type.ts';
import { Query__EntrypointBlog__output_type } from './output_type.ts';
import { EntrypointBlog as resolver } from '../../../../entrypoints/EntrypointBlog.tsx';
import BfCurrentViewer__Blog__resolver_reader from '../../BfCurrentViewer/Blog/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointBlog__param> = [
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
            kind: "Scalar",
            fieldName: "name",
            alias: null,
            arguments: null,
            isUpdatable: false,
          },
        ],
      },
      {
        kind: "Resolver",
        alias: "Blog",
        arguments: null,
        readerArtifact: BfCurrentViewer__Blog__resolver_reader,
        usedRefetchQueries: [],
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointBlog__param,
  Query__EntrypointBlog__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointBlog",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
