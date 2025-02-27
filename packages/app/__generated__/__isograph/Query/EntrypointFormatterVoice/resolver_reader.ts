import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointFormatterVoice__param } from './param_type.ts';
import { Query__EntrypointFormatterVoice__output_type } from './output_type.ts';
import { EntrypointFormatterVoice as resolver } from '../../../../entrypoints/EntrypointFormatterVoice.ts';
import BfCurrentViewerLoggedIn__asBfCurrentViewerLoggedIn__resolver_reader from '../../BfCurrentViewerLoggedIn/asBfCurrentViewerLoggedIn/resolver_reader.ts';
import BfOrganization__IdentityEditor__resolver_reader from '../../BfOrganization/IdentityEditor/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointFormatterVoice__param> = [
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
  Query__EntrypointFormatterVoice__param,
  Query__EntrypointFormatterVoice__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointFormatterVoice",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
