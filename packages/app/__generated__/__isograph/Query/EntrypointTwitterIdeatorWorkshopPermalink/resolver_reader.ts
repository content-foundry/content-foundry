import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointTwitterIdeatorWorkshopPermalink__param } from './param_type.ts';
import { Query__EntrypointTwitterIdeatorWorkshopPermalink__output_type } from './output_type.ts';
import { EntrypointTwitterIdeatorWorkshopPermalink as resolver } from '../../../../entrypoints/EntrypointTwitterIdeatorWorkshopPermalink.ts';
import BfCurrentViewerLoggedIn__asBfCurrentViewerLoggedIn__resolver_reader from '../../BfCurrentViewerLoggedIn/asBfCurrentViewerLoggedIn/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointTwitterIdeatorWorkshopPermalink__param> = [
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
            kind: "Scalar",
            fieldName: "__typename",
            alias: null,
            arguments: null,
            isUpdatable: false,
          },
        ],
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointTwitterIdeatorWorkshopPermalink__param,
  Query__EntrypointTwitterIdeatorWorkshopPermalink__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointTwitterIdeatorWorkshopPermalink",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
