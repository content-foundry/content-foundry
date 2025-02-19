import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointTwitterIdeatorEvents__param } from './param_type.ts';
import { Query__EntrypointTwitterIdeatorEvents__output_type } from './output_type.ts';
import { EntrypointTwitterIdeatorEvents as resolver } from '../../../../entrypoints/EntrypointTwitterIdeatorEvents.ts';
import BfOrganization__Research__resolver_reader from '../../BfOrganization/Research/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointTwitterIdeatorEvents__param> = [
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
  Query__EntrypointTwitterIdeatorEvents__param,
  Query__EntrypointTwitterIdeatorEvents__output_type
> = {
  kind: "EagerReaderArtifact",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
