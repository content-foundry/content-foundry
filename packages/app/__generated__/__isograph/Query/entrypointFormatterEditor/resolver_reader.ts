import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__entrypointFormatterEditor__param } from './param_type.ts';
import { Query__entrypointFormatterEditor__output_type } from './output_type.ts';
import { entrypointFormatterEditor as resolver } from '../../../../entrypoints/entrypointFormatterEditor.ts';
import BfOrganization__FormatterEditor__resolver_reader from '../../BfOrganization/FormatterEditor/resolver_reader.ts';

const readerAst: ReaderAst<Query__entrypointFormatterEditor__param> = [
  {
    kind: "Linked",
    fieldName: "me",
    alias: null,
    arguments: null,
    condition: null,
    selections: [
      {
        kind: "Linked",
        fieldName: "organization",
        alias: null,
        arguments: null,
        condition: null,
        selections: [
          {
            kind: "Resolver",
            alias: "FormatterEditor",
            arguments: null,
            readerArtifact: BfOrganization__FormatterEditor__resolver_reader,
            usedRefetchQueries: [],
          },
        ],
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Query__entrypointFormatterEditor__param,
  Query__entrypointFormatterEditor__output_type
> = {
  kind: "EagerReaderArtifact",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
