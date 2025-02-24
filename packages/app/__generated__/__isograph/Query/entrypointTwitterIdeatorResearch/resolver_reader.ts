import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__entrypointTwitterIdeatorResearch__param } from './param_type.ts';
import { Query__entrypointTwitterIdeatorResearch__output_type } from './output_type.ts';
import { entrypointTwitterIdeatorResearch as resolver } from '../../../../entrypoints/EntrypointTwitterIdeatorResearch.ts';
import BfOrganization__Research__resolver_reader from '../../BfOrganization/Research/resolver_reader.ts';

const readerAst: ReaderAst<Query__entrypointTwitterIdeatorResearch__param> = [
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
            alias: "Research",
            arguments: null,
            readerArtifact: BfOrganization__Research__resolver_reader,
            usedRefetchQueries: [],
          },
        ],
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Query__entrypointTwitterIdeatorResearch__param,
  Query__entrypointTwitterIdeatorResearch__output_type
> = {
  kind: "EagerReaderArtifact",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
