import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Mutation__ReviseBlog__param } from './param_type.ts';
import { Mutation__ReviseBlog__output_type } from './output_type.ts';
import { ReviseBlogMutation as resolver } from '../../../../mutations/ReviseBlog.ts';

const readerAst: ReaderAst<Mutation__ReviseBlog__param> = [
  {
    kind: "Linked",
    fieldName: "reviseBlog",
    alias: null,
    arguments: [
      [
        "blogPost",
        { kind: "Variable", name: "blogPost" },
      ],
    ],
    condition: null,
    selections: [
      {
        kind: "Scalar",
        fieldName: "__typename",
        alias: null,
        arguments: null,
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Mutation__ReviseBlog__param,
  Mutation__ReviseBlog__output_type
> = {
  kind: "EagerReaderArtifact",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
