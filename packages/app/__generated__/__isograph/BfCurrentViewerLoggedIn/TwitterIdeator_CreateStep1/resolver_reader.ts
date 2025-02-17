import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfCurrentViewerLoggedIn__TwitterIdeator_CreateStep1__param } from './param_type.ts';
import { CreateStep1 as resolver } from '../../../../components/BfCurrentViewer/BfCurrentViewerLoggedIn/TwitterIdeator/CreateStep2.tsx';

const readerAst: ReaderAst<BfCurrentViewerLoggedIn__TwitterIdeator_CreateStep1__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
  },
];

const artifact: ComponentReaderArtifact<
  BfCurrentViewerLoggedIn__TwitterIdeator_CreateStep1__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  componentName: "BfCurrentViewerLoggedIn.TwitterIdeator_CreateStep1",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
