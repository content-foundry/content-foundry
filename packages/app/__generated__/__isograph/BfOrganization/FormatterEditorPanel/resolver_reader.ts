import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfOrganization__FormatterEditorPanel__param } from './param_type.ts';
import { FormatterEditorPanel as resolver } from '../../../../components/BfOrganization/FormatterEditorPanel.tsx';

const readerAst: ReaderAst<BfOrganization__FormatterEditorPanel__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
  },
];

const artifact: ComponentReaderArtifact<
  BfOrganization__FormatterEditorPanel__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  componentName: "BfOrganization.FormatterEditorPanel",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
