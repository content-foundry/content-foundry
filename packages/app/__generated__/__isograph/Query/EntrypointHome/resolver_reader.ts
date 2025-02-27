import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointHome__param } from './param_type.ts';
import { Query__EntrypointHome__output_type } from './output_type.ts';
import { EntrypointHome as resolver } from '../../../../entrypoints/EntrypointHome.ts';
import BfCurrentViewer__Home__resolver_reader from '../../BfCurrentViewer/Home/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointHome__param> = [
  {
    kind: "Linked",
    fieldName: "me",
    alias: null,
    arguments: null,
    condition: null,
    isUpdatable: false,
    selections: [
      {
        kind: "Resolver",
        alias: "Home",
        arguments: null,
        readerArtifact: BfCurrentViewer__Home__resolver_reader,
        usedRefetchQueries: [],
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointHome__param,
  Query__EntrypointHome__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointHome",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
