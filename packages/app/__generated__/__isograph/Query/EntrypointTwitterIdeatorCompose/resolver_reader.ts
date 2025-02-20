import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointTwitterIdeatorCompose__param } from './param_type.ts';
import { Query__EntrypointTwitterIdeatorCompose__output_type } from './output_type.ts';
import { EntrypointTwitterIdeatorCompose as resolver } from '../../../../entrypoints/EntrypointTwitterIdeatorCompose.ts';
import BfOrganization__SimpleComposer__resolver_reader from '../../BfOrganization/SimpleComposer/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointTwitterIdeatorCompose__param> = [
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
            alias: "SimpleComposer",
            arguments: null,
            readerArtifact: BfOrganization__SimpleComposer__resolver_reader,
            usedRefetchQueries: [],
          },
        ],
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointTwitterIdeatorCompose__param,
  Query__EntrypointTwitterIdeatorCompose__output_type
> = {
  kind: "EagerReaderArtifact",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
