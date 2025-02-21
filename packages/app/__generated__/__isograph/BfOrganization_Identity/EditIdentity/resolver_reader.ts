import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfOrganization_Identity__EditIdentity__param } from './param_type.ts';
import { EditIdentity as resolver } from '../../../../components/BfOrganization/EditIdentity.tsx';

const readerAst: ReaderAst<BfOrganization_Identity__EditIdentity__param> = [
  {
    kind: "Linked",
    fieldName: "voice",
    alias: null,
    arguments: null,
    condition: null,
    selections: [
      {
        kind: "Scalar",
        fieldName: "voiceSummary",
        alias: null,
        arguments: null,
      },
      {
        kind: "Scalar",
        fieldName: "voice",
        alias: null,
        arguments: null,
      },
    ],
  },
];

const artifact: ComponentReaderArtifact<
  BfOrganization_Identity__EditIdentity__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  componentName: "BfOrganization_Identity.EditIdentity",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
