import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfCurrentViewerLoggedOut__RegisterButton__param } from './param_type.ts';
import { RegisterButton as resolver } from '../../../../components/BfCurrentViewer/BfCurrentViewerLoggedOut/RegisterButton.tsx';

const readerAst: ReaderAst<BfCurrentViewerLoggedOut__RegisterButton__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
];

const artifact: ComponentReaderArtifact<
  BfCurrentViewerLoggedOut__RegisterButton__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfCurrentViewerLoggedOut.RegisterButton",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
