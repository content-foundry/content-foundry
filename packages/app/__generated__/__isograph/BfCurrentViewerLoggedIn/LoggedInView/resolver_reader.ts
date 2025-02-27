import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfCurrentViewerLoggedIn__LoggedInView__param } from './param_type.ts';
import { LoggedInView as resolver } from '../../../../components/BfCurrentViewer/BfCurrentViewerLoggedIn/LoggedInView.tsx';

const readerAst: ReaderAst<BfCurrentViewerLoggedIn__LoggedInView__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
];

const artifact: ComponentReaderArtifact<
  BfCurrentViewerLoggedIn__LoggedInView__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfCurrentViewerLoggedIn.LoggedInView",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
