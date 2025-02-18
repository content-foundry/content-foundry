import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfOrganization__IdentityEditor__param } from './param_type.ts';
import { EntrypointTwitterIdeatorVoice as resolver } from '../../../../components/BfOrganization/IdentityEditor.tsx';

const readerAst: ReaderAst<BfOrganization__IdentityEditor__param> = [
  {
    kind: "Linked",
    fieldName: "identity",
    alias: null,
    arguments: null,
    condition: null,
    selections: [
      {
        kind: "Scalar",
        fieldName: "__typename",
        alias: null,
        arguments: null,
      },
    ],
  },
];

const artifact: ComponentReaderArtifact<
  BfOrganization__IdentityEditor__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  componentName: "BfOrganization.IdentityEditor",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
