import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfOrganization_Research__Topics__param } from './param_type.ts';
import { Topics as resolver } from '../../../../components/BfOrganization/Topics.tsx';

const readerAst: ReaderAst<BfOrganization_Research__Topics__param> = [
  {
    kind: "Linked",
    fieldName: "topics",
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
        kind: "Linked",
        fieldName: "entries",
        alias: null,
        arguments: null,
        condition: null,
        selections: [
          {
            kind: "Scalar",
            fieldName: "type",
            alias: null,
            arguments: null,
          },
          {
            kind: "Scalar",
            fieldName: "name",
            alias: null,
            arguments: null,
          },
          {
            kind: "Scalar",
            fieldName: "summary",
            alias: null,
            arguments: null,
          },
          {
            kind: "Scalar",
            fieldName: "url",
            alias: null,
            arguments: null,
          },
        ],
      },
    ],
  },
];

const artifact: ComponentReaderArtifact<
  BfOrganization_Research__Topics__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  componentName: "BfOrganization_Research.Topics",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
