import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfCurrentViewerLoggedOut__DemoButton__param } from './param_type.ts';
import { DemoButton as resolver } from '../../../../components/BfCurrentViewer/BfCurrentViewerLoggedOut/DemoButton.tsx';

const readerAst: ReaderAst<BfCurrentViewerLoggedOut__DemoButton__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
];

const artifact: ComponentReaderArtifact<
  BfCurrentViewerLoggedOut__DemoButton__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfCurrentViewerLoggedOut.DemoButton",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
