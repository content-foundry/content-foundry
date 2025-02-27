import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointTwitterIdeatorVoice__param } from './param_type.ts';
import { Query__EntrypointTwitterIdeatorVoice__output_type } from './output_type.ts';
import { EntrypointTwitterIdeatorVoice as resolver } from '../../../../entrypoints/EntrypointTwitterIdeatorVoice.ts';
import BfCurrentViewerLoggedIn__asBfCurrentViewerLoggedIn__resolver_reader from '../../BfCurrentViewerLoggedIn/asBfCurrentViewerLoggedIn/resolver_reader.ts';
import BfOrganization__IdentityEditor__resolver_reader from '../../BfOrganization/IdentityEditor/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointTwitterIdeatorVoice__param> = [
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
        fieldName: "asBfCurrentViewerLoggedIn",
        alias: null,
        arguments: null,
        condition: BfCurrentViewerLoggedIn__asBfCurrentViewerLoggedIn__resolver_reader,
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
                alias: "IdentityEditor",
                arguments: null,
                readerArtifact: BfOrganization__IdentityEditor__resolver_reader,
                usedRefetchQueries: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointTwitterIdeatorVoice__param,
  Query__EntrypointTwitterIdeatorVoice__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointTwitterIdeatorVoice",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
