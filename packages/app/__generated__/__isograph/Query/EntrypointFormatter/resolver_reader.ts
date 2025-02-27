import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointFormatter__param } from './param_type.ts';
import { Query__EntrypointFormatter__output_type } from './output_type.ts';
import { EntrypointFormatter as resolver } from '../../../../entrypoints/EntrypointFormatter.ts';
import BfCurrentViewerLoggedIn__asBfCurrentViewerLoggedIn__resolver_reader from '../../BfCurrentViewerLoggedIn/asBfCurrentViewerLoggedIn/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointFormatter__param> = [
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
                kind: "Linked",
                fieldName: "identity",
                alias: null,
                arguments: null,
                condition: null,
                isUpdatable: false,
                selections: [
                  {
                    kind: "Linked",
                    fieldName: "voice",
                    alias: null,
                    arguments: null,
                    condition: null,
                    isUpdatable: false,
                    selections: [
                      {
                        kind: "Scalar",
                        fieldName: "voiceSummary",
                        alias: null,
                        arguments: null,
                        isUpdatable: false,
                      },
                      {
                        kind: "Scalar",
                        fieldName: "voice",
                        alias: null,
                        arguments: null,
                        isUpdatable: false,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointFormatter__param,
  Query__EntrypointFormatter__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointFormatter",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
