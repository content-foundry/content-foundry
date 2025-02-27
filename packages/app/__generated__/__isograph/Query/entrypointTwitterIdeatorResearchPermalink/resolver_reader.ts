import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__entrypointTwitterIdeatorResearchPermalink__param } from './param_type.ts';
import { Query__entrypointTwitterIdeatorResearchPermalink__output_type } from './output_type.ts';
import { entrypointTwitterIdeatorResearchPermalink as resolver } from '../../../../entrypoints/EntrypointTwitterIdeatorResearchPermalink.ts';
import BfCurrentViewerLoggedIn__asBfCurrentViewerLoggedIn__resolver_reader from '../../BfCurrentViewerLoggedIn/asBfCurrentViewerLoggedIn/resolver_reader.ts';

const readerAst: ReaderAst<Query__entrypointTwitterIdeatorResearchPermalink__param> = [
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
  Query__entrypointTwitterIdeatorResearchPermalink__param,
  Query__entrypointTwitterIdeatorResearchPermalink__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.entrypointTwitterIdeatorResearchPermalink",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
