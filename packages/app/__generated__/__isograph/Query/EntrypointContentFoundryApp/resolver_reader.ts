import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointContentFoundryApp__param } from './param_type.ts';
import { Query__EntrypointContentFoundryApp__output_type } from './output_type.ts';
import { EntrypointContentFoundryApp as resolver } from '../../../../entrypoints/EntrypointApp.tsx';
import BfCurrentViewerLoggedIn__LoggedInView__resolver_reader from '../../BfCurrentViewerLoggedIn/LoggedInView/resolver_reader.ts';
import BfCurrentViewerLoggedIn__asBfCurrentViewerLoggedIn__resolver_reader from '../../BfCurrentViewerLoggedIn/asBfCurrentViewerLoggedIn/resolver_reader.ts';
import BfCurrentViewerLoggedOut__LoggedOutView__resolver_reader from '../../BfCurrentViewerLoggedOut/LoggedOutView/resolver_reader.ts';
import BfCurrentViewerLoggedOut__asBfCurrentViewerLoggedOut__resolver_reader from '../../BfCurrentViewerLoggedOut/asBfCurrentViewerLoggedOut/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointContentFoundryApp__param> = [
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
            kind: "Resolver",
            alias: "LoggedInView",
            arguments: null,
            readerArtifact: BfCurrentViewerLoggedIn__LoggedInView__resolver_reader,
            usedRefetchQueries: [],
          },
        ],
      },
      {
        kind: "Linked",
        fieldName: "asBfCurrentViewerLoggedOut",
        alias: null,
        arguments: null,
        condition: BfCurrentViewerLoggedOut__asBfCurrentViewerLoggedOut__resolver_reader,
        isUpdatable: false,
        selections: [
          {
            kind: "Resolver",
            alias: "LoggedOutView",
            arguments: null,
            readerArtifact: BfCurrentViewerLoggedOut__LoggedOutView__resolver_reader,
            usedRefetchQueries: [],
          },
        ],
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointContentFoundryApp__param,
  Query__EntrypointContentFoundryApp__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointContentFoundryApp",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
