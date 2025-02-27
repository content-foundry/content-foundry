import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointTwitterIdeatorWorkshop__param } from './param_type.ts';
import { Query__EntrypointTwitterIdeatorWorkshop__output_type } from './output_type.ts';
import { EntrypointTwitterIdeatorWorkshop as resolver } from '../../../../entrypoints/EntrypointTwitterIdeatorWorkshop.ts';
import BfOrganization__Workshopping__resolver_reader from '../../BfOrganization/Workshopping/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointTwitterIdeatorWorkshop__param> = [
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
        fieldName: "organization",
        alias: null,
        arguments: null,
        condition: null,
        isUpdatable: false,
        selections: [
          {
            kind: "Resolver",
            alias: "Workshopping",
            arguments: null,
            readerArtifact: BfOrganization__Workshopping__resolver_reader,
            usedRefetchQueries: [],
          },
        ],
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointTwitterIdeatorWorkshop__param,
  Query__EntrypointTwitterIdeatorWorkshop__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointTwitterIdeatorWorkshop",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
