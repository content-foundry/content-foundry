import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointTwitter__param } from './param_type.ts';
import { Query__EntrypointTwitter__output_type } from './output_type.ts';
import { EntrypointTwitter as resolver } from '../../../../entrypoints/EntrypointTwitter.ts';
import BfCurrentViewerLoggedIn__TwitterIdeator__resolver_reader from '../../BfCurrentViewerLoggedIn/TwitterIdeator/resolver_reader.ts';
import BfCurrentViewerLoggedIn__asBfCurrentViewerLoggedIn__resolver_reader from '../../BfCurrentViewerLoggedIn/asBfCurrentViewerLoggedIn/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointTwitter__param> = [
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
            kind: "Resolver",
            alias: "TwitterIdeator",
            arguments: null,
            readerArtifact: BfCurrentViewerLoggedIn__TwitterIdeator__resolver_reader,
            usedRefetchQueries: [],
          },
        ],
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointTwitter__param,
  Query__EntrypointTwitter__output_type
> = {
  kind: "EagerReaderArtifact",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
