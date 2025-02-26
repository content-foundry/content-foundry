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
    selections: [
      {
        kind: "Linked",
        fieldName: "revisions",
        alias: null,
        arguments: null,
        condition: null,
        selections: [
          {
            kind: "Scalar",
            fieldName: "revisionTitle",
            alias: null,
            arguments: null,
          },
          {
            kind: "Scalar",
            fieldName: "original",
            alias: null,
            arguments: null,
          },
          {
            kind: "Scalar",
            fieldName: "revision",
            alias: null,
            arguments: null,
          },
          {
            kind: "Scalar",
            fieldName: "explanation",
            alias: null,
            arguments: null,
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
  componentName: "BfOrganization.BlogRevisionsSidebar",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
