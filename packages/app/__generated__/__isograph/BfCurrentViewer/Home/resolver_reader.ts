import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfCurrentViewer__Home__param } from './param_type.ts';
import { Home as resolver } from '../../../../components/BfCurrentViewer/Home.tsx';

const readerAst: ReaderAst<BfCurrentViewer__Home__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
  },
  {
    kind: "Linked",
    fieldName: "contentCollection",
    alias: null,
    arguments: null,
    condition: null,
    selections: [
      {
        kind: "Scalar",
        fieldName: "name",
        alias: null,
        arguments: null,
      },
      {
        kind: "Scalar",
        fieldName: "description",
        alias: null,
        arguments: null,
      },
      {
        kind: "Linked",
        fieldName: "items",
        alias: null,
        arguments: null,
        condition: null,
        selections: [
          {
            kind: "Linked",
            fieldName: "edges",
            alias: null,
            arguments: null,
            condition: null,
            selections: [
              {
                kind: "Linked",
                fieldName: "node",
                alias: null,
                arguments: null,
                condition: null,
                selections: [
                  {
                    kind: "Scalar",
                    fieldName: "title",
                    alias: null,
                    arguments: null,
                  },
                  {
                    kind: "Scalar",
                    fieldName: "body",
                    alias: null,
                    arguments: null,
                  },
                  {
                    kind: "Scalar",
                    fieldName: "href",
                    alias: null,
                    arguments: null,
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

const artifact: ComponentReaderArtifact<
  BfCurrentViewer__Home__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  componentName: "BfCurrentViewer.Home",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
