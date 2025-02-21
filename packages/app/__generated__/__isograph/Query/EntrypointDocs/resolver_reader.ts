import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointDocs__param } from './param_type.ts';
import { Query__EntrypointDocs__output_type } from './output_type.ts';
import { EntrypointDocs as resolver } from '../../../../entrypoints/EntrypointDocs.tsx';

const readerAst: ReaderAst<Query__EntrypointDocs__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointDocs__param,
  Query__EntrypointDocs__output_type
> = {
  kind: "EagerReaderArtifact",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
