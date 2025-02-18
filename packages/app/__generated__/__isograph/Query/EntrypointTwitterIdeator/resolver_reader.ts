import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointTwitterIdeator__param } from './param_type.ts';
import { Query__EntrypointTwitterIdeator__output_type } from './output_type.ts';
import { EntrypointTwitterIdeator as resolver } from '../../../../entrypoints/EntrypointTwitterIdeator.ts';
import BfCurrentViewerLoggedIn__asBfCurrentViewerLoggedIn__resolver_reader from '../../BfCurrentViewerLoggedIn/asBfCurrentViewerLoggedIn/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointTwitterIdeator__param> = [
  {
    kind: "Linked",
    fieldName: "me",
    alias: null,
    arguments: null,
    condition: null,
    selections: [
      {
        kind: "Linked",
        fieldName: "asBfCurrentViewerLoggedIn",
        alias: null,
        arguments: null,
        condition: BfCurrentViewerLoggedIn__asBfCurrentViewerLoggedIn__resolver_reader,
        selections: [
          {
            kind: "Linked",
            fieldName: "storyBank",
            alias: null,
            arguments: null,
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
        ],
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointTwitterIdeator__param,
  Query__EntrypointTwitterIdeator__output_type
> = {
  kind: "EagerReaderArtifact",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
