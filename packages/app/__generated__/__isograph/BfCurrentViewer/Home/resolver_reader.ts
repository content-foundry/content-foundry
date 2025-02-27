import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfCurrentViewer__Home__param } from './param_type.ts';
import { Home as resolver } from '../../../../components/BfCurrentViewer/Home.tsx';

const readerAst: ReaderAst<BfCurrentViewer__Home__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
  {
    kind: "Linked",
    fieldName: "contentCollection",
    alias: null,
    arguments: [
      [
        "slug",
        { kind: "String", value: "marketing" },
      ],
    ],
    condition: null,
    isUpdatable: false,
    selections: [
      {
        kind: "Linked",
        fieldName: "items",
        alias: null,
        arguments: null,
        condition: null,
        isUpdatable: false,
        selections: [
          {
            kind: "Scalar",
            fieldName: "title",
            alias: null,
            arguments: null,
            isUpdatable: false,
          },
          {
            kind: "Scalar",
            fieldName: "body",
            alias: null,
            arguments: null,
            isUpdatable: false,
          },
          {
            kind: "Scalar",
            fieldName: "href",
            alias: null,
            arguments: null,
            isUpdatable: false,
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
  fieldName: "BfCurrentViewer.Home",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
