import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfOrganization__Sidebar__param } from './param_type.ts';
import { Sidebar as resolver } from '../../../../components/BfOrganization/Sidebar.tsx';

const readerAst: ReaderAst<BfOrganization__Sidebar__param> = [
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
        fieldName: "twitter",
        alias: null,
        arguments: null,
        condition: null,
        isUpdatable: false,
        selections: [
          {
            kind: "Scalar",
            fieldName: "handle",
            alias: null,
            arguments: null,
            isUpdatable: false,
          },
          {
            kind: "Scalar",
            fieldName: "name",
            alias: null,
            arguments: null,
            isUpdatable: false,
          },
          {
            kind: "Scalar",
            fieldName: "imgUrl",
            alias: null,
            arguments: null,
            isUpdatable: false,
          },
        ],
      },
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
];

const artifact: ComponentReaderArtifact<
  BfOrganization__Sidebar__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfOrganization.Sidebar",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
