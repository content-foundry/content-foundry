import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfCurrentViewerLoggedOut__WelcomeVideo__param } from './param_type.ts';
import { WelcomeVideo as resolver } from '../../../../components/BfCurrentViewer/BfCurrentViewerLoggedOut/WelcomeVideo.tsx';

const readerAst: ReaderAst<BfCurrentViewerLoggedOut__WelcomeVideo__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
];

const artifact: ComponentReaderArtifact<
  BfCurrentViewerLoggedOut__WelcomeVideo__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfCurrentViewerLoggedOut.WelcomeVideo",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
