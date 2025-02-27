import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfOrganization__BlogRevisionsSidebar__param } from './param_type.ts';
import { BlogRevisionsSidebar as resolver } from '../../../../components/BfOrganization/BlogRevisionsSidebar.tsx';

const readerAst: ReaderAst<BfOrganization__BlogRevisionsSidebar__param> = [
  {
    kind: "Linked",
    fieldName: "creation",
    alias: null,
    arguments: null,
    condition: null,
    isUpdatable: false,
    selections: [
      {
        kind: "Linked",
        fieldName: "revisions",
        alias: null,
        arguments: null,
        condition: null,
        isUpdatable: false,
        selections: [
          {
            kind: "Scalar",
            fieldName: "revisionTitle",
            alias: null,
            arguments: null,
            isUpdatable: false,
          },
          {
            kind: "Scalar",
            fieldName: "original",
            alias: null,
            arguments: null,
            isUpdatable: false,
          },
          {
            kind: "Scalar",
            fieldName: "revision",
            alias: null,
            arguments: null,
            isUpdatable: false,
          },
          {
            kind: "Scalar",
            fieldName: "explanation",
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
  BfOrganization__BlogRevisionsSidebar__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfOrganization.BlogRevisionsSidebar",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
